"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { getCurrentWorkingWeights } from "@/lib/workout-engine";
import LoadingScreen from "@/components/loading-screen";
import EmptyState from "@/components/empty-state";
import { useLanguage } from "@/components/language-provider";
import { useUnit } from "@/components/unit-provider";
import { displayWeight } from "@/lib/units";

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
  const { localizedHref, t, locale } = useLanguage();
  const dz = t.dangerZone;
  const { unit } = useUnit();
  const [phase, setPhase] = useState<Phase>("loading");
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [programName, setProgramName] = useState("");
  const [programSlug, setProgramSlug] = useState("");
  const [howItWorks, setHowItWorks] = useState("");
  const [startDate, setStartDate] = useState("");
  const [currentWeights, setCurrentWeights] = useState<Record<string, number | undefined> | null>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [customTemplate, setCustomTemplate] = useState<any[]>([]);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);

  useEffect(() => {
    loadPlansList();
  }, []);

  async function loadPlansList() {
    setPhase("loading");
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    setIsAuthenticated(!!userId);
    if (!userId) {
      setPhase("no-plan");
      return;
    }

    const { data: plans } = await supabase
      .from("generated_plans")
      .select("id, start_date, status, programs(name), custom_programs(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!plans || plans.length === 0) {
      setPhase("no-plan");
      return;
    }

    setAllPlans(plans);
    await loadPlanDetails(plans[0].id);
  }

  async function loadPlanDetails(planId: string) {
    setPhase("loading");
    setSelectedPlanId(planId);

    const { data: plan } = await supabase
      .from("generated_plans")
      .select("*, programs(name, slug, detailed_description), custom_programs(id, name)")
      .eq("id", planId)
      .single();

    if (!plan) {
      setPhase("no-plan");
      return;
    }

    if (plan.custom_program_id) {
      setProgramName(plan.custom_programs?.name ?? "Моята програма");
      setProgramSlug("");
      setCurrentWeights(null);
      setHowItWorks("");

      const { data: templateSessions } = await supabase
        .from("custom_program_sessions")
        .select("id, day_order, session_name, custom_program_exercises(order_index, exercise_name, sets, reps, weight_kg)")
        .eq("custom_program_id", plan.custom_program_id)
        .order("day_order", { ascending: true });

      setCustomTemplate(templateSessions ?? []);
    } else {
      setProgramName(plan.programs?.name ?? "");
      setProgramSlug(plan.programs?.slug ?? "");
      setCurrentWeights(getCurrentWorkingWeights(plan.programs?.slug, plan.settings));
      setHowItWorks(plan.programs?.detailed_description?.how_it_works ?? "");
      setCustomTemplate([]);
    }
    setStartDate(plan.start_date);

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
      .limit(30);

    const filteredHistory = (historyRows ?? []).filter(
      (h: any) => h.workout_sets?.scheduled_workouts?.generated_plan_id === plan.id
    );
    setHistory(filteredHistory);
    setShowAllUpcoming(false);
    setShowAllPast(false);

    setPhase("ready");
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== dz.confirmWord) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("no-session");

      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("delete-failed");

      await supabase.auth.signOut();
      window.location.href = localizedHref("/");
    } catch {
      setDeleteError(dz.error);
      setDeleting(false);
    }
  }

  const completedCount = workouts.filter((w) => w.status === "completed").length;
  const partialCount = workouts.filter((w) => w.status === "partial").length;
  const totalDone = completedCount + partialCount;
  const successRate = totalDone > 0 ? Math.round((completedCount / totalDone) * 100) : null;

  const allUpcoming = workouts.filter((w) => w.status === "planned");
  const allPast = [...workouts.filter((w) => w.status !== "planned")].reverse();
  const upcoming = showAllUpcoming ? allUpcoming : allUpcoming.slice(0, 3);
  const past = showAllPast ? allPast : allPast.slice(0, 8);

  if (phase === "loading" && allPlans.length === 0) {
    return <LoadingScreen label="Зареждаме таблото ти…" />;
  }

  function renderDangerZone() {
    return (
      <div className="mt-16 border-t border-white/10 pt-8">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-chalkDim underline-offset-4 hover:text-rust hover:underline"
          >
            {dz.title}
          </button>
        ) : (
          <div className="max-w-md border border-white/10 p-5">
            <h3 className="font-display text-base font-semibold text-chalk">{dz.confirmTitle}</h3>
            <p className="mt-2 text-sm text-chalkDim">{dz.confirmDescription}</p>
            <label className="mt-4 block text-xs uppercase tracking-widest text-chalkDim">
              {dz.confirmInputLabel}
            </label>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-2 text-chalk focus:border-rust"
            />
            {deleteError && <p className="mt-2 text-sm text-rust">{deleteError}</p>}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== dz.confirmWord || deleting}
                className="border-2 border-rust bg-rust px-5 py-3 font-display text-sm font-semibold uppercase tracking-wide text-graphite transition hover:bg-transparent hover:text-rust disabled:opacity-40"
              >
                {deleting ? dz.deleting : dz.confirmButton}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                  setDeleteError("");
                }}
                className="border-2 border-white/20 px-5 py-3 font-display text-sm font-semibold uppercase tracking-wide text-chalkDim transition hover:border-white/50"
              >
                {dz.cancelButton}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === "no-plan") {
    return (
      <>
        <EmptyState
          title="Нямаш активен план"
          description="Избери програма от каталога — калкулаторът работи веднага, без регистрация, ако само искаш да провериш числата."
          ctaHref={localizedHref("/programs")}
          ctaLabel="Разгледай програмите"
        />
        {isAuthenticated && (
          <div className="bg-graphite px-6 pb-16">
            <div className="mx-auto max-w-4xl">{renderDangerZone()}</div>
          </div>
        )}
      </>
    );
  }

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-4xl">
        {/* Избор на план, ако има повече от един */}
        {allPlans.length > 1 && (
          <div className="mb-8">
            <label className="text-xs uppercase tracking-widest text-chalkDim">
              Твоите планове ({allPlans.length})
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => loadPlanDetails(e.target.value)}
              className="mt-1 w-full border-2 border-white/15 bg-graphite px-4 py-3 text-chalk focus:border-amber"
            >
              {allPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.programs?.name ?? p.custom_programs?.name ?? "Програма"} — {p.start_date}
                  {p.status !== "active" ? ` (${p.status})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold">{programName}</h1>
            <p className="mt-1 text-chalkDim">От {startDate}</p>
          </div>
          <Link
            href={localizedHref("/today")}
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
                      {displayWeight(weight as number, unit)} <span className="text-sm text-chalkDim">{unit}</span>
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
            <p className="font-display text-3xl font-bold text-chalk">{allUpcoming.length}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-chalkDim">Предстоящи</p>
          </div>
        </div>

        {/* Структура на програмата */}
        {(howItWorks || customTemplate.length > 0) && (
          <div className="mt-10">
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
              Структура на програмата
            </h2>

            {howItWorks && (
              <p className="mt-3 border border-white/10 p-5 text-sm leading-relaxed text-chalk">{howItWorks}</p>
            )}

            {customTemplate.length > 0 && (
              <div className="mt-3 grid gap-3">
                {customTemplate.map((session) => (
                  <div key={session.id} className="border border-white/10 p-4">
                    <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-amber">
                      {session.session_name}
                    </h3>
                    <ul className="mt-2 grid gap-1">
                      {(session.custom_program_exercises ?? [])
                        .sort((a: any, b: any) => a.order_index - b.order_index)
                        .map((ex: any, i: number) => (
                          <li key={i} className="text-sm text-chalkDim">
                            {ex.exercise_name} — {ex.sets}×{ex.reps}
                            {ex.weight_kg > 0 ? ` @ ${displayWeight(ex.weight_kg, unit)} ${unit}` : ""}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Предстоящи тренировки */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">Предстоящи</h2>
            {allUpcoming.length > 3 && (
              <button
                onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                className="text-xs text-steelLight underline-offset-4 hover:underline"
              >
                {showAllUpcoming ? "Скрий" : `Виж всички (${allUpcoming.length})`}
              </button>
            )}
          </div>
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
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">Последни тренировки</h2>
            {allPast.length > 8 && (
              <button
                onClick={() => setShowAllPast(!showAllPast)}
                className="text-xs text-steelLight underline-offset-4 hover:underline"
              >
                {showAllPast ? "Скрий" : `Виж всички (${allPast.length})`}
              </button>
            )}
          </div>
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
                    <td className="p-3 text-chalk">{h.actual_weight > 0 ? `${displayWeight(h.actual_weight, unit)} ${unit}` : "—"}</td>
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

        {/* Опасна зона — изтриване на профил */}
        {renderDangerZone()}
      </div>
    </main>
  );
}
