"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  estimateOneRepMax,
  repMaxTable,
  estimateStrengthLevel,
  type LiftKey,
  type Sex,
} from "@/lib/one-rep-max";
import { useLanguage } from "@/components/language-provider";
import { useUnit } from "@/components/unit-provider";
import { inputToKg, displayWeight } from "@/lib/units";
import ProductRecommendations from "@/components/product-recommendations";

const LIFT_KEYS: LiftKey[] = ["squat", "bench_press", "deadlift", "overhead_press"];

const RETURN_PARAM_BY_LIFT: Record<LiftKey, string> = {
  squat: "squat",
  bench_press: "bench",
  deadlift: "deadlift",
  overhead_press: "press",
};

export default function OneRepMaxCalculatorPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-graphite" />}>
      <OneRepMaxCalculatorInner />
    </Suspense>
  );
}

function OneRepMaxCalculatorInner() {
  const { t } = useLanguage();
  const c = t.calculator;
  const { unit } = useUnit();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const liftFromUrl = searchParams.get("lift") as LiftKey | null;

  const [lift, setLift] = useState<LiftKey>(liftFromUrl ?? "bench_press");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("5");
  const [bodyweight, setBodyweight] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("");
  const [showLevel, setShowLevel] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // всичко въведено се конвертира веднага до kg — вътрешната математика
  // винаги работи в kg, само показването следва избраната единица
  const wKg = inputToKg(Number(weight) || 0, unit);
  const r = Number(reps) || 0;
  const bwKg = inputToKg(Number(bodyweight) || 0, unit);
  const a = age ? Number(age) : null;

  const estimate = estimateOneRepMax(wKg, r);
  const table = repMaxTable(estimate.average);
  const level = showLevel && bwKg > 0 ? estimateStrengthLevel(lift, estimate.average, bwKg, sex, a) : null;

  function buildReturnUrl(): string | null {
    if (!returnTo || estimate.average <= 0) return null;
    const [path, query] = returnTo.split("?");
    const params = new URLSearchParams(query ?? "");
    params.set(RETURN_PARAM_BY_LIFT[lift], String(estimate.average)); // винаги в kg — /calculate работи в kg вътрешно
    return `${path}?${params.toString()}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const weightPlaceholder = unit === "kg" ? "e.g. 80" : "e.g. 175";
  const bwPlaceholder = unit === "kg" ? "e.g. 75" : "e.g. 165";

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-chalkDim hover:text-chalk">
          ← {t.programs.backHome.replace("← ", "")}
        </Link>

        <h1 className="mt-4 font-display text-3xl font-semibold md:text-4xl">{c.title}</h1>
        <p className="mt-2 text-chalkDim">{c.subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">{c.exerciseLabel}</label>
            <select
              value={lift}
              onChange={(e) => setLift(e.target.value as LiftKey)}
              className="mt-1 w-full border-2 border-white/15 bg-graphite px-4 py-3 text-chalk focus:border-amber"
            >
              {LIFT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {c.exercises[key]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-chalkDim">
                {c.weightLabel} ({unit})
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                required
                placeholder={weightPlaceholder}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-chalkDim">{c.repsLabel}</label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
              />
              <p className="mt-1 text-xs text-chalkDim">{c.repsHint}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLevel(!showLevel)}
            className="text-left text-sm text-steelLight underline-offset-4 hover:underline"
          >
            {showLevel ? c.compareHide : c.compareShow}
          </button>

          {showLevel && (
            <div className="grid grid-cols-3 gap-4 border-l-2 border-steel pl-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-chalkDim">
                  {c.bodyweightLabel} ({unit})
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder={bwPlaceholder}
                  value={bodyweight}
                  onChange={(e) => setBodyweight(e.target.value)}
                  className="mt-1 w-full border-2 border-white/15 bg-transparent px-3 py-2 text-chalk placeholder:text-chalkDim focus:border-amber"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-chalkDim">{c.sexLabel}</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                  className="mt-1 w-full border-2 border-white/15 bg-graphite px-3 py-2 text-chalk focus:border-amber"
                >
                  <option value="male">{c.male}</option>
                  <option value="female">{c.female}</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-chalkDim">{c.ageLabel}</label>
                <input
                  type="number"
                  min={14}
                  max={100}
                  placeholder={c.ageOptional}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1 w-full border-2 border-white/15 bg-transparent px-3 py-2 text-chalk placeholder:text-chalkDim focus:border-amber"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="mt-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
          >
            {c.calculateButton}
          </button>
        </form>

        {submitted && wKg > 0 && r > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">{c.resultTitle}</h2>
            <div className="mt-2 font-display text-5xl font-bold text-amber">
              {displayWeight(estimate.average, unit)} <span className="text-2xl text-chalkDim">{unit}</span>
            </div>

            {returnTo && (
              <Link
                href={buildReturnUrl() ?? "#"}
                className="mt-4 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
              >
                {displayWeight(estimate.average, unit)} {unit} — {c.exercises[lift]} →
              </Link>
            )}

            {level && (
              <div className="mt-8 border-2 border-steel p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="font-display text-2xl font-semibold text-steelLight">
                      {t.strengthTiers[level.tierIndex]}
                    </span>
                    <span className="ml-3 border border-amber/40 px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wide text-amber">
                      {t.strengthBadges[level.tierIndex]}
                    </span>
                  </div>
                  <span className="text-sm text-chalkDim">
                    {level.ratio.toFixed(2)} {c.strengthLevelPrefix}
                  </span>
                </div>
                {level.tierIndex < 4 && level.weightToNextTierKg !== null && (
                  <p className="mt-3 text-sm text-chalk">
                    {c.moreToNextTier(displayWeight(level.weightToNextTierKg, unit), unit, t.strengthTiers[level.tierIndex + 1])}
                  </p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-chalkDim">{c.strengthDisclaimer}</p>
              </div>
            )}

            <h3 className="mt-10 font-display text-sm uppercase tracking-widest text-chalkDim">
              {c.repTableTitle}
            </h3>
            <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
              {table.map((row) => (
                <div key={row.reps} className="border border-white/10 p-2 text-center">
                  <div className="font-display text-sm font-bold text-steelLight">
                    {displayWeight(row.weight, unit)}
                  </div>
                  <div className="text-xs text-chalkDim">×{row.reps}</div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-chalkDim">{c.formulaNote}</p>

            <ProductRecommendations placement="1rm-calculator" />
          </div>
        )}
      </div>
    </main>
  );
}
