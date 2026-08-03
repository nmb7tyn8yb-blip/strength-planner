import Link from "next/link";
import { supabase } from "@/lib/supabase-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RecommendationProfile {
  pitch: string;
  equipment: "minimal" | "full";
  complexity: "low" | "medium" | "high";
}

interface ProgramRow {
  slug: string;
  name: string;
  level: string;
  primary_goal: string;
  days_per_week: number;
  duration_weeks: number | null;
  recommendation_profile: RecommendationProfile;
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Начинаещ",
  intermediate: "Средно напреднал",
  advanced: "Напреднал",
};

const GOAL_LABEL: Record<string, string> = {
  strength: "Сила",
  strength_mass: "Сила и маса",
  bench_focus: "Основно лежанка",
  powerlifting_total: "Трибой",
};

export default async function ProgramsPage() {
  const { data: programs, error } = await supabase
    .from("programs")
    .select("*")
    .order("name");

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-chalkDim hover:text-chalk">
          ← Начало
        </Link>

        <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
          Каталог с програми
        </h1>
        <p className="mt-3 max-w-xl text-chalkDim">
          Всяка програма е кодирана точно по оригинала — проценти, серии, повторения,
          правила за прогресия. Не избираш описание, избираш реален алгоритъм.
        </p>

        <div className="mt-6">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 text-sm text-amber underline-offset-4 hover:underline"
          >
            Не си сигурен коя? Отговори на въпросника →
          </Link>
        </div>

        {error && (
          <p className="mt-10 text-chalkDim">
            Не успяхме да заредим каталога в момента. Презареди страницата след малко.
          </p>
        )}

        {!error && programs && programs.length === 0 && (
          <p className="mt-10 text-chalkDim">Каталогът все още е празен.</p>
        )}

        <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
          {(programs as ProgramRow[] | null)?.map((program) => (
            <Link
              key={program.slug}
              href={`/programs/${program.slug}`}
              className="group flex flex-col justify-between bg-graphite p-7 transition hover:bg-graphite2"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[11px] uppercase tracking-widest text-amber">
                    {LEVEL_LABEL[program.level] ?? program.level}
                  </span>
                  <span className="text-chalkDim">·</span>
                  <span className="font-display text-[11px] uppercase tracking-widest text-steelLight">
                    {GOAL_LABEL[program.primary_goal] ?? program.primary_goal}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-xl font-semibold text-chalk">
                  {program.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-chalkDim">
                  {program.recommendation_profile?.pitch}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-chalkDim">
                <span>
                  {program.days_per_week} дни/седмица
                  {program.duration_weeks ? ` · ${program.duration_weeks} седмици` : " · циклична"}
                </span>
                <span className="text-amber opacity-0 transition group-hover:opacity-100">
                  Виж →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
