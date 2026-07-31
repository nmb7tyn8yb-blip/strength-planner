import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";

interface RecommendationProfile {
  goals: string[];
  experience_min: string;
  experience_ideal: string[];
  days_per_week_allowed: number[];
  min_session_minutes: number;
  equipment: "minimal" | "full";
  autoregulation: "none" | "medium" | "high";
  complexity: "low" | "medium" | "high";
  other_sports_tolerance: "low" | "medium" | "high";
  injury_friendly: boolean;
  pitch: string;
}

interface ProgramRow {
  slug: string;
  name: string;
  description: string | null;
  level: string;
  primary_goal: string;
  days_per_week: number;
  duration_weeks: number | null;
  required_equipment: string[] | null;
  failure_rule_summary: string | null;
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

const AUTOREG_LABEL: Record<string, string> = {
  none: "Фиксиран план, без автоматична адаптация",
  medium: "Частична автоматична адаптация (AMRAP серии)",
  high: "Висока автоматична адаптация по представяне",
};

export default async function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const { data: program, error } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", params.slug)
    .single<ProgramRow>();

  if (error || !program) {
    notFound();
  }

  const p = program.recommendation_profile;

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-3xl">
        <Link href="/programs" className="text-sm text-chalkDim hover:text-chalk">
          ← Всички програми
        </Link>

        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
          {program.name}
        </h1>

        {program.description && (
          <p className="mt-4 text-lg leading-relaxed text-chalkDim">{program.description}</p>
        )}

        {/* Ключови показатели */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
          <Stat label="Ниво" value={LEVEL_LABEL[program.level] ?? program.level} />
          <Stat label="Цел" value={GOAL_LABEL[program.primary_goal] ?? program.primary_goal} />
          <Stat label="Дни/седмица" value={String(program.days_per_week)} />
          <Stat
            label="Продължителност"
            value={program.duration_weeks ? `${program.duration_weeks} седмици` : "Циклична"}
          />
        </div>

        {/* Pitch */}
        <div className="mt-8 border-l-2 border-amber pl-5">
          <p className="text-lg text-chalk">{p.pitch}</p>
        </div>

        {/* Детайли */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
              Оборудване
            </h2>
            <p className="mt-2 text-chalk">
              {program.required_equipment?.join(", ") ??
                (p.equipment === "full" ? "Пълна зала" : "Само щанга и дискове")}
            </p>
          </div>

          <div>
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
              Автоматична адаптация
            </h2>
            <p className="mt-2 text-chalk">{AUTOREG_LABEL[p.autoregulation]}</p>
          </div>

          <div>
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
              Минимална продължителност на сесия
            </h2>
            <p className="mt-2 text-chalk">{p.min_session_minutes} минути</p>
          </div>

          <div>
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
              Съвместимост с други спортове
            </h2>
            <p className="mt-2 text-chalk">
              {{ low: "Ниска — тежка честота, трудно се комбинира", medium: "Умерена", high: "Висока — гъвкава" }[
                p.other_sports_tolerance
              ]}
            </p>
          </div>
        </div>

        {program.failure_rule_summary && (
          <div className="mt-10 border border-white/15 p-6">
            <h2 className="font-display text-sm uppercase tracking-widest text-amber">
              Какво се случва при неуспешна серия
            </h2>
            <p className="mt-2 text-chalkDim">{program.failure_rule_summary}</p>
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href={`/start?program=${program.slug}`}
            className="inline-flex items-center gap-3 border-2 border-amber bg-amber px-7 py-4 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
          >
            Започни с тази програма →
          </Link>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 border-2 border-white/20 px-7 py-4 font-display text-sm font-semibold uppercase tracking-wider text-chalk transition hover:border-white/50"
          >
            Разгледай други
          </Link>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-graphite p-5">
      <span className="font-display text-[11px] uppercase tracking-widest text-chalkDim">
        {label}
      </span>
      <p className="mt-1 font-display text-lg font-semibold text-chalk">{value}</p>
    </div>
  );
}
