"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { useLanguage } from "@/components/language-provider";

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

export default function ProgramsPage() {
  const { t, localizedHref } = useLanguage();
  const p = t.programs;

  const [programs, setPrograms] = useState<ProgramRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    supabase
      .from("programs")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (error) setError(true);
        setPrograms(data as ProgramRow[]);
      });
  }, []);

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-6xl">
        <Link href={localizedHref("/")} className="text-sm text-chalkDim hover:text-chalk">
          {p.backHome}
        </Link>

        <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">{p.title}</h1>
        <p className="mt-3 max-w-xl text-chalkDim">{p.subtitle}</p>

        <div className="mt-6">
          <Link
            href={localizedHref("/quiz")}
            className="inline-flex items-center gap-2 text-sm text-amber underline-offset-4 hover:underline"
          >
            {p.quizPrompt}
          </Link>
        </div>

        {error && <p className="mt-10 text-chalkDim">{p.loadError}</p>}

        {!error && programs && programs.length === 0 && <p className="mt-10 text-chalkDim">{p.empty}</p>}

        <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
          {programs?.map((program) => (
            <Link
              key={program.slug}
              href={localizedHref(`/programs/${program.slug}`)}
              className="group flex flex-col justify-between bg-graphite p-7 transition hover:bg-graphite2"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[11px] uppercase tracking-widest text-amber">
                    {(p.levels as Record<string, string>)[program.level] ?? program.level}
                  </span>
                  <span className="text-chalkDim">·</span>
                  <span className="font-display text-[11px] uppercase tracking-widest text-steelLight">
                    {(p.goals as Record<string, string>)[program.primary_goal] ?? program.primary_goal}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-xl font-semibold text-chalk">{program.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-chalkDim">
                  {program.recommendation_profile?.pitch}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-chalkDim">
                <span>
                  {program.days_per_week} {p.daysPerWeek}
                  {program.duration_weeks ? ` · ${program.duration_weeks} ${p.weeks}` : ` · ${p.cyclic}`}
                </span>
                <span className="text-amber opacity-0 transition group-hover:opacity-100">{p.view}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
