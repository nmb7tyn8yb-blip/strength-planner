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
  planFSLSets,
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
    const row = data.find((ex: { id: string; name: string }) => ex.name === EXERCISE_NAME_BY_SLUG[slug]);
    if (row) map[slug] = row.id;
  });
  return map;
}

async function getAccessoryExerciseId(supabase: SupabaseClient, name: string): Promise<string | null> {
  const { data } = await supabase.from("exercises").select("id").eq("name", name).single();
  return data?.id ?? null;
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

  const setsForDb: any[] = sets.map(({ exercise_slug, ...rest }) => ({
    ...rest,
    scheduled_workout_id: workoutRow.id,
    exercise_id: exerciseIdMap[exercise_slug],
    is_amrap: false,
    is_paused: false,
  }));

  // В дните без мъртва тяга добавяме набирания — реалната SS програма не
  // просто пропуска дърпащо движение, а го замества (виж оригиналния текст,
  // фаза 2/3: "Обръщане" се редува с тягата в тренировка А).
  const hasDeadlift = session.exercises.some((e) => e.exerciseSlug === "deadlift");
  if (!hasDeadlift) {
    const pullUpId = await getAccessoryExerciseId(supabase, "Набирания");
    if (pullUpId) {
      const startIndex = setsForDb.length;
      for (let i = 0; i < 3; i++) {
        setsForDb.push({
          scheduled_workout_id: workoutRow.id,
          exercise_id: pullUpId,
          order_index: startIndex + i,
          set_number: i + 1,
          set_type: "amrap",
          planned_weight: 0,
          planned_reps: 6,
          is_amrap: true,
          is_paused: false,
          planned_rest_seconds: 90,
        });
      }
    }
  }

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
      estimated_duration_minutes: weekNumber === 4 ? 40 : 55,
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
  const sets = [...planWendlerLift(lift, baseState, settings), ...planFSLSets(lift, baseState, settings)];
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
  const nextSets = [...planWendlerLift(nextLift, newBaseState, settings), ...planFSLSets(nextLift, newBaseState, settings)];
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
//  Схемата напредва на ВСЯКА следваща успешна тренировка (1×3+7×2 →
//  2×3+6×2 → ... → 8×3 → +тежест) — независимо кой ден е, не изисква
//  повторение на същата схема.
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
  const result = applyHepburnSchemeResult(state, allSetsCompleted, lift, settings);
  return { newState: { ...result.newState, sessionsAtCurrentScheme: 0 }, needsUserDecision: result.needsUserDecision };
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

// =====================================================================
//  TEXAS METHOD — adapter
//
//  Седмичен цикъл от 3 типа дни: обемен (Клек+тежък lift+Тяга) →
//  възстановителен (Клек леко+лек lift) → интензивен (Клек+тежък lift,
//  нов PR опит). Тягата се променя само в понеделник; клек/бенч/преса
//  се преизчисляват от последния петъчен PR всяка седмица.
// =====================================================================

import {
  planVolumeDay,
  planRecoveryDay,
  planIntensityDay,
  applyDeadliftResult,
  applyIntensityDayResult,
  type TexasMethodState,
  type TexasMethodSettings,
  type TexasUpperLift,
} from "./texas-method-generator";

export type TexasDayType = "volume" | "recovery" | "intensity";

export interface TexasScheduleState {
  texasState: TexasMethodState;
  dayType: TexasDayType;
}

const DEFAULT_TEXAS_SETTINGS: TexasMethodSettings = {
  roundingIncrementKg: 2.5,
  volumeDayPercentOfFriday: 0.9,
  recoveryDayPercentOfMonday: 0.8,
  fridayIncrementUpperKg: 1.25,
  fridayIncrementSquatKg: 2.5,
  deadliftWeeklyIncrementKg: 2.5,
};

const TEXAS_DAY_OFFSETS: Record<TexasDayType, number> = { volume: 2, recovery: 2, intensity: 3 };

async function insertTexasSession(
  supabase: SupabaseClient,
  generatedPlanId: string,
  dayType: TexasDayType,
  weekNumber: number,
  entries: { lift: LiftSlug; weightKg: number; reps: number; isPrAttempt?: boolean }[],
  scheduledDate: string
) {
  const exerciseIdMap = await getExerciseIdMap(supabase);
  const dayLabel = { volume: "Обемен ден", recovery: "Възстановителен ден", intensity: "Интензивен ден" }[dayType];
  const liftNames = [...new Set(entries.map((e) => EXERCISE_NAME_BY_SLUG[e.lift]))].join(" + ");

  const { data: workoutRow, error: workoutError } = await supabase
    .from("scheduled_workouts")
    .insert({
      generated_plan_id: generatedPlanId,
      scheduled_date: scheduledDate,
      session_name: `${dayLabel} (седмица ${weekNumber}) — ${liftNames}`,
      status: "planned",
      is_deload: false,
      estimated_duration_minutes: dayType === "volume" ? 70 : dayType === "recovery" ? 45 : 40,
    })
    .select()
    .single();

  if (workoutError || !workoutRow) throw new Error("Не успяхме да създадем тренировката.");

  let orderIndex = 0;
  const setsForDb = entries.map((e) => ({
    scheduled_workout_id: workoutRow.id,
    exercise_id: exerciseIdMap[e.lift],
    order_index: orderIndex++,
    set_number: orderIndex,
    set_type: "working",
    planned_weight: e.weightKg,
    planned_reps: e.reps,
    planned_rest_seconds: dayType === "intensity" ? 300 : dayType === "volume" ? 240 : 150,
    is_amrap: false,
    is_paused: false,
  }));

  const { error: setsError } = await supabase.from("workout_sets").insert(setsForDb);
  if (setsError) throw new Error("Не успяхме да запазим сериите.");

  // Помощни упражнения по оригиналното разписание: сряда — набирания +
  // хиперекстензии; петък — обръщане (good morning)
  const accessoryRows: any[] = [];
  if (dayType === "recovery") {
    const pullUpId = await getAccessoryExerciseId(supabase, "Набирания");
    const hyperextId = await getAccessoryExerciseId(supabase, "Хиперекстензии");
    if (pullUpId) {
      for (let i = 0; i < 3; i++) {
        accessoryRows.push({
          scheduled_workout_id: workoutRow.id,
          exercise_id: pullUpId,
          order_index: orderIndex++,
          set_number: i + 1,
          set_type: "amrap",
          planned_weight: 0,
          planned_reps: 8,
          is_amrap: true,
          is_paused: false,
          planned_rest_seconds: 90,
        });
      }
    }
    if (hyperextId) {
      for (let i = 0; i < 3; i++) {
        accessoryRows.push({
          scheduled_workout_id: workoutRow.id,
          exercise_id: hyperextId,
          order_index: orderIndex++,
          set_number: i + 1,
          set_type: "working",
          planned_weight: 0,
          planned_reps: 10,
          is_amrap: false,
          is_paused: false,
          planned_rest_seconds: 60,
        });
      }
    }
  } else if (dayType === "intensity") {
    const goodMorningId = await getAccessoryExerciseId(supabase, "Обръщане");
    if (goodMorningId) {
      for (let i = 0; i < 5; i++) {
        accessoryRows.push({
          scheduled_workout_id: workoutRow.id,
          exercise_id: goodMorningId,
          order_index: orderIndex++,
          set_number: i + 1,
          set_type: "working",
          planned_weight: 0,
          planned_reps: 3,
          is_amrap: false,
          is_paused: false,
          planned_rest_seconds: 90,
        });
      }
    }
  }

  if (accessoryRows.length > 0) {
    const { error: accessoryError } = await supabase.from("workout_sets").insert(accessoryRows);
    if (accessoryError) throw new Error("Не успяхме да запазим помощните упражнения.");
  }

  return workoutRow;
}

function buildTexasEntries(
  dayType: TexasDayType,
  texasState: TexasMethodState,
  settings: TexasMethodSettings
): { lift: LiftSlug; weightKg: number; reps: number }[] {
  if (dayType === "volume") {
    const plan = planVolumeDay(texasState, settings);
    return [
      ...plan.squat.map((s) => ({ lift: "squat" as LiftSlug, weightKg: s.weightKg, reps: s.reps })),
      ...plan.heavyUpperLift.sets.map((s) => ({ lift: plan.heavyUpperLift.lift as LiftSlug, weightKg: s.weightKg, reps: s.reps })),
      { lift: "deadlift" as LiftSlug, weightKg: texasState.currentDeadliftKg, reps: 5 },
    ];
  }
  if (dayType === "recovery") {
    const plan = planRecoveryDay(texasState, settings);
    return [
      ...plan.squat.map((s) => ({ lift: "squat" as LiftSlug, weightKg: s.weightKg, reps: s.reps })),
      ...plan.lightUpperLift.sets.map((s) => ({ lift: plan.lightUpperLift.lift as LiftSlug, weightKg: s.weightKg, reps: s.reps })),
    ];
  }
  const plan = planIntensityDay(texasState, settings);
  return [
    { lift: "squat", weightKg: plan.squat.weightKg, reps: plan.squat.reps },
    { lift: plan.upperLift.lift as LiftSlug, weightKg: plan.upperLift.set.weightKg, reps: plan.upperLift.set.reps },
  ];
}

/** Извиква се веднъж, при създаване на плана (в /start). */
export async function createFirstTexasWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  startingWeightsKg: { squat: number; benchPress: number; overheadPress: number; deadlift: number },
  scheduledDate: string
) {
  const settings = DEFAULT_TEXAS_SETTINGS;
  const texasState: TexasMethodState = {
    weekNumber: 1,
    upperLiftThisWeek: "bench_press",
    lastFridaySquatKg: startingWeightsKg.squat,
    lastHeavyUpperKg: {
      bench_press: startingWeightsKg.benchPress,
      overhead_press: startingWeightsKg.overheadPress,
    },
    currentDeadliftKg: startingWeightsKg.deadlift,
  };
  const state: TexasScheduleState = { texasState, dayType: "volume" };

  const entries = buildTexasEntries("volume", texasState, settings);
  const workoutRow = await insertTexasSession(supabase, generatedPlanId, "volume", texasState.weekNumber, entries, scheduledDate);

  await supabase
    .from("generated_plans")
    .update({ settings: { texas_state: state, texas_settings: settings } })
    .eq("id", generatedPlanId);

  return workoutRow;
}

/** Извиква се след като потребителят приключи сесия от /today. */
export async function completeTexasWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  scheduledWorkoutId: string,
  state: TexasScheduleState,
  settings: TexasMethodSettings,
  results: { squatAchieved: boolean; upperLiftAchieved: boolean; deadliftAchieved?: boolean },
  attemptedWeights: { squat: number; upperLift: number },
  nextScheduledDate: string
) {
  const overallSuccess =
    results.squatAchieved && results.upperLiftAchieved && (results.deadliftAchieved ?? true);

  await supabase
    .from("scheduled_workouts")
    .update({ status: overallSuccess ? "completed" : "partial" })
    .eq("id", scheduledWorkoutId);

  let newTexasState = state.texasState;
  let nextDayType: TexasDayType = "recovery";

  if (state.dayType === "volume") {
    if (results.deadliftAchieved !== undefined) {
      newTexasState = applyDeadliftResult(newTexasState, results.deadliftAchieved, settings);
    }
    nextDayType = "recovery";
  } else if (state.dayType === "recovery") {
    nextDayType = "intensity";
  } else {
    newTexasState = applyIntensityDayResult(
      newTexasState,
      { squatAchieved: results.squatAchieved, upperLiftAchieved: results.upperLiftAchieved },
      attemptedWeights
    );
    nextDayType = "volume";
  }

  const newState: TexasScheduleState = { texasState: newTexasState, dayType: nextDayType };
  const nextEntries = buildTexasEntries(nextDayType, newTexasState, settings);
  const nextWorkoutRow = await insertTexasSession(
    supabase,
    generatedPlanId,
    nextDayType,
    newTexasState.weekNumber,
    nextEntries,
    nextScheduledDate
  );

  await supabase
    .from("generated_plans")
    .update({ settings: { texas_state: newState, texas_settings: settings } })
    .eq("id", generatedPlanId);

  return { newState, nextWorkoutRow };
}

export function texasDayOffset(dayType: TexasDayType): number {
  return TEXAS_DAY_OFFSETS[dayType];
}

// =====================================================================
//  СУРОВЕЦКИЙ (Система №1 → №2 → нов максимум → пак №1) — adapter
//
//  Само лежанка, табличен движок (table-driven-engine.ts). Тренировки
//  12 (Сис.№1) / 6 (Сис.№2), последната от всеки цикъл е тест за нов
//  максимум ("проходка") — изисква потребителят да въведе реално
//  постигнатия резултат, не просто повторения.
// =====================================================================

import {
  planTableSession,
  advanceTableSession,
  initTableEngineState,
  type ProgramTable,
  type TableEngineState,
} from "./table-driven-engine";
import { surovetskySystem1, surovetskySystem2 } from "./surovetsky-tables";

const SUROVETSKY_TABLES: Record<string, ProgramTable> = {
  "surovetsky-1": surovetskySystem1,
  "surovetsky-2": surovetskySystem2,
};
const SUROVETSKY_ROUNDING_KG = 2.5;
const SUROVETSKY_DAY_OFFSETS = [2, 2, 3]; // Пон→Ср, Ср→Пет, Пет→следващ Пон

async function insertSurovetskySession(
  supabase: SupabaseClient,
  generatedPlanId: string,
  table: ProgramTable,
  state: TableEngineState,
  scheduledDate: string
) {
  const { session, sets } = planTableSession(table, state, SUROVETSKY_ROUNDING_KG);
  const exerciseIdMap = await getExerciseIdMap(supabase);

  const { data: workoutRow, error: workoutError } = await supabase
    .from("scheduled_workouts")
    .insert({
      generated_plan_id: generatedPlanId,
      scheduled_date: scheduledDate,
      session_name: `${table.name} — ${session.name}`,
      status: "planned",
      is_max_test: !!session.isMaxTest,
      estimated_duration_minutes: session.isMaxTest ? 60 : 50,
    })
    .select()
    .single();

  if (workoutError || !workoutRow) throw new Error("Не успяхме да създадем тренировката.");

  const setsForDb = sets.map((s, i) => ({
    scheduled_workout_id: workoutRow.id,
    exercise_id: exerciseIdMap["bench_press" as LiftSlug],
    order_index: i,
    set_number: i + 1,
    set_type: s.label === "загряване" ? "warmup" : s.label === "проходка" ? "test" : "working",
    planned_weight: s.weightKg,
    planned_reps: s.reps,
    is_amrap: s.isAmrap,
    is_paused: s.isPausedRep,
    planned_rest_seconds: s.weightKg > 0 ? Math.round(60 + (s.weightKg / (state.currentMaxKg || 1)) * 300) : 90,
  }));

  const { error: setsError } = await supabase.from("workout_sets").insert(setsForDb);
  if (setsError) throw new Error("Не успяхме да запазим сериите.");

  // Опционална добавка на приложението (не от оригинала): леко гребане за
  // баланс на раменния пояс след месеци само на лежанка. Авторът изрично
  // забранява само трицепс/делти — гребането не засяга тях.
  if (!session.isMaxTest) {
    const rowId = await getAccessoryExerciseId(supabase, "Гребане");
    if (rowId) {
      const rowRows = Array.from({ length: 2 }, (_, i) => ({
        scheduled_workout_id: workoutRow.id,
        exercise_id: rowId,
        order_index: setsForDb.length + i,
        set_number: i + 1,
        set_type: "working",
        planned_weight: 0,
        planned_reps: 10,
        planned_rest_seconds: 60,
      }));
      const { error: rowError } = await supabase.from("workout_sets").insert(rowRows);
      if (rowError) throw new Error("Не успяхме да запазим опционалното гребане.");
    }
  }

  return workoutRow;
}

/** Извиква се веднъж, при създаване на плана (в /start). */
export async function createFirstSurovetskyWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  benchOneRepMaxKg: number,
  scheduledDate: string
) {
  const state = initTableEngineState("surovetsky-1", benchOneRepMaxKg);
  const workoutRow = await insertSurovetskySession(supabase, generatedPlanId, surovetskySystem1, state, scheduledDate);

  await supabase.from("generated_plans").update({ settings: { surovetsky_state: state } }).eq("id", generatedPlanId);

  return workoutRow;
}

/** Извиква се след като потребителят приключи тренировка от /today.
 *  confirmedNewMaxKg е задължителен само ако тренировката е тест ("проходка"). */
export async function completeSurovetskyWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  scheduledWorkoutId: string,
  state: TableEngineState,
  nextScheduledDate: string,
  confirmedNewMaxKg?: number
) {
  await supabase.from("scheduled_workouts").update({ status: "completed" }).eq("id", scheduledWorkoutId);

  const currentTable = SUROVETSKY_TABLES[state.tableSlug];
  const newState = advanceTableSession(currentTable, state, confirmedNewMaxKg);
  const nextTable = SUROVETSKY_TABLES[newState.tableSlug];

  const nextWorkoutRow = await insertSurovetskySession(supabase, generatedPlanId, nextTable, newState, nextScheduledDate);

  await supabase.from("generated_plans").update({ settings: { surovetsky_state: newState } }).eq("id", generatedPlanId);

  return { newState, nextWorkoutRow };
}

export function surovetskyDayOffset(sessionIndexInCycle: number): number {
  return SUROVETSKY_DAY_OFFSETS[sessionIndexInCycle % 3];
}

// =====================================================================
//  JUGGERNAUT — adapter (и двата варианта: класически 16-седмичен и
//  опростен Excel 12-седмичен)
//
//  4 вдигания, ротация по ред (Преса→Тяга→Бенч→Клек, като при 5/3/1).
//  Вълна/седмица е ОБЩА (всички lift-ове минават през нея заедно), но
//  TM се качва САМО за конкретното вдигане, на неговата собствена
//  реализационна/AMRAP седмица — не за всичките наведнъж.
// =====================================================================

import {
  initJuggernautClassicState,
  planJuggernautWeek,
  advanceJuggernautWeek,
  type JuggernautClassicState,
  type JuggernautClassicSettings,
  type JuggernautLift,
} from "./juggernaut-classic-generator";
import {
  initJuggernautExcelState,
  planJuggernautExcelWeek,
  advanceJuggernautExcelWeek,
  calculateTmBump,
  DEFAULT_JUGGERNAUT_EXCEL_SETTINGS,
  type JuggernautExcelState,
  type JuggernautExcelSettings,
  type WaveName,
} from "./juggernaut-excel-generator";

const JUGGERNAUT_LIFT_ORDER: JuggernautLift[] = ["overhead_press", "deadlift", "bench_press", "squat"];
const WAVE_NAMES: WaveName[] = ["10s", "8s", "5s", "3s"];

const DEFAULT_JUGGERNAUT_CLASSIC_SETTINGS: JuggernautClassicSettings = {
  roundingIncrementKg: 2.5,
  trainingMaxPercentOf1RM: 0.9,
  progressionStyle: "standard",
};

export interface JuggernautScheduleState {
  waveIndex: number;
  weekNumber: number; // 1-4 (класически) или 1-3 (Excel)
  tmKg: Record<JuggernautLift, number>;
  nextLiftIndex: number;
}

// ---------------------------------------------------------------------
// КЛАСИЧЕСКИ ВАРИАНТ
// ---------------------------------------------------------------------

// Помощни упражнения за Juggernaut — ОРИГИНАЛЪТ не дава точна схема тук,
// това е разумна добавка на приложението (не буквално правило): push ден
// (бенч/преса) получава дърпащо движение за баланс, squat/deadlift ден
// получава леко упражнение за раменен пояс, което не преуморява вече
// натоварените мускули.
function getJuggernautAccessoryPlan(lift: JuggernautLift): { exerciseName: string; sets: number; reps: number } {
  if (lift === "bench_press" || lift === "overhead_press") {
    return { exerciseName: "Гребане", sets: 3, reps: 10 };
  }
  return { exerciseName: "Задно рамо", sets: 3, reps: 12 };
}

async function insertJuggernautAccessory(
  supabase: SupabaseClient,
  workoutId: string,
  lift: JuggernautLift,
  startOrderIndex: number
) {
  const accessory = getJuggernautAccessoryPlan(lift);
  const accessoryId = await getAccessoryExerciseId(supabase, accessory.exerciseName);
  if (!accessoryId) return;

  const rows = Array.from({ length: accessory.sets }, (_, i) => ({
    scheduled_workout_id: workoutId,
    exercise_id: accessoryId,
    order_index: startOrderIndex + i,
    set_number: i + 1,
    set_type: "working",
    planned_weight: 0,
    planned_reps: accessory.reps,
    planned_rest_seconds: 60,
  }));

  const { error } = await supabase.from("workout_sets").insert(rows);
  if (error) throw new Error("Не успяхме да запазим помощните упражнения.");
}

async function insertJuggernautClassicSession(
  supabase: SupabaseClient,
  generatedPlanId: string,
  lift: JuggernautLift,
  state: JuggernautScheduleState,
  scheduledDate: string
) {
  const wave = WAVE_NAMES[state.waveIndex];
  const sets = planJuggernautWeek(lift, { waveIndex: state.waveIndex, weekNumber: state.weekNumber as any, tmKg: state.tmKg }, DEFAULT_JUGGERNAUT_CLASSIC_SETTINGS);
  const exerciseIdMap = await getExerciseIdMap(supabase);

  const { data: workoutRow, error: workoutError } = await supabase
    .from("scheduled_workouts")
    .insert({
      generated_plan_id: generatedPlanId,
      scheduled_date: scheduledDate,
      session_name: `Вълна ${wave}, седмица ${state.weekNumber} — ${EXERCISE_NAME_BY_SLUG[lift]}`,
      status: "planned",
      is_deload: state.weekNumber === 4,
      estimated_duration_minutes: 50,
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
    is_amrap: s.isAmrap,
    planned_rest_seconds: 180,
  }));

  const { error: setsError } = await supabase.from("workout_sets").insert(setsForDb);
  if (setsError) throw new Error("Не успяхме да запазим сериите.");

  await insertJuggernautAccessory(supabase, workoutRow.id, lift, setsForDb.length);

  return workoutRow;
}

export async function createFirstJuggernautClassicWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  oneRepMaxesKg: Record<JuggernautLift, number>,
  scheduledDate: string
) {
  const base = initJuggernautClassicState(oneRepMaxesKg, DEFAULT_JUGGERNAUT_CLASSIC_SETTINGS);
  const state: JuggernautScheduleState = { waveIndex: base.waveIndex, weekNumber: base.weekNumber, tmKg: base.tmKg, nextLiftIndex: 0 };

  const lift = JUGGERNAUT_LIFT_ORDER[0];
  const workoutRow = await insertJuggernautClassicSession(supabase, generatedPlanId, lift, state, scheduledDate);

  await supabase
    .from("generated_plans")
    .update({ settings: { juggernaut_state: state, juggernaut_variant: "classic" } })
    .eq("id", generatedPlanId);

  return workoutRow;
}

export async function completeJuggernautClassicWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  scheduledWorkoutId: string,
  state: JuggernautScheduleState,
  amrapRepsAchieved: number | undefined, // подава се само ако седмицата за тази вдигана е 3 (реализация)
  nextScheduledDate: string
) {
  const lift = JUGGERNAUT_LIFT_ORDER[state.nextLiftIndex];

  await supabase.from("scheduled_workouts").update({ status: "completed" }).eq("id", scheduledWorkoutId);

  // TM бонус САМО за тази вдигана, ако е нейната 3-та седмица
  let updatedTmKg = state.tmKg;
  if (state.weekNumber === 3 && amrapRepsAchieved !== undefined) {
    const bumped = advanceJuggernautWeek(
      lift,
      { waveIndex: state.waveIndex, weekNumber: 3, tmKg: state.tmKg },
      DEFAULT_JUGGERNAUT_CLASSIC_SETTINGS,
      amrapRepsAchieved
    );
    updatedTmKg = bumped.tmKg;
  }

  const newLiftIndex = (state.nextLiftIndex + 1) % JUGGERNAUT_LIFT_ORDER.length;
  let newWaveIndex = state.waveIndex;
  let newWeekNumber = state.weekNumber;

  if (newLiftIndex === 0) {
    // пълен кръг от 4-те вдигания → напредва седмицата/вълната (без TM бонус тук)
    const advanced = advanceJuggernautWeek(
      lift,
      { waveIndex: state.waveIndex, weekNumber: state.weekNumber as any, tmKg: updatedTmKg },
      DEFAULT_JUGGERNAUT_CLASSIC_SETTINGS
    );
    newWaveIndex = advanced.waveIndex;
    newWeekNumber = advanced.weekNumber;
  }

  const newState: JuggernautScheduleState = {
    waveIndex: newWaveIndex,
    weekNumber: newWeekNumber,
    tmKg: updatedTmKg,
    nextLiftIndex: newLiftIndex,
  };

  const nextLift = JUGGERNAUT_LIFT_ORDER[newLiftIndex];
  const nextWorkoutRow = await insertJuggernautClassicSession(supabase, generatedPlanId, nextLift, newState, nextScheduledDate);

  await supabase
    .from("generated_plans")
    .update({ settings: { juggernaut_state: newState, juggernaut_variant: "classic" } })
    .eq("id", generatedPlanId);

  return { newState, nextWorkoutRow };
}

// ---------------------------------------------------------------------
// EXCEL ВАРИАНТ (опростен, 12 седмици)
// ---------------------------------------------------------------------

async function insertJuggernautExcelSession(
  supabase: SupabaseClient,
  generatedPlanId: string,
  lift: JuggernautLift,
  state: JuggernautScheduleState,
  scheduledDate: string
) {
  const wave = WAVE_NAMES[state.waveIndex];
  const sets = planJuggernautExcelWeek(lift, { waveIndex: state.waveIndex, weekInWave: state.weekNumber as any, tmKg: state.tmKg }, DEFAULT_JUGGERNAUT_EXCEL_SETTINGS);
  const exerciseIdMap = await getExerciseIdMap(supabase);

  const { data: workoutRow, error: workoutError } = await supabase
    .from("scheduled_workouts")
    .insert({
      generated_plan_id: generatedPlanId,
      scheduled_date: scheduledDate,
      session_name: `Вълна ${wave}, седмица ${state.weekNumber} — ${EXERCISE_NAME_BY_SLUG[lift]}`,
      status: "planned",
      is_deload: false,
      estimated_duration_minutes: 45,
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
    is_amrap: s.isAmrap,
    planned_rest_seconds: 150,
  }));

  const { error: setsError } = await supabase.from("workout_sets").insert(setsForDb);
  if (setsError) throw new Error("Не успяхме да запазим сериите.");

  await insertJuggernautAccessory(supabase, workoutRow.id, lift, setsForDb.length);

  return workoutRow;
}

export async function createFirstJuggernautExcelWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  oneRepMaxesKg: Record<JuggernautLift, number>,
  scheduledDate: string
) {
  const base = initJuggernautExcelState(oneRepMaxesKg, DEFAULT_JUGGERNAUT_EXCEL_SETTINGS);
  const state: JuggernautScheduleState = { waveIndex: base.waveIndex, weekNumber: base.weekInWave, tmKg: base.tmKg, nextLiftIndex: 0 };

  const lift = JUGGERNAUT_LIFT_ORDER[0];
  const workoutRow = await insertJuggernautExcelSession(supabase, generatedPlanId, lift, state, scheduledDate);

  await supabase
    .from("generated_plans")
    .update({ settings: { juggernaut_state: state, juggernaut_variant: "excel" } })
    .eq("id", generatedPlanId);

  return workoutRow;
}

export async function completeJuggernautExcelWorkout(
  supabase: SupabaseClient,
  generatedPlanId: string,
  scheduledWorkoutId: string,
  state: JuggernautScheduleState,
  amrapRepsAchieved: number | undefined,
  nextScheduledDate: string
) {
  const lift = JUGGERNAUT_LIFT_ORDER[state.nextLiftIndex];
  const wave = WAVE_NAMES[state.waveIndex];

  await supabase.from("scheduled_workouts").update({ status: "completed" }).eq("id", scheduledWorkoutId);

  let updatedTmKg = state.tmKg;
  if (state.weekNumber === 3 && amrapRepsAchieved !== undefined) {
    const bump = calculateTmBump(lift, wave, amrapRepsAchieved, state.tmKg[lift], DEFAULT_JUGGERNAUT_EXCEL_SETTINGS);
    updatedTmKg = { ...state.tmKg, [lift]: bump.newTmKg };
  }

  const newLiftIndex = (state.nextLiftIndex + 1) % JUGGERNAUT_LIFT_ORDER.length;
  let newWaveIndex = state.waveIndex;
  let newWeekNumber = state.weekNumber;

  if (newLiftIndex === 0) {
    const advanced = advanceJuggernautExcelWeek(
      lift,
      { waveIndex: state.waveIndex, weekInWave: state.weekNumber as any, tmKg: updatedTmKg },
      DEFAULT_JUGGERNAUT_EXCEL_SETTINGS
    );
    newWaveIndex = advanced.waveIndex;
    newWeekNumber = advanced.weekInWave;
  }

  const newState: JuggernautScheduleState = {
    waveIndex: newWaveIndex,
    weekNumber: newWeekNumber,
    tmKg: updatedTmKg,
    nextLiftIndex: newLiftIndex,
  };

  const nextLift = JUGGERNAUT_LIFT_ORDER[newLiftIndex];
  const nextWorkoutRow = await insertJuggernautExcelSession(supabase, generatedPlanId, nextLift, newState, nextScheduledDate);

  await supabase
    .from("generated_plans")
    .update({ settings: { juggernaut_state: newState, juggernaut_variant: "excel" } })
    .eq("id", generatedPlanId);

  return { newState, nextWorkoutRow };
}

// =====================================================================
//  УНИВЕРСАЛЕН ИЗВЛИЧАТЕЛ НА ТЕКУЩИТЕ РАБОТНИ ТЕЖЕСТИ
//  (за /dashboard — всяка от 8 програмите пази състоянието си различно)
// =====================================================================

export function getCurrentWorkingWeights(
  programSlug: string,
  settings: any
): Partial<Record<"squat" | "bench_press" | "deadlift" | "overhead_press", number>> | null {
  try {
    switch (programSlug) {
      case "starting-strength": {
        const lifts = settings.ss_state?.lifts;
        if (!lifts) return null;
        return {
          squat: lifts.squat?.workingWeightKg,
          bench_press: lifts.bench_press?.workingWeightKg,
          deadlift: lifts.deadlift?.workingWeightKg,
          overhead_press: lifts.overhead_press?.workingWeightKg,
        };
      }
      case "531":
        return settings.wendler_state?.trainingMaxKg ?? null;
      case "hepburn-a": {
        const liftStates = settings.hepburn_state?.liftStates;
        if (!liftStates) return null;
        return {
          squat: liftStates.squat?.workingWeightKg,
          bench_press: liftStates.bench_press?.workingWeightKg,
          deadlift: liftStates.deadlift?.workingWeightKg,
          overhead_press: liftStates.overhead_press?.workingWeightKg,
        };
      }
      case "texas-method": {
        const t = settings.texas_state?.texasState;
        if (!t) return null;
        return {
          squat: t.lastFridaySquatKg,
          bench_press: t.lastHeavyUpperKg?.bench_press,
          overhead_press: t.lastHeavyUpperKg?.overhead_press,
          deadlift: t.currentDeadliftKg,
        };
      }
      case "surovetsky-1":
      case "surovetsky-2":
        return { bench_press: settings.surovetsky_state?.currentMaxKg };
      case "juggernaut":
      case "juggernaut-excel":
        return settings.juggernaut_state?.tmKg ?? null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}
