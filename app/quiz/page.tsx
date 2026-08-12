"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import {
  QUIZ_QUESTIONS,
  recommendProgram,
  type QuizAnswers,
  type ProgramRecord,
  type RecommendationResult,
} from "@/lib/recommendation-engine";
import { useLanguage } from "@/components/language-provider";
import { trackMetaEvent, trackMetaCustomEvent } from "@/components/meta-pixel";

type Phase = "asking" | "loading" | "results" | "error";

export default function QuizPage() {
  const { t, localizedHref } = useLanguage();
  const hasTrackedView = useRef(false);
  const hasTrackedStart = useRef(false);

  useEffect(() => {
    if (hasTrackedView.current) return;
    hasTrackedView.current = true;
    trackMetaEvent("ViewContent", { content_name: "quiz" });
  }, []);
  const q = t.quiz;

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [phase, setPhase] = useState<Phase>("asking");
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const question = QUIZ_QUESTIONS[stepIndex];
  const questionText = q.questions[stepIndex];
  const isLastQuestion = stepIndex === QUIZ_QUESTIONS.length - 1;
  const progressPct = Math.round(((stepIndex + 1) / QUIZ_QUESTIONS.length) * 100);

  async function handleSelect(value: unknown) {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackMetaCustomEvent("QuestionnaireStarted");
    }

    const updatedAnswers = { ...answers, [question.key]: value };
    setAnswers(updatedAnswers);

    if (!isLastQuestion) {
      setStepIndex((i) => i + 1);
      return;
    }

    // последен въпрос отговорен → тегли програмите и изчисли препоръката
    setPhase("loading");
    const { data, error } = await supabase.from("programs").select("*");

    if (error || !data) {
      setErrorMessage(q.loadError);
      setPhase("error");
      return;
    }

    const programs: ProgramRecord[] = data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      level: row.level,
      daysPerWeek: row.days_per_week,
      recommendationProfile: row.recommendation_profile,
    }));

    const computed = recommendProgram(updatedAnswers as QuizAnswers, programs);
    setResults(computed);
    setPhase("results");
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  function handleRestart() {
    setStepIndex(0);
    setAnswers({});
    setResults([]);
    setPhase("asking");
  }

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-2xl">
        {phase === "asking" && (
          <>
            {/* прогрес */}
            <div className="mb-10">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-chalkDim">
                <span>{q.questionProgress(stepIndex + 1, QUIZ_QUESTIONS.length)}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="mt-2 h-1 w-full bg-white/10">
                <div
                  className="h-1 bg-amber transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <h1 className="font-display text-2xl font-semibold leading-snug md:text-3xl">
              {questionText.question}
            </h1>

            <div className="mt-8 grid gap-3">
              {question.options.map((opt, i) => (
                <button
                  key={String(opt.value)}
                  onClick={() => handleSelect(opt.value)}
                  className="group flex items-center justify-between border-2 border-white/15 px-6 py-4 text-left transition hover:border-amber hover:bg-white/5"
                >
                  <span className="text-base">{questionText.options[i] ?? opt.label}</span>
                  <span
                    aria-hidden
                    className="text-white/30 transition group-hover:translate-x-1 group-hover:text-amber"
                  >
                    →
                  </span>
                </button>
              ))}
            </div>

            {stepIndex > 0 && (
              <button
                onClick={handleBack}
                className="mt-8 text-sm text-chalkDim underline-offset-4 hover:text-chalk hover:underline"
              >
                {q.back}
              </button>
            )}
          </>
        )}

        {phase === "loading" && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="h-10 w-10 animate-spin border-2 border-amber border-t-transparent" />
            <p className="text-chalkDim">{q.loading}</p>
          </div>
        )}

        {phase === "error" && (
          <div className="py-24 text-center">
            <p className="text-lg text-chalkDim">{errorMessage}</p>
            <button
              onClick={handleRestart}
              className="mt-6 border-2 border-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-amber transition hover:bg-amber hover:text-graphite"
            >
              {q.retry}
            </button>
          </div>
        )}

        {phase === "results" && (
          <div>
            <h1 className="font-display text-2xl font-semibold md:text-3xl">{q.resultsTitle}</h1>
            <p className="mt-2 text-chalkDim">{q.resultsSubtitle}</p>

            <div className="mt-10 grid gap-6">
              {results.length === 0 && <p className="text-chalkDim">{q.noMatch}</p>}

              {results.slice(0, 3).map((r, i) => (
                <div key={r.program.slug} className="border-2 border-white/15 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-display text-[11px] uppercase tracking-widest text-amber">
                        {i === 0 ? q.bestMatch : q.rankedMatch(i + 1)} · {r.matchLevel} {q.matchSuffix}
                      </span>
                      <h2 className="mt-1 font-display text-xl font-semibold">{r.program.name}</h2>
                    </div>
                    <span className="font-display text-3xl font-bold text-steelLight">{r.score}</span>
                  </div>

                  <p className="mt-3 text-sm text-chalkDim">{r.program.recommendationProfile.pitch}</p>

                  {r.reasons.length > 0 && (
                    <ul className="mt-4 space-y-1">
                      {r.reasons.map((reason, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-chalk">
                          <span className="text-steelLight">✓</span> {reason}
                        </li>
                      ))}
                    </ul>
                  )}

                  {r.warnings.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {r.warnings.map((warning, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-chalkDim">
                          <span className="text-amber">!</span> {warning}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href={localizedHref(`/programs/${r.program.slug}`)}
                    className="mt-5 inline-flex items-center gap-2 border-2 border-amber bg-amber px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
                  >
                    {q.viewProgram}
                  </Link>
                </div>
              ))}
            </div>

            <button
              onClick={handleRestart}
              className="mt-10 text-sm text-chalkDim underline-offset-4 hover:text-chalk hover:underline"
            >
              {q.restart}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
