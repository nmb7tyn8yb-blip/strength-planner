"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import LoadingScreen from "@/components/loading-screen";
import EmptyState from "@/components/empty-state";

interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  plan_tier: string;
  marketing_opt_in: boolean;
}

export default function AdminUsersPage() {
  const [phase, setPhase] = useState<"checking" | "denied" | "ready">("checking");
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

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

    const { data } = await supabase
      .from("profiles")
      .select("id, email, display_name, plan_tier, marketing_opt_in")
      .order("created_at", { ascending: false });

    setProfiles(data ?? []);
    setPhase("ready");
  }

  async function handleTierChange(id: string, newTier: string) {
    setSavingId(id);
    await supabase.from("profiles").update({ plan_tier: newTier }).eq("id", id);
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, plan_tier: newTier } : p)));
    setSavingId(null);
  }

  if (phase === "checking") return <LoadingScreen label="Проверяваме достъпа ти…" />;

  if (phase === "denied") {
    return (
      <EmptyState
        title="Нямаш достъп до тази страница"
        description="Административният редактор е достъпен само за одобрени администратори."
        ctaHref="/"
        ctaLabel="Обратно към началото"
      />
    );
  }

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin" className="text-sm text-chalkDim hover:text-chalk">
          ← Всички програми
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold">Потребители</h1>
        <p className="mt-2 text-chalkDim">
          Ръчно управление на нивото — засега няма реални плащания, затова Pro/Founding
          Member се задават оттук (напр. за тестови акаунти или ранни поддръжници).
        </p>

        <div className="mt-8 overflow-hidden border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-chalkDim">
                <th className="p-3">Имейл</th>
                <th className="p-3">Име</th>
                <th className="p-3">Маркетинг</th>
                <th className="p-3">Ниво</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="p-3 text-chalk">{p.email ?? "—"}</td>
                  <td className="p-3 text-chalkDim">{p.display_name ?? "—"}</td>
                  <td className="p-3 text-chalkDim">{p.marketing_opt_in ? "✓" : "—"}</td>
                  <td className="p-3">
                    <select
                      value={p.plan_tier}
                      disabled={savingId === p.id}
                      onChange={(e) => handleTierChange(p.id, e.target.value)}
                      className="border-2 border-white/15 bg-graphite px-3 py-1.5 text-chalk focus:border-amber disabled:opacity-50"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="founding_member">Founding Member</option>
                    </select>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-3 text-chalkDim">
                    Няма намерени потребители.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
