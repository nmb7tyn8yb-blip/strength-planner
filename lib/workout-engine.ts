// =====================================================================
//  WORKOUT ENGINE — свързва генераторите (чиста логика) с Supabase
//  (реални редове в scheduled_workouts / workout_sets).
//
//  Засега пълна поддръжка само за Starting Strength — останалите
//  програми ще се добавят по същия модел (всяка със свой adapter).
// =====================================================================

import { SupabaseClient } from "@supabase/supabase-js";
import {
  initStartingStrengthState,
  planSession,
  applySessionResult,
  toDbRows,
  type StartingStrengthState,
  type StartingStrengthSettings,
  type SessionResultInput,
  type LiftSlug,
} from "./starting-strength-generator";
import {
  initWendlerState,
  planWendlerLift,
  advanceWendlerWeek,
  type WendlerState,
  type WendlerSettings,
  type WendlerLift,
} from "./wendler-531-generator";

const EXERCISE_NAME_BY_SLUG: Record<LiftSlug, string> = {
  squat: "Клек",
  bench_press: "Лежанка",
  deadlift: "Мъртва тяга",
  overhead_press: "Военна преса",
};

const DEFAULT_SS_SETTINGS: StartingStrengthSettings = {
  roundingIncrementKg: 2.5,
  progressionStyle: "standard",
  deadliftFrequency: "every_other_session",
  barWeightKg: 20,
};

/** Официалната SS не смята по проценти — тук оценяваме безопасен старт
 *  от 1RM (Brzycki 5RM ≈ 89% + 10% запас ≈ 80% от 1RM). Преценка на
 *  приложението, не правило от оригинала (виж /calculate за пълния коментар). */
function safeStartingWeight(oneRepMaxKg: number, incrementKg: number): number {
  const estimatedFiveRM = oneRepMaxKg * (32 / 36);
  return Math.round((estimatedFiveRM * 0.9) / incrementKg) * incrementKg;
}

async function getExerciseIdMap(supabase: SupabaseClient): Promise<Record<LiftSlug, string>> {
  const { data, error } = await supabase
    .from("exercises")
    .select("id, name")
    .in("name", Object.values(EXERCISE_NAME_BY_SLUG));

  if (error || !data) throw new Error("Не успяхме да заредим каталога с упражнения.");

  const map = {} as Record<LiftSlug, string>;
  (Object.keys(EXERCISE_NAME_BY_SLUG) as LiftSlug[]).forEach((slug) => {
    const row = data.find((ex) => ex.name === EXERCISE_NAME_BY_SLUG[slug]);
    if (row) map[slug] = row.id;
  });
  return map;
}

async function insertScheduledSession(
  supabase: SupabaseClient,
  generatedPlanId: string,
  session: ReturnType<typeof planSession>,
  scheduledDate: string
) {
  const { workout, sets } = toDbRows(session, generatedPlanId, scheduledDate);
  const exerciseIdMap = await getExerciseIdMap(supabase);

  const { data: workoutRow, error: workoutError } = await supabase
    .from("scheduled_workouts")
    .insert(workout)
    .select()
    .single();

  if (workoutError || !workoutRow) throw new Error("Не успяхме да създадем тренировката.");

  const setsForDb = sets.map(({ exercise_slug, ...rest }) => ({
    ...rest,
    scheduled_workout_id: workoutRow.id,
    exercise_id: exerciseIdMap[exercise_slug],
  }));

  const { error: setsError } = await supabase.from("workout_sets").insert(setsForDb);
  if (setsError) throw new Error("Не успяхме да запазим сериите.");

  return workoutRow;
}

/** Извиква се веднъж, при създаване на плана (в /start). */
export async function createFirstStartingStrengthWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  oneRepMaxesKg: { squat: number; bench_press: number; deadlift: number; overhead_press: number },
  scheduledDate: string
) {
  const settings = DEFAULT_SS_SETTINGS;
  const state = initStartingStrengthState({
    squat: safeStartingWeight(oneRepMaxesKg.squat, settings.roundingIncrementKg),
    benchPress: safeStartingWeight(oneRepMaxesKg.bench_press, settings.roundingIncrementKg),
    deadlift: safeStartingWeight(oneRepMaxesKg.deadlift, settings.roundingIncrementKg),
    overheadPress: safeStartingWeight(oneRepMaxesKg.overhead_press, settings.roundingIncrementKg),
  });

  const session = planSession(state, settings);
  const workoutRow = await insertScheduledSession(supabase, generatedPlanId, session, scheduledDate);

  await supabase
    .from("generated_plans")
    .update({ settings: { ss_state: state, ss_settings: settings } })
    .eq("id", generatedPlanId);

  return workoutRow;
}

/** Извиква се след като потребителят приключи тренировка от /today. */
export async function completeStartingStrengthWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  scheduledWorkoutId: string,
  currentState: StartingStrengthState,
  settings: StartingStrengthSettings,
  results: SessionResultInput[],
  nextScheduledDate: string
) {
  const overallStatus = results.every((r) => r.allPrescribedSetsCompleted) ? "completed" : "partial";

  await supabase
    .from("scheduled_workouts")
    .update({ status: overallStatus })
    .eq("id", scheduledWorkoutId);

  const newState = applySessionResult(currentState, results, settings);
  const nextSession = planSession(newState, settings);
  const nextWorkoutRow = await insertScheduledSession(supabase, generatedPlanId, nextSession, nextScheduledDate);

  await supabase
    .from("generated_plans")
    .update({ settings: { ss_state: newState, ss_settings: settings } })
    .eq("id", generatedPlanId);

  return { newState, nextWorkoutRow };
}

/** Следваща не-последователна дата (прескача уикенда по избор опростено — просто +2 дни). */
export function nextTrainingDate(fromDateStr: string, daysAhead: number = 2): string {
  const d = new Date(fromDateStr);
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

// =====================================================================
//  WENDLER 5/3/1 — adapter
//
//  Ротация: Военна преса → Мъртва тяга → Лежанка → Клек (по разписанието
//  от оригинала: Пон/Вт/Чет/Пет). weekNumber е ОБЩ за четирите — напредва
//  само след пълен кръг от всичките 4 lift-а, не след всяка сесия.
//  Тренировъчният максимум се качва фиксирано след седмица 4 (deload),
//  еднакво за всички lift-ове — не зависи от AMRAP резултата в тази версия.
// =====================================================================

export const WENDLER_LIFT_ORDER: WendlerLift[] = ["overhead_press", "deadlift", "bench_press", "squat"];

const DEFAULT_WENDLER_SETTINGS: WendlerSettings = {
  roundingIncrementKg: 2.5,
  tmIncreaseUpperKg: 2.5,
  tmIncreaseLowerKg: 5,
  trainingMaxPercentOf1RM: 0.9,
};

export interface WendlerScheduleState extends WendlerState {
  nextLiftIndex: number; // 0-3, индекс в WENDLER_LIFT_ORDER
}

async function insertWendlerSession(
  supabase: SupabaseClient,
  generatedPlanId: string,
  lift: WendlerLift,
  weekNumber: number,
  cycleNumber: number,
  sets: ReturnType<typeof planWendlerLift>,
  scheduledDate: string
) {
  const exerciseIdMap = await getExerciseIdMap(supabase);

  const { data: workoutRow, error: workoutError } = await supabase
    .from("scheduled_workouts")
    .insert({
      generated_plan_id: generatedPlanId,
      scheduled_date: scheduledDate,
      session_name: `Цикъл ${cycleNumber}, седмица ${weekNumber} — ${EXERCISE_NAME_BY_SLUG[lift]}`,
      status: "planned",
      is_deload: weekNumber === 4,
      estimated_duration_minutes: 40,
    })
    .select()
    .single();

  if (workoutError || !workoutRow) throw new Error("Не успяхме да създадем тренировката.");

  const setsForDb = sets.map((s, i) => ({
    scheduled_workout_id: workoutRow.id,
    exercise_id: exerciseIdMap[lift],
    order_index: i,
    set_number: i + 1,
    set_type: s.isAmrap ? "amrap" : "working",
    planned_weight: s.weightKg,
    planned_reps: s.reps,
    planned_rest_seconds: 180,
  }));

  const { error: setsError } = await supabase.from("workout_sets").insert(setsForDb);
  if (setsError) throw new Error("Не успяхме да запазим сериите.");

  return workoutRow;
}

/** Извиква се веднъж, при създаване на плана (в /start). */
export async function createFirstWendlerWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  oneRepMaxesKg: Record<WendlerLift, number>,
  scheduledDate: string
) {
  const settings = DEFAULT_WENDLER_SETTINGS;
  const baseState = initWendlerState(oneRepMaxesKg, settings);
  const state: WendlerScheduleState = { ...baseState, nextLiftIndex: 0 };

  const lift = WENDLER_LIFT_ORDER[0];
  const sets = planWendlerLift(lift, baseState, settings);
  const workoutRow = await insertWendlerSession(
    supabase,
    generatedPlanId,
    lift,
    state.weekNumber,
    state.cycleNumber,
    sets,
    scheduledDate
  );

  await supabase
    .from("generated_plans")
    .update({ settings: { wendler_state: state, wendler_settings: settings } })
    .eq("id", generatedPlanId);

  return workoutRow;
}

/** Извиква се след като потребителят приключи сесия от /today. */
export async function completeWendlerWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  scheduledWorkoutId: string,
  state: WendlerScheduleState,
  settings: WendlerSettings,
  allNonAmrapSetsCompleted: boolean,
  nextScheduledDate: string
) {
  await supabase
    .from("scheduled_workouts")
    .update({ status: allNonAmrapSetsCompleted ? "completed" : "partial" })
    .eq("id", scheduledWorkoutId);

  const newLiftIndex = (state.nextLiftIndex + 1) % WENDLER_LIFT_ORDER.length;
  const baseState: WendlerState = {
    cycleNumber: state.cycleNumber,
    weekNumber: state.weekNumber,
    trainingMaxKg: state.trainingMaxKg,
  };

  // напредва седмицата само след пълен кръг (всичките 4 lift-а изиграни)
  const newBaseState = newLiftIndex === 0 ? advanceWendlerWeek(baseState, settings) : baseState;
  const newState: WendlerScheduleState = { ...newBaseState, nextLiftIndex: newLiftIndex };

  const nextLift = WENDLER_LIFT_ORDER[newLiftIndex];
  const nextSets = planWendlerLift(nextLift, newBaseState, settings);
  const nextWorkoutRow = await insertWendlerSession(
    supabase,
    generatedPlanId,
    nextLift,
    newBaseState.weekNumber,
    newBaseState.cycleNumber,
    nextSets,
    nextScheduledDate
  );

  await supabase
    .from("generated_plans")
    .update({ settings: { wendler_state: newState, wendler_settings: settings } })
    .eq("id", generatedPlanId);

  return { newState, nextWorkoutRow };
}

// =====================================================================
//  HEPBURN POWER ROUTINE A — adapter
//
//  Класическо разписание: Пон/Чет = Клек+Лежанка, Вт/Пет = Тяга+Преса.
//  Прогресията е СЕДМИЧНА — всяко вдигане се тренира 2 пъти на същата
//  схема, преди да напредне. Затова всеки lift пази собствен брояч
//  "sessionsAtCurrentScheme"; на 2-рата успешна сесия схемата напредва.
// =====================================================================

import {
  planHepburnLift,
  generateHepburnWarmup,
  applyHepburnResult as applyHepburnSchemeResult,
  DEFAULT_HEPBURN_INCREMENTS_KG,
  type HepburnSettings,
  type HepburnLift,
  type HepburnLiftState,
} from "./hepburn-generator";

export interface HepburnLiftScheduleState extends HepburnLiftState {
  sessionsAtCurrentScheme: number; // 0 или 1 — на 2 напредва схемата
}

export interface HepburnScheduleState {
  liftStates: Record<HepburnLift, HepburnLiftScheduleState>;
  dayIndex: number; // 0=Пон(Клек+Лежанка) 1=Вт(Тяга+Преса) 2=Чет(Клек+Лежанка) 3=Пет(Тяга+Преса)
}

const HEPBURN_DAY_PAIRS: HepburnLift[][] = [
  ["squat", "bench_press"],
  ["deadlift", "overhead_press"],
  ["squat", "bench_press"],
  ["deadlift", "overhead_press"],
];
const HEPBURN_DAY_OFFSETS = [1, 2, 1, 3]; // дни до следващата сесия от текущия dayIndex

const DEFAULT_HEPBURN_SETTINGS: HepburnSettings = {
  roundingIncrementKg: 2.5,
  barWeightKg: 20,
  failureThreshold: 3,
};

function updateHepburnLiftWeekly(
  state: HepburnLiftScheduleState,
  allSetsCompleted: boolean,
  lift: HepburnLift,
  settings: HepburnSettings
): { newState: HepburnLiftScheduleState; needsUserDecision: boolean } {
  if (!allSetsCompleted) {
    const result = applyHepburnSchemeResult(state, false, lift, settings);
    return {
      newState: { ...result.newState, sessionsAtCurrentScheme: state.sessionsAtCurrentScheme },
      needsUserDecision: result.needsUserDecision,
    };
  }

  const sessionsDone = state.sessionsAtCurrentScheme + 1;
  if (sessionsDone < 2) {
    return { newState: { ...state, sessionsAtCurrentScheme: sessionsDone }, needsUserDecision: false };
  }

  // втора успешна сесия на тази схема тази седмица → напредва
  const result = applyHepburnSchemeResult(
    { workingWeightKg: state.workingWeightKg, schemeIndex: state.schemeIndex, consecutiveFailures: 0 },
    true,
    lift,
    settings
  );
  return { newState: { ...result.newState, sessionsAtCurrentScheme: 0 }, needsUserDecision: false };
}

async function insertHepburnSession(
  supabase: SupabaseClient,
  generatedPlanId: string,
  lifts: HepburnLift[],
  liftStates: Record<HepburnLift, HepburnLiftScheduleState>,
  settings: HepburnSettings,
  scheduledDate: string
) {
  const exerciseIdMap = await getExerciseIdMap(supabase);
  const liftNames = lifts.map((l) => EXERCISE_NAME_BY_SLUG[l]).join(" + ");

  const { data: workoutRow, error: workoutError } = await supabase
    .from("scheduled_workouts")
    .insert({
      generated_plan_id: generatedPlanId,
      scheduled_date: scheduledDate,
      session_name: liftNames,
      status: "planned",
      is_deload: false,
      estimated_duration_minutes: 50,
    })
    .select()
    .single();

  if (workoutError || !workoutRow) throw new Error("Не успяхме да създадем тренировката.");

  let orderIndex = 0;
  const setsForDb: any[] = [];

  for (const lift of lifts) {
    const liftState = liftStates[lift];
    const warmup = generateHepburnWarmup(liftState.workingWeightKg, settings);
    const workingSets = planHepburnLift(liftState);

    warmup.forEach((w, i) => {
      setsForDb.push({
        scheduled_workout_id: workoutRow.id,
        exercise_id: exerciseIdMap[lift],
        order_index: orderIndex++,
        set_number: i + 1,
        set_type: "warmup",
        planned_weight: w.weightKg,
        planned_reps: w.reps,
        planned_rest_seconds: 60,
      });
    });

    workingSets.forEach((s, i) => {
      setsForDb.push({
        scheduled_workout_id: workoutRow.id,
        exercise_id: exerciseIdMap[lift],
        order_index: orderIndex++,
        set_number: i + 1,
        set_type: "working",
        planned_weight: s.weightKg,
        planned_reps: s.reps,
        planned_rest_seconds: 120,
      });
    });
  }

  const { error: setsError } = await supabase.from("workout_sets").insert(setsForDb);
  if (setsError) throw new Error("Не успяхме да запазим сериите.");

  return workoutRow;
}

/** Извиква се веднъж, при създаване на плана (в /start). */
export async function createFirstHepburnWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  oneRepMaxesKg: Record<HepburnLift, number>,
  scheduledDate: string
) {
  const settings = DEFAULT_HEPBURN_SETTINGS;

  // Началната тежест ~80% от 1RM Е документирана в оригинала (Muscle & Strength)
  const liftStates = {} as Record<HepburnLift, HepburnLiftScheduleState>;
  (Object.keys(oneRepMaxesKg) as HepburnLift[]).forEach((lift) => {
    const startWeight =
      Math.round((oneRepMaxesKg[lift] * 0.8) / settings.roundingIncrementKg) * settings.roundingIncrementKg;
    liftStates[lift] = { workingWeightKg: startWeight, schemeIndex: 1, consecutiveFailures: 0, sessionsAtCurrentScheme: 0 };
  });

  const state: HepburnScheduleState = { liftStates, dayIndex: 0 };
  const lifts = HEPBURN_DAY_PAIRS[0];
  const workoutRow = await insertHepburnSession(supabase, generatedPlanId, lifts, liftStates, settings, scheduledDate);

  await supabase
    .from("generated_plans")
    .update({ settings: { hepburn_state: state, hepburn_settings: settings } })
    .eq("id", generatedPlanId);

  return workoutRow;
}

/** Извиква се след като потребителят приключи сесия от /today. */
export async function completeHepburnWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  scheduledWorkoutId: string,
  state: HepburnScheduleState,
  settings: HepburnSettings,
  resultsByLift: Record<HepburnLift, boolean>, // lift -> дали всички серии са изпълнени
  nextScheduledDate: string
) {
  const allSuccess = Object.values(resultsByLift).every(Boolean);

  await supabase
    .from("scheduled_workouts")
    .update({ status: allSuccess ? "completed" : "partial" })
    .eq("id", scheduledWorkoutId);

  const newLiftStates = { ...state.liftStates };
  (Object.keys(resultsByLift) as HepburnLift[]).forEach((lift) => {
    const { newState } = updateHepburnLiftWeekly(state.liftStates[lift], resultsByLift[lift], lift, settings);
    newLiftStates[lift] = newState;
  });

  const newDayIndex = (state.dayIndex + 1) % 4;
  const newState: HepburnScheduleState = { liftStates: newLiftStates, dayIndex: newDayIndex };

  const nextLifts = HEPBURN_DAY_PAIRS[newDayIndex];
  const nextWorkoutRow = await insertHepburnSession(
    supabase,
    generatedPlanId,
    nextLifts,
    newLiftStates,
    settings,
    nextScheduledDate
  );

  await supabase
    .from("generated_plans")
    .update({ settings: { hepburn_state: newState, hepburn_settings: settings } })
    .eq("id", generatedPlanId);

  return { newState, nextWorkoutRow };
}

export function hepburnDayOffset(dayIndex: number): number {
  return HEPBURN_DAY_OFFSETS[dayIndex];
}
