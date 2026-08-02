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
