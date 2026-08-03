"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import {
  completeStartingStrengthWorkout,
  completeWendlerWorkout,
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
  set_type: "warmup" | "working";
  planned_weight: number;
  planned_reps: number;
  order_index: number;
  exercises: { name: string };
}

type Phase = "loading" | "no-plan" | "unsupported" | "workout" | "failure-reason" | "submitting" | "done" | "error";

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

    if (!["starting-strength", "531"].includes(activePlan.programs?.slug)) {
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
      .select("id, exercise_id, set_type, planned_weight, planned_reps, order_index, exercises(name)")
      .eq("scheduled_workout_id", nextWorkout.id)
      .order("order_index", { ascending: true });

    const setsData = (workoutSets as unknown as WorkoutSetRow[]) ?? [];
    setSets(setsData);
    setActualReps(Object.fromEntries(setsData.map((s) => [s.id, s.planned_reps])));
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

    const results = computeResults();
    const anyFailure = results.some((r) => !r.allPrescribedSetsCompleted);

    if (anyFailure && phase === "workout") {
      setPhase("failure-reason");
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
    return <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">Зареждане…</main>;
  }

  if (phase === "no-plan") {
    return (
      <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-2xl font-semibold">Нямаш насрочена тренировка</h1>
          <p className="mt-3 text-chalkDim">
            Или още нямаш активен план, или си влязъл с друг акаунт.
          </p>
          <Link
            href="/programs"
            className="mt-6 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
          >
            Разгледай програмите →
          </Link>
        </div>
      </main>
    );
  }

  if (phase === "unsupported") {
    return (
      <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-2xl font-semibold">{programName}</h1>
          <p className="mt-3 text-chalkDim">
            Този екран засега поддържа Starting Strength и Wendler 5/3/1 — твоята
            програма е следваща на опашката за добавяне.
          </p>
        </div>
      </main>
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

                <p className="mt-3 text-xs uppercase tracking-widest text-chalkDim">Загряване</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {exerciseSets
                    .filter((s) => s.set_type === "warmup")
                    .map((s) => (
                      <span key={s.id} className="border border-white/10 px-3 py-1 text-sm text-chalkDim">
                        {s.planned_weight} kg × {s.planned_reps}
                      </span>
                    ))}
                </div>

                <p className="mt-4 text-xs uppercase tracking-widest text-chalkDim">Работни серии</p>
                <div className="mt-2 grid gap-2">
                  {exerciseSets
                    .filter((s) => s.set_type !== "warmup")
                    .map((s) => (
                      <div key={s.id} className="flex items-center justify-between border border-white/10 px-4 py-3">
                        <span className="text-chalk">
                          {s.planned_weight} kg × {s.planned_reps}
                          {s.set_type === "amrap" ? "+ (AMRAP)" : ""} (план)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-chalkDim">Направени:</span>
                          <input
                            type="number"
                            min={0}
                            value={actualReps[s.id] ?? 0}
                            onChange={(e) =>
                              setActualReps({ ...actualReps, [s.id]: Number(e.target.value) })
                            }
                            className="w-16 border-2 border-white/15 bg-transparent px-2 py-1 text-center text-chalk focus:border-amber"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleFinishWorkout}
              className="border-2 border-amber bg-amber px-6 py-4 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
            >
              Завърши тренировката →
            </button>
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

        {phase === "submitting" && <p className="mt-8 text-chalkDim">Запазваме…</p>}

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
