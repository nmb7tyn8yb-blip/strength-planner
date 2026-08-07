"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import LoadingScreen from "@/components/loading-screen";
import EmptyState from "@/components/empty-state";

interface ProgramRow {
  slug: string;
  name: string;
  level: string;
  primary_goal: string;
}

export default function AdminPage() {
  const [phase, setPhase] = useState<"checking" | "denied" | "ready">("checking");
  const [programs, setPrograms] = useState<ProgramRow[]>([]);

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

    const { data: programsData } = await supabase
      .from("programs")
      .select("slug, name, level, primary_goal")
      .order("name");

    setPrograms(programsData ?? []);
    setPhase("ready");
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
        <h1 className="font-display text-3xl font-semibold">Административен редактор</h1>
        <p className="mt-2 text-chalkDim">
          Редактираш описанията и метаданните на каталога. Самата тренировъчна логика
          (прогресия, проценти) си остава в кода — тук се пипа само текст и настройки.
        </p>

        <Link
          href="/admin/users"
          className="mt-4 inline-block text-sm text-steelLight underline-offset-4 hover:underline"
        >
          → Управление на потребители (Free/Pro нива)
        </Link>
        <br />
        <Link
          href="/admin/activity"
          className="mt-2 inline-block text-sm text-steelLight underline-offset-4 hover:underline"
        >
          → Активност (регистрации, популярност, скорошни действия)
        </Link>

        <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10">
          {programs.map((p) => (
            <Link
              key={p.slug}
              href={`/admin/${p.slug}`}
              className="flex items-center justify-between bg-graphite p-5 transition hover:bg-graphite2"
            >
              <div>
                <span className="font-display text-lg font-semibold">{p.name}</span>
                <p className="text-sm text-chalkDim">
                  {p.level} · {p.primary_goal}
                </p>
              </div>
              <span className="text-amber">Редактирай →</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
