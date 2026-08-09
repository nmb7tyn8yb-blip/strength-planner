"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import LoadingScreen from "@/components/loading-screen";
import EmptyState from "@/components/empty-state";

interface RecentSignup {
  id: string;
  email: string | null;
  plan_tier: string;
  created_at: string;
}

interface RecentWorkout {
  status: string;
  scheduled_date: string;
  session_name: string;
  program_name: string;
}

export default function AdminActivityPage() {
  const [phase, setPhase] = useState<"checking" | "denied" | "ready">("checking");

  const [totalUsers, setTotalUsers] = useState(0);
  const [tierCounts, setTierCounts] = useState<Record<string, number>>({});
  const [activePlansCount, setActivePlansCount] = useState(0);
  const [programPopularity, setProgramPopularity] = useState<{ name: string; count: number }[]>([]);
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [totalViews7d, setTotalViews7d] = useState(0);
  const [topPages, setTopPages] = useState<{ path: string; count: number }[]>([]);
  const [viewsByDay, setViewsByDay] = useState<{ day: string; count: number }[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setPhase("denied");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
    if (!profile?.is_admin) {
      setPhase("denied");
      return;
    }

    // Всички профили — общ брой + разбивка по ниво + последни регистрации
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("id, email, plan_tier, created_at")
      .order("created_at", { ascending: false });

    if (allProfiles) {
      setTotalUsers(allProfiles.length);

      const counts: Record<string, number> = {};
      allProfiles.forEach((p) => {
        counts[p.plan_tier] = (counts[p.plan_tier] ?? 0) + 1;
      });
      setTierCounts(counts);

      setRecentSignups(allProfiles.slice(0, 15) as RecentSignup[]);
    }

    // Активни планове + популярност по програма
    const { data: activePlans } = await supabase
      .from("generated_plans")
      .select("id, programs(name), custom_programs(name)")
      .eq("status", "active");

    if (activePlans) {
      setActivePlansCount(activePlans.length);

      const popularity: Record<string, number> = {};
      activePlans.forEach((p: any) => {
        const name = p.programs?.name ?? p.custom_programs?.name ?? "Собствена програма";
        popularity[name] = (popularity[name] ?? 0) + 1;
      });
      const sorted = Object.entries(popularity)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      setProgramPopularity(sorted);
    }

    // Последна активност — скоро завършени/пропуснати тренировки
    const { data: workouts } = await supabase
      .from("scheduled_workouts")
      .select("status, scheduled_date, session_name, generated_plans(programs(name), custom_programs(name))")
      .neq("status", "planned")
      .order("scheduled_date", { ascending: false })
      .limit(20);

    if (workouts) {
      setRecentWorkouts(
        workouts.map((w: any) => ({
          status: w.status,
          scheduled_date: w.scheduled_date,
          session_name: w.session_name,
          program_name: w.generated_plans?.programs?.name ?? w.generated_plans?.custom_programs?.name ?? "—",
        }))
      );
    }

    // Посещения — последните 7 дни
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: views } = await supabase
      .from("page_views")
      .select("path, created_at")
      .gte("created_at", sevenDaysAgo);

    if (views) {
      setTotalViews7d(views.length);

      const byPage: Record<string, number> = {};
      const byDay: Record<string, number> = {};
      views.forEach((v) => {
        byPage[v.path] = (byPage[v.path] ?? 0) + 1;
        const day = v.created_at.slice(0, 10);
        byDay[day] = (byDay[day] ?? 0) + 1;
      });

      setTopPages(
        Object.entries(byPage)
          .map(([path, count]) => ({ path, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      );
      setViewsByDay(
        Object.entries(byDay)
          .map(([day, count]) => ({ day, count }))
          .sort((a, b) => a.day.localeCompare(b.day))
      );
    }

    setPhase("ready");
  }

  if (phase === "checking") return <LoadingScreen label="Проверяваме достъпа ти…" />;

  if (phase === "denied") {
    return (
      <EmptyState
        title="Нямаш достъп до тази страница"
        description="Административният панел е достъпен само за одобрени администратори."
        ctaHref="/"
        ctaLabel="Обратно към началото"
      />
    );
  }

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="text-sm text-chalkDim hover:text-chalk">
          ← Административен панел
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold">Активност</h1>
        <p className="mt-2 text-chalkDim">
          Обобщена картина на регистрациите, активните планове и скорошните действия. Собствено
          проследяване на посещенията — не зависи от рекламни блокери.
        </p>

        {/* Ключови числа */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-6">
          <div className="bg-graphite p-5 text-center">
            <p className="font-display text-3xl font-bold text-steelLight">{totalViews7d}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-chalkDim">Посещения (7 дни)</p>
          </div>
          <div className="bg-graphite p-5 text-center">
            <p className="font-display text-3xl font-bold text-chalk">{totalUsers}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-chalkDim">Регистрирани</p>
          </div>
          <div className="bg-graphite p-5 text-center">
            <p className="font-display text-3xl font-bold text-chalk">{activePlansCount}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-chalkDim">Активни планове</p>
          </div>
          <div className="bg-graphite p-5 text-center">
            <p className="font-display text-3xl font-bold text-chalk">{tierCounts.free ?? 0}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-chalkDim">Free</p>
          </div>
          <div className="bg-graphite p-5 text-center">
            <p className="font-display text-3xl font-bold text-amber">{tierCounts.pro ?? 0}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-chalkDim">Pro</p>
          </div>
          <div className="bg-graphite p-5 text-center">
            <p className="font-display text-3xl font-bold text-amber">{tierCounts.founding_member ?? 0}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-chalkDim">Founding</p>
          </div>
        </div>

        {/* Посещения по дни */}
        <div className="mt-10">
          <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
            Посещения по дни (последните 7)
          </h2>
          <div className="mt-3 flex items-end gap-2" style={{ height: "100px" }}>
            {viewsByDay.length === 0 && <p className="text-sm text-chalkDim">Все още няма записани посещения.</p>}
            {viewsByDay.map((v) => {
              const max = Math.max(...viewsByDay.map((x) => x.count), 1);
              return (
                <div key={v.day} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full bg-steel"
                    style={{ height: `${Math.max((v.count / max) * 80, 4)}px` }}
                  />
                  <span className="text-[10px] text-chalkDim">{v.day.slice(5)}</span>
                  <span className="text-xs font-semibold text-chalk">{v.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Най-посещавани страници */}
        <div className="mt-10">
          <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
            Най-посещавани страници (последните 7 дни)
          </h2>
          <div className="mt-3 grid gap-2">
            {topPages.length === 0 && <p className="text-sm text-chalkDim">Все още няма данни.</p>}
            {topPages.map((p) => (
              <div key={p.path} className="flex items-center justify-between border border-white/10 px-4 py-2">
                <span className="text-sm text-chalk">{p.path}</span>
                <span className="font-display text-sm font-semibold text-steelLight">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Популярност на програмите */}
        <div className="mt-10">
          <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
            Популярност на програмите (по активни планове)
          </h2>
          <div className="mt-3 grid gap-2">
            {programPopularity.length === 0 && <p className="text-sm text-chalkDim">Все още няма активни планове.</p>}
            {programPopularity.map((p) => (
              <div key={p.name} className="flex items-center justify-between border border-white/10 px-4 py-2">
                <span className="text-sm text-chalk">{p.name}</span>
                <span className="font-display text-sm font-semibold text-amber">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Последни регистрации */}
        <div className="mt-10">
          <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">Последни регистрации</h2>
          <div className="mt-3 overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-chalkDim">
                  <th className="p-3">Имейл</th>
                  <th className="p-3">Ниво</th>
                  <th className="p-3">Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentSignups.map((s) => (
                  <tr key={s.id} className="border-b border-white/5">
                    <td className="p-3 text-chalk">{s.email ?? "—"}</td>
                    <td className="p-3 text-chalkDim">{s.plan_tier}</td>
                    <td className="p-3 text-chalkDim">{new Date(s.created_at).toLocaleDateString("bg-BG")}</td>
                  </tr>
                ))}
                {recentSignups.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-3 text-chalkDim">
                      Няма намерени регистрации.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Последна активност */}
        <div className="mt-10">
          <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">Последна активност</h2>
          <div className="mt-3 overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-chalkDim">
                  <th className="p-3">Програма</th>
                  <th className="p-3">Тренировка</th>
                  <th className="p-3">Дата</th>
                  <th className="p-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkouts.map((w, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-3 text-chalk">{w.program_name}</td>
                    <td className="p-3 text-chalkDim">{w.session_name}</td>
                    <td className="p-3 text-chalkDim">{w.scheduled_date}</td>
                    <td className="p-3 text-chalkDim">{w.status}</td>
                  </tr>
                ))}
                {recentWorkouts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-3 text-chalkDim">
                      Няма записана активност още.
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
