"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { useLanguage } from "@/components/language-provider";
import LoadingScreen from "@/components/loading-screen";

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

interface DetailedDescription {
  overview?: string;
  how_it_works?: string;
  best_for?: string[];
  considerations?: string[];
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
  detailed_description: DetailedDescription | null;
}

export default function ProgramDetailPage() {
  const { t } = useLanguage();
  const d = t.programDetail;
  const params = useParams();
  const slug = params.slug as string;

  const [program, setProgram] = useState<ProgramRow | null>(null);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    supabase
      .from("programs")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFoundFlag(true);
          return;
        }
        setProgram(data as ProgramRow);
      });
  }, [slug]);

  if (notFoundFlag) {
    notFound();
  }

  if (!program) {
    return <LoadingScreen />;
  }

  const p = program.recommendation_profile;

  const otherSportsText = {
    low: d.otherSportsLabels.low,
    medium: d.otherSportsLabels.medium,
    high: d.otherSportsLabels.high,
  }[p.other_sports_tolerance];

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-3xl">
        <Link href="/programs" className="text-sm text-chalkDim hover:text-chalk">
          {d.backToAll}
        </Link>

        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
          {program.name}
        </h1>

        {program.description && (
          <p className="mt-4 text-lg leading-relaxed text-chalkDim">{program.description}</p>
        )}

        {/* Ключови показатели */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
          <Stat label={d.statLevel} value={(t.programs.levels as Record<string, string>)[program.level] ?? program.level} />
          <Stat label={d.statGoal} value={(t.programs.goals as Record<string, string>)[program.primary_goal] ?? program.primary_goal} />
          <Stat label={d.statDays} value={String(program.days_per_week)} />
          <Stat
            label={d.statDuration}
            value={program.duration_weeks ? `${program.duration_weeks} ${t.programs.weeks}` : t.programs.cyclic}
          />
        </div>

        {/* Pitch */}
        <div className="mt-8 border-l-2 border-amber pl-5">
          <p className="text-lg text-chalk">{p.pitch}</p>
        </div>

        {/* Подробно описание */}
        {program.detailed_description && (
          <div className="mt-10 grid gap-8">
            {program.detailed_description.overview && (
              <div>
                <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
                  {d.overviewTitle}
                </h2>
                <p className="mt-2 leading-relaxed text-chalk">{program.detailed_description.overview}</p>
              </div>
            )}

            {program.detailed_description.how_it_works && (
              <div>
                <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
                  {d.howItWorksTitle}
                </h2>
                <p className="mt-2 leading-relaxed text-chalk">{program.detailed_description.how_it_works}</p>
              </div>
            )}

            <div className="grid gap-8 sm:grid-cols-2">
              {program.detailed_description.best_for && program.detailed_description.best_for.length > 0 && (
                <div>
                  <h2 className="font-display text-sm uppercase tracking-widest text-steelLight">
                    {d.bestForTitle}
                  </h2>
                  <ul className="mt-2 space-y-2">
                    {program.detailed_description.best_for.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-relaxed text-chalk">
                        <span className="text-steelLight">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {program.detailed_description.considerations &&
                program.detailed_description.considerations.length > 0 && (
                  <div>
                    <h2 className="font-display text-sm uppercase tracking-widest text-amber">
                      {d.considerationsTitle}
                    </h2>
                    <ul className="mt-2 space-y-2">
                      {program.detailed_description.considerations.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-chalk">
                          <span className="text-amber">!</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Детайли */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">{d.equipmentTitle}</h2>
            {program.required_equipment ? (
              <ul className="mt-2 space-y-1">
                {program.required_equipment.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-chalk">
                    · {d.equipmentItems[item] ?? item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-chalk">{p.equipment === "full" ? d.equipmentFull : d.equipmentMinimal}</p>
            )}
          </div>

          <div>
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">{d.autoregTitle}</h2>
            <p className="mt-2 text-chalk">{d.autoregLabels[p.autoregulation]}</p>
          </div>

          <div>
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">{d.sessionMinTitle}</h2>
            <p className="mt-2 text-chalk">
              {p.min_session_minutes} {d.minutesSuffix}
            </p>
          </div>

          <div>
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">{d.otherSportsTitle}</h2>
            <p className="mt-2 text-chalk">{otherSportsText}</p>
          </div>
        </div>

        {program.failure_rule_summary && (
          <div className="mt-10 border border-white/15 p-6">
            <h2 className="font-display text-sm uppercase tracking-widest text-amber">{d.failureRuleTitle}</h2>
            <p className="mt-2 text-chalkDim">{program.failure_rule_summary}</p>
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href={`/calculate?program=${program.slug}`}
            className="inline-flex items-center gap-3 border-2 border-amber bg-amber px-7 py-4 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
          >
            {d.calculateButton}
          </Link>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 border-2 border-white/20 px-7 py-4 font-display text-sm font-semibold uppercase tracking-wider text-chalk transition hover:border-white/50"
          >
            {d.browseOthers}
          </Link>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-graphite p-5">
      <span className="font-display text-[11px] uppercase tracking-widest text-chalkDim">{label}</span>
      <p className="mt-1 font-display text-lg font-semibold text-chalk">{value}</p>
    </div>
  );
}
