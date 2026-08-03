"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { getCurrentWorkingWeights } from "@/lib/workout-engine";

const LIFT_LABEL: Record<string, string> = {
  squat: "Клек",
  bench_press: "Лежанка",
  deadlift: "Мъртва тяга",
  overhead_press: "Военна преса",
};

const STATUS_LABEL: Record<string, string> = {
  planned: "Планирана",
  in_progress: "В прогрес",
  completed: "Изпълнена",
  partial: "Частично изпълнена",
  failed: "Неуспешна",
  skipped: "Пропусната",
  moved: "Преместена",
};

const STATUS_COLOR: Record<string, string> = {
  planned: "text-steelLight border-steel",
  in_progress: "text-amber border-amber",
  completed: "text-green-400 border-green-600",
  partial: "text-amber border-amber",
  failed: "text-rust border-rust",
  skipped: "text-chalkDim border-white/15",
  moved: "text-chalkDim border-white/15",
};

type Phase = "loading" | "no-plan" | "ready";

export default function DashboardPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [programName, setProgramName] = useState("");
  const [programSlug, setProgramSlug] = useState("");
  const [startDate, setStartDate] = useState("");
  const [currentWeights, setCurrentWeights] = useState<Record<string, number | undefined> | null>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
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

    const plan = plans?.[0];
    if (!plan) {
      setPhase("no-plan");
      return;
    }

    setProgramName(plan.programs?.name ?? "");
    setProgramSlug(plan.programs?.slug ?? "");
    setStartDate(plan.start_date);
    setCurrentWeights(getCurrentWorkingWeights(plan.programs?.slug, plan.settings));

    const { data: workoutRows } = await supabase
      .from("scheduled_workouts")
      .select("*")
      .eq("generated_plan_id", plan.id)
      .order("scheduled_date", { ascending: true });
    setWorkouts(workoutRows ?? []);

    const { data: historyRows } = await supabase
      .from("completed_sets")
      .select("actual_weight, actual_reps, completed_at, workout_sets(exercises(name), scheduled_workouts(generated_plan_id))")
      .order("completed_at", { ascending: false })
      .limit(15);

    const filteredHistory = (historyRows ?? []).filter(
      (h: any) => h.workout_sets?.scheduled_workouts?.generated_plan_id === plan.id
    );
    setHistory(filteredHistory);

    setPhase("ready");
  }

  const completedCount = workouts.filter((w) => w.status === "completed").length;
  const partialCount = workouts.filter((w) => w.status === "partial").length;
  const totalDone = completedCount + partialCount;
  const successRate = totalDone > 0 ? Math.round((completedCount / totalDone) * 100) : null;

  const upcoming = workouts.filter((w) => w.status === "planned").slice(0, 3);
  const past = workouts.filter((w) => w.status !== "planned").slice(-8).reverse();

  if (phase === "loading") {
    return <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">Зареждане…</main>;
  }

  if (phase === "no-plan") {
    return (
      <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-2xl font-semibold">Нямаш активен план</h1>
          <p className="mt-3 text-chalkDim">Избери програма, за да започнеш.</p>
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

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold">{programName}</h1>
            <p className="mt-1 text-chalkDim">От {startDate}</p>
          </div>
          <Link
            href="/today"
            className="inline-flex items-center gap-2 border-2 border-amber bg-amber px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
          >
            Днешна тренировка →
          </Link>
        </div>

        {/* Текущи тежести */}
        {currentWeights && (
          <div className="mt-10">
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">Текущи тежести</h2>
            <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
              {Object.entries(currentWeights)
                .filter(([, v]) => v !== undefined)
                .map(([lift, weight]) => (
                  <div key={lift} className="bg-graphite p-5">
                    <span className="text-xs uppercase tracking-widest text-chalkDim">{LIFT_LABEL[lift]}</span>
                    <p className="mt-1 font-display text-2xl font-bold text-amber">
                      {Math.round((weight as number) * 10) / 10} <span className="text-sm text-chalkDim">kg</span>
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className="mt-10 grid grid-cols-3 gap-px overflow-hidden border border-white/10 bg-white/10">
          <div className="bg-graphite p-5 text-center">
            <p className="font-display text-3xl font-bold text-chalk">{totalDone}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-chalkDim">Изиграни тренировки</p>
          </div>
          <div className="bg-graphite p-5 text-center">
            <p className="font-display text-3xl font-bold text-chalk">
              {successRate !== null ? `${successRate}%` : "—"}
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-chalkDim">Успеваемост</p>
          </div>
          <div className="bg-graphite p-5 text-center">
            <p className="font-display text-3xl font-bold text-chalk">{upcoming.length}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-chalkDim">Предстоящи</p>
          </div>
        </div>

        {/* Предстоящи тренировки */}
        <div className="mt-10">
          <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">Предстоящи</h2>
          <div className="mt-3 grid gap-2">
            {upcoming.length === 0 && <p className="text-sm text-chalkDim">Няма насрочени тренировки.</p>}
            {upcoming.map((w) => (
              <div
                key={w.id}
                className={`flex items-center justify-between border-2 px-4 py-3 ${STATUS_COLOR[w.status] ?? "border-white/10"}`}
              >
                <span className="text-chalk">{w.session_name}</span>
                <span className="text-sm text-chalkDim">{w.scheduled_date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Изминали тренировки */}
        <div className="mt-10">
          <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">Последни тренировки</h2>
          <div className="mt-3 grid gap-2">
            {past.length === 0 && <p className="text-sm text-chalkDim">Още нямаш изиграни тренировки.</p>}
            {past.map((w) => (
              <div key={w.id} className="flex items-center justify-between border border-white/10 px-4 py-3">
                <span className="text-chalk">{w.session_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-chalkDim">{w.scheduled_date}</span>
                  <span className={`border px-2 py-0.5 text-xs uppercase tracking-wide ${STATUS_COLOR[w.status] ?? "border-white/10 text-chalkDim"}`}>
                    {STATUS_LABEL[w.status] ?? w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* История на сериите */}
        <div className="mt-10">
          <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">История на сериите</h2>
          <div className="mt-3 overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-chalkDim">
                  <th className="p-3">Дата</th>
                  <th className="p-3">Упражнение</th>
                  <th className="p-3">Тегло</th>
                  <th className="p-3">Повторения</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-3 text-chalkDim">{new Date(h.completed_at).toLocaleDateString("bg-BG")}</td>
                    <td className="p-3 text-chalk">{h.workout_sets?.exercises?.name}</td>
                    <td className="p-3 text-chalk">{h.actual_weight} kg</td>
                    <td className="p-3 text-chalk">{h.actual_reps}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-3 text-chalkDim">
                      Все още няма записана история.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
