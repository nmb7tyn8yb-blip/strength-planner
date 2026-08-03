"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import LoadingScreen from "@/components/loading-screen";
import EmptyState from "@/components/empty-state";
import {
  completeStartingStrengthWorkout,
  completeWendlerWorkout,
  completeHepburnWorkout,
  hepburnDayOffset,
  completeTexasWorkout,
  texasDayOffset,
  completeSurovetskyWorkout,
  surovetskyDayOffset,
  completeJuggernautClassicWorkout,
  completeJuggernautExcelWorkout,
  nextTrainingDate,
} from "@/lib/workout-engine";
import type { SessionResultInput, LiftSlug } from "@/lib/starting-strength-generator";

const EXERCISE_SLUG_BY_NAME: Record<string, LiftSlug> = {
  Клек: "squat",
  Лежанка: "bench_press",
  "Мъртва тяга": "deadlift",
  "Военна преса": "overhead_press",
};

const FAILURE_REASONS: { value: string; label: string }[] = [
  { value: "weight_too_high", label: "Тежестта беше прекалено висока" },
  { value: "poor_sleep", label: "Недоспиване" },
  { value: "pain", label: "Болка/дискомфорт" },
  { value: "poor_technique", label: "Лоша техника" },
  { value: "insufficient_rest", label: "Недостатъчна почивка между сериите" },
  { value: "missed_previous_session", label: "Пропусната предишна тренировка" },
  { value: "illness", label: "Заболяване" },
  { value: "other", label: "Друга причина" },
];

interface WorkoutSetRow {
  id: string;
  exercise_id: string;
  set_type: "warmup" | "working" | "amrap" | "test";
  planned_weight: number;
  planned_reps: number;
  order_index: number;
  is_amrap: boolean;
  is_paused: boolean;
  exercises: { name: string };
}

type Phase = "loading" | "no-plan" | "unsupported" | "workout" | "failure-reason" | "confirm-max" | "submitting" | "done" | "error";

export default function TodayPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const [plan, setPlan] = useState<any>(null);
  const [programName, setProgramName] = useState("");
  const [programSlug, setProgramSlug] = useState("");
  const [workout, setWorkout] = useState<any>(null);
  const [sets, setSets] = useState<WorkoutSetRow[]>([]);
  const [actualReps, setActualReps] = useState<Record<string, number>>({});
  const [failureReason, setFailureReason] = useState("weight_too_high");
  const [confirmedMax, setConfirmedMax] = useState("");
  const [nextDate, setNextDate] = useState<string | null>(null);

  useEffect(() => {
    loadWorkout();
  }, []);

  async function loadWorkout() {
    setPhase("loading");
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setPhase("no-plan");
      return;
    }

    const { data: plans } = await supabase
      .from("generated_plans")
      .select("*, programs(name, slug)")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    const activePlan = plans?.[0];
    if (!activePlan) {
      setPhase("no-plan");
      return;
    }
    setPlan(activePlan);
    setProgramName(activePlan.programs?.name ?? "");
    setProgramSlug(activePlan.programs?.slug ?? "");

    if (
      !["starting-strength", "531", "hepburn-a", "texas-method", "surovetsky-1", "surovetsky-2", "juggernaut", "juggernaut-excel"].includes(
        activePlan.programs?.slug
      )
    ) {
      setPhase("unsupported");
      return;
    }

    const { data: workouts } = await supabase
      .from("scheduled_workouts")
      .select("*")
      .eq("generated_plan_id", activePlan.id)
      .eq("status", "planned")
      .order("scheduled_date", { ascending: true })
      .limit(1);

    const nextWorkout = workouts?.[0];
    if (!nextWorkout) {
      setPhase("no-plan");
      return;
    }
    setWorkout(nextWorkout);

    const { data: workoutSets } = await supabase
      .from("workout_sets")
      .select("id, exercise_id, set_type, planned_weight, planned_reps, order_index, is_amrap, is_paused, exercises(name)")
      .eq("scheduled_workout_id", nextWorkout.id)
      .order("order_index", { ascending: true });

    const setsData = (workoutSets as unknown as WorkoutSetRow[]) ?? [];
    setSets(setsData);
    setActualReps(Object.fromEntries(setsData.map((s) => [s.id, s.planned_reps])));
    const heaviestSet = setsData.reduce((max, s) => (s.planned_weight > max ? s.planned_weight : max), 0);
    setConfirmedMax(String(heaviestSet));
    setPhase("workout");
  }

  const exerciseGroups = groupBy(sets, (s) => s.exercises.name);

  function computeResults(): SessionResultInput[] {
    return Object.entries(exerciseGroups).map(([name, exerciseSets]) => {
      const workingSets = exerciseSets.filter((s) => s.set_type === "working");
      const allCompleted = workingSets.every((s) => (actualReps[s.id] ?? 0) >= s.planned_reps);
      return {
        exerciseSlug: EXERCISE_SLUG_BY_NAME[name],
        allPrescribedSetsCompleted: allCompleted,
        failureReason: allCompleted ? undefined : (failureReason as any),
      };
    });
  }

  async function handleFinishWorkout() {
    if (programSlug === "531") {
      await handleFinishWendler();
      return;
    }

    if (programSlug === "surovetsky-1" || programSlug === "surovetsky-2") {
      await handleFinishSurovetsky();
      return;
    }

    if (programSlug === "juggernaut" || programSlug === "juggernaut-excel") {
      await handleFinishJuggernaut();
      return;
    }

    const results = computeResults();
    const anyFailure = results.some((r) => !r.allPrescribedSetsCompleted);

    if (anyFailure && phase === "workout") {
      setPhase("failure-reason");
      return;
    }

    if (programSlug === "hepburn-a") {
      await handleFinishHepburn();
      return;
    }

    if (programSlug === "texas-method") {
      await handleFinishTexas();
      return;
    }

    setPhase("submitting");
    try {
      const finalResults = computeResults();

      // запис на реалните серии в историята
      const completedRows = sets
        .filter((s) => s.set_type === "working")
        .map((s) => ({
          workout_set_id: s.id,
          actual_weight: s.planned_weight,
          actual_reps: actualReps[s.id] ?? 0,
        }));
      if (completedRows.length > 0) {
        await supabase.from("completed_sets").insert(completedRows);
      }

      const next = nextTrainingDate(workout.scheduled_date, 2);
      await completeStartingStrengthWorkout(
        supabase,
        plan.id,
        workout.id,
        plan.settings.ss_state,
        plan.settings.ss_settings,
        finalResults,
        next
      );
      setNextDate(next);
      setPhase("done");
    } catch (err) {
      setErrorMessage("Нещо се обърка при запазването. Опитай пак.");
      setPhase("error");
    }
  }

  async function handleFinishJuggernaut() {
    setPhase("submitting");
    try {
      const amrapSet = sets.find((s) => s.is_amrap);
      const amrapReps = amrapSet ? actualReps[amrapSet.id] : undefined;

      const completedRows = sets.map((s) => ({
        workout_set_id: s.id,
        actual_weight: s.planned_weight,
        actual_reps: actualReps[s.id] ?? 0,
      }));
      if (completedRows.length > 0) {
        await supabase.from("completed_sets").insert(completedRows);
      }

      const next = nextTrainingDate(workout.scheduled_date, 2);
      const isExcel = plan.settings.juggernaut_variant === "excel";

      if (isExcel) {
        await completeJuggernautExcelWorkout(
          supabase,
          plan.id,
          workout.id,
          plan.settings.juggernaut_state,
          amrapReps,
          next
        );
      } else {
        await completeJuggernautClassicWorkout(
          supabase,
          plan.id,
          workout.id,
          plan.settings.juggernaut_state,
          amrapReps,
          next
        );
      }
      setNextDate(next);
      setPhase("done");
    } catch (err) {
      setErrorMessage("Нещо се обърка при запазването. Опитай пак.");
      setPhase("error");
    }
  }

  async function handleFinishSurovetsky() {
    if (workout.is_max_test && phase !== "confirm-max") {
      setPhase("confirm-max");
      return;
    }

    setPhase("submitting");
    try {
      const completedRows = sets
        .filter((s) => s.set_type !== "warmup")
        .map((s) => ({
          workout_set_id: s.id,
          actual_weight: s.planned_weight,
          actual_reps: actualReps[s.id] ?? 0,
        }));
      if (completedRows.length > 0) {
        await supabase.from("completed_sets").insert(completedRows);
      }

      const offset = surovetskyDayOffset(plan.settings.surovetsky_state.sessionIndexInCycle);
      const next = nextTrainingDate(workout.scheduled_date, offset);

      await completeSurovetskyWorkout(
        supabase,
        plan.id,
        workout.id,
        plan.settings.surovetsky_state,
        next,
        workout.is_max_test ? Number(confirmedMax) : undefined
      );
      setNextDate(next);
      setPhase("done");
    } catch (err) {
      setErrorMessage("Нещо се обърка при запазването. Опитай пак.");
      setPhase("error");
    }
  }

  async function handleFinishTexas() {
    setPhase("submitting");
    try {
      const finalResults = computeResults();
      const findResult = (slug: string) => finalResults.find((r) => r.exerciseSlug === slug);

      const squatResult = findResult("squat");
      const benchResult = findResult("bench_press");
      const pressResult = findResult("overhead_press");
      const deadliftResult = findResult("deadlift");
      const upperResult = benchResult ?? pressResult;

      const findWeight = (slug: string) => {
        const match = sets.find((s) => EXERCISE_SLUG_BY_NAME[s.exercises.name] === slug);
        return match?.planned_weight ?? 0;
      };

      const completedRows = sets.map((s) => ({
        workout_set_id: s.id,
        actual_weight: s.planned_weight,
        actual_reps: actualReps[s.id] ?? 0,
      }));
      if (completedRows.length > 0) {
        await supabase.from("completed_sets").insert(completedRows);
      }

      const offset = texasDayOffset(plan.settings.texas_state.dayType);
      const next = nextTrainingDate(workout.scheduled_date, offset);

      await completeTexasWorkout(
        supabase,
        plan.id,
        workout.id,
        plan.settings.texas_state,
        plan.settings.texas_settings,
        {
          squatAchieved: squatResult?.allPrescribedSetsCompleted ?? true,
          upperLiftAchieved: upperResult?.allPrescribedSetsCompleted ?? true,
          deadliftAchieved: deadliftResult ? deadliftResult.allPrescribedSetsCompleted : undefined,
        },
        { squat: findWeight("squat"), upperLift: findWeight(benchResult ? "bench_press" : "overhead_press") },
        next
      );
      setNextDate(next);
      setPhase("done");
    } catch (err) {
      setErrorMessage("Нещо се обърка при запазването. Опитай пак.");
      setPhase("error");
    }
  }

  async function handleFinishHepburn() {
    setPhase("submitting");
    try {
      const finalResults = computeResults();
      const resultsByLift: Record<string, boolean> = {};
      finalResults.forEach((r) => {
        resultsByLift[r.exerciseSlug] = r.allPrescribedSetsCompleted;
      });

      const completedRows = sets
        .filter((s) => s.set_type === "working")
        .map((s) => ({
          workout_set_id: s.id,
          actual_weight: s.planned_weight,
          actual_reps: actualReps[s.id] ?? 0,
        }));
      if (completedRows.length > 0) {
        await supabase.from("completed_sets").insert(completedRows);
      }

      const offset = hepburnDayOffset(plan.settings.hepburn_state.dayIndex);
      const next = nextTrainingDate(workout.scheduled_date, offset);
      await completeHepburnWorkout(
        supabase,
        plan.id,
        workout.id,
        plan.settings.hepburn_state,
        plan.settings.hepburn_settings,
        resultsByLift as any,
        next
      );
      setNextDate(next);
      setPhase("done");
    } catch (err) {
      setErrorMessage("Нещо се обърка при запазването. Опитай пак.");
      setPhase("error");
    }
  }

  async function handleFinishWendler() {
    setPhase("submitting");
    try {
      const nonAmrapSets = sets.filter((s) => s.set_type === "working");
      const allNonAmrapCompleted = nonAmrapSets.every((s) => (actualReps[s.id] ?? 0) >= s.planned_reps);

      const completedRows = sets.map((s) => ({
        workout_set_id: s.id,
        actual_weight: s.planned_weight,
        actual_reps: actualReps[s.id] ?? 0,
      }));
      if (completedRows.length > 0) {
        await supabase.from("completed_sets").insert(completedRows);
      }

      const next = nextTrainingDate(workout.scheduled_date, 2);
      await completeWendlerWorkout(
        supabase,
        plan.id,
        workout.id,
        plan.settings.wendler_state,
        plan.settings.wendler_settings,
        allNonAmrapCompleted,
        next
      );
      setNextDate(next);
      setPhase("done");
    } catch (err) {
      setErrorMessage("Нещо се обърка при запазването. Опитай пак.");
      setPhase("error");
    }
  }

  if (phase === "loading") {
    return <LoadingScreen label="Зареждаме днешната ти тренировка…" />;
  }

  if (phase === "no-plan") {
    return (
      <EmptyState
        title="Нямаш насрочена тренировка"
        description="Или още нямаш активен план, или си влязъл с друг акаунт."
        ctaHref="/programs"
        ctaLabel="Разгледай програмите"
      />
    );
  }

  if (phase === "unsupported") {
    return (
      <EmptyState
        title={programName}
        description="Тази програма все още не е свързана с този екран — но всичките 8 програми вече имат готова логика, скоро ще бъде и тук."
        ctaHref="/dashboard"
        ctaLabel="Обратно към таблото"
      />
    );
  }

  if (phase === "done") {
    return (
      <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-3xl font-semibold text-amber">Записано!</h1>
          <p className="mt-4 text-chalkDim">
            Следващата ти тренировка е насрочена за <strong className="text-chalk">{nextDate}</strong>,
            изчислена спрямо резултата ти днес.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold">{programName}</h1>
        <p className="mt-1 text-chalkDim">
          {workout?.session_name} · {workout?.scheduled_date}
        </p>

        {phase === "workout" && (
          <div className="mt-8 grid gap-8">
            {Object.entries(exerciseGroups).map(([name, exerciseSets]) => (
              <div key={name} className="border-2 border-white/15 p-5">
                <h2 className="font-display text-lg font-semibold">{name}</h2>

                <div className="mt-4 grid gap-2">
                  {exerciseSets.map((s) => {
                    const achieved = actualReps[s.id] ?? 0;
                    const isAmrapOrTest = s.is_amrap || s.set_type === "test";
                    const met = isAmrapOrTest ? achieved > 0 : achieved >= s.planned_reps;
                    const rowColor = met ? "border-green-700/50" : achieved === 0 ? "border-white/10" : "border-amber/50";

                    return (
                      <div
                        key={s.id}
                        className={`flex items-center justify-between border px-4 py-3 transition-colors ${rowColor}`}
                      >
                        <span className="text-chalk">
                          {s.planned_weight} kg × {s.planned_reps}
                          {s.is_amrap ? "+ (AMRAP)" : ""}
                          {s.set_type === "test" ? " (проходка)" : ""} (план)
                          {s.is_paused && (
                            <span className="ml-2 rounded-sm bg-amber/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber">
                              Пауза 2-3 сек
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          {met && <span className="text-green-500">✓</span>}
                          <span className="text-sm text-chalkDim">Направени:</span>
                          <button
                            type="button"
                            onClick={() => setActualReps({ ...actualReps, [s.id]: Math.max(0, achieved - 1) })}
                            className="h-7 w-7 border border-white/15 text-chalkDim transition hover:border-amber hover:text-amber"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={achieved}
                            onChange={(e) => setActualReps({ ...actualReps, [s.id]: Number(e.target.value) })}
                            className="w-14 border-2 border-white/15 bg-transparent px-2 py-1 text-center text-chalk focus:border-amber"
                          />
                          <button
                            type="button"
                            onClick={() => setActualReps({ ...actualReps, [s.id]: achieved + 1 })}
                            className="h-7 w-7 border border-white/15 text-chalkDim transition hover:border-amber hover:text-amber"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <p className="text-sm text-chalkDim">
                {sets.filter((s) => (actualReps[s.id] ?? 0) >= s.planned_reps || s.is_amrap || s.set_type === "test")
                  .length}{" "}
                от {sets.length} серии отбелязани
              </p>
              <button
                onClick={handleFinishWorkout}
                className="border-2 border-amber bg-amber px-6 py-4 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
              >
                Завърши тренировката →
              </button>
            </div>
          </div>
        )}

        {phase === "failure-reason" && (
          <div className="mt-8 border-2 border-amber p-6">
            <h2 className="font-display text-lg font-semibold text-amber">
              Не всички серии бяха изпълнени
            </h2>
            <p className="mt-2 text-sm text-chalkDim">
              Няма проблем — избери причината, за да запазим точна история. Решението
              (повторение на тежестта или намаление) следва вградените правила на
              Starting Strength автоматично.
            </p>
            <select
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              className="mt-4 w-full border-2 border-white/15 bg-graphite px-4 py-3 text-chalk focus:border-amber"
            >
              {FAILURE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleFinishWorkout}
              className="mt-4 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
            >
              Запази и продължи →
            </button>
          </div>
        )}

        {phase === "confirm-max" && (
          <div className="mt-8 border-2 border-amber p-6">
            <h2 className="font-display text-lg font-semibold text-amber">
              Каква тежест реално вдигна на теста?
            </h2>
            <p className="mt-2 text-sm text-chalkDim">
              Това е "проходката" — истинският опит за нов максимум, не планираната
              тежест. Въведи реално постигнатото, дори ако е различно от плана.
            </p>
            <input
              type="number"
              min={0}
              step={0.5}
              value={confirmedMax}
              onChange={(e) => setConfirmedMax(e.target.value)}
              className="mt-4 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk focus:border-amber"
            />
            <button
              onClick={handleFinishSurovetsky}
              className="mt-4 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
            >
              Запази новия максимум →
            </button>
          </div>
        )}

        {phase === "submitting" && (
          <div className="mt-8 flex items-center gap-3 text-chalkDim">
            <div className="h-5 w-5 animate-spin border-2 border-amber border-t-transparent" />
            Запазваме…
          </div>
        )}

        {phase === "error" && <p className="mt-8 text-rust">{errorMessage}</p>}
      </div>
    </main>
  );
}

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
