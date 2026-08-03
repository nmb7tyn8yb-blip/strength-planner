"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  estimateOneRepMax,
  repMaxTable,
  estimateStrengthLevel,
  STRENGTH_LEVEL_DISCLAIMER,
  type LiftKey,
  type Sex,
} from "@/lib/one-rep-max";

const LIFTS: { key: LiftKey; label: string }[] = [
  { key: "squat", label: "Клек" },
  { key: "bench_press", label: "Лежанка" },
  { key: "deadlift", label: "Мъртва тяга" },
  { key: "overhead_press", label: "Военна преса" },
];

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

  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  const bw = Number(bodyweight) || 0;
  const a = age ? Number(age) : null;

  const estimate = estimateOneRepMax(w, r);
  const table = repMaxTable(estimate.average);
  const level = showLevel && bw > 0 ? estimateStrengthLevel(lift, estimate.average, bw, sex, a) : null;

  function buildReturnUrl(): string | null {
    if (!returnTo || estimate.average <= 0) return null;
    const [path, query] = returnTo.split("?");
    const params = new URLSearchParams(query ?? "");
    params.set(RETURN_PARAM_BY_LIFT[lift], String(estimate.average));
    return `${path}?${params.toString()}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-chalkDim hover:text-chalk">
          ← Начало
        </Link>

        <h1 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
          Калкулатор за максимум (1RM)
        </h1>
        <p className="mt-2 text-chalkDim">
          Въведи тегло и повторения от скорошна тренировка — ще изчислим приблизителния
          ти едноповторен максимум по три формули.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">Упражнение</label>
            <select
              value={lift}
              onChange={(e) => setLift(e.target.value as LiftKey)}
              className="mt-1 w-full border-2 border-white/15 bg-graphite px-4 py-3 text-chalk focus:border-amber"
            >
              {LIFTS.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-chalkDim">Вдигнато тегло (kg)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                required
                placeholder="напр. 80"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-chalkDim">Повторения</label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
              />
              <p className="mt-1 text-xs text-chalkDim">Най-точно е под 10 повторения.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLevel(!showLevel)}
            className="text-left text-sm text-steelLight underline-offset-4 hover:underline"
          >
            {showLevel ? "− Скрий сравнение с ниво на сила" : "+ Сравни спрямо ниво на сила (по тегло/пол/възраст)"}
          </button>

          {showLevel && (
            <div className="grid grid-cols-3 gap-4 border-l-2 border-steel pl-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-chalkDim">Твоето тегло (kg)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="напр. 75"
                  value={bodyweight}
                  onChange={(e) => setBodyweight(e.target.value)}
                  className="mt-1 w-full border-2 border-white/15 bg-transparent px-3 py-2 text-chalk placeholder:text-chalkDim focus:border-amber"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-chalkDim">Пол</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                  className="mt-1 w-full border-2 border-white/15 bg-graphite px-3 py-2 text-chalk focus:border-amber"
                >
                  <option value="male">Мъж</option>
                  <option value="female">Жена</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-chalkDim">Възраст (по избор)</label>
                <input
                  type="number"
                  min={14}
                  max={100}
                  placeholder="незадължително"
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
            Изчисли →
          </button>
        </form>

        {submitted && w > 0 && r > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
              Приблизителен максимум
            </h2>
            <div className="mt-2 font-display text-5xl font-bold text-amber">
              {estimate.average} <span className="text-2xl text-chalkDim">kg</span>
            </div>

            {returnTo && (
              <Link
                href={buildReturnUrl() ?? "#"}
                className="mt-4 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
              >
                Използвай {estimate.average} kg за {LIFTS.find((l) => l.key === lift)?.label} →
              </Link>
            )}



            {level && (
              <div className="mt-8 border-2 border-steel p-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-semibold text-steelLight">{level.tier}</span>
                  <span className="text-sm text-chalkDim">
                    {(level.ratio).toFixed(2)}× телесното тегло
                  </span>
                </div>
                {level.nextTier && level.weightToNextTierKg !== null && (
                  <p className="mt-2 text-sm text-chalk">
                    Още <strong className="text-amber">{level.weightToNextTierKg} kg</strong> до ниво{" "}
                    <strong>{level.nextTier}</strong>.
                  </p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-chalkDim">{STRENGTH_LEVEL_DISCLAIMER}</p>
              </div>
            )}

            <h3 className="mt-10 font-display text-sm uppercase tracking-widest text-chalkDim">
              Тежест за други повторения (изчислено от максимума)
            </h3>
            <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
              {table.map((row) => (
                <div key={row.reps} className="border border-white/10 p-2 text-center">
                  <div className="font-display text-sm font-bold text-steelLight">{row.weight}</div>
                  <div className="text-xs text-chalkDim">×{row.reps}</div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-chalkDim">
              Тези оценки са формула, не тест — реалният ти максимум може да варира с
              ±5-10% според деня, техниката и умората.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
