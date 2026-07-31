"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  calculateTrainingMax,
  planWendlerLift,
  type WendlerLift,
  type WendlerSettings,
} from "@/lib/wendler-531-generator";

const LIFTS: { key: WendlerLift; label: string }[] = [
  { key: "squat", label: "Клек" },
  { key: "bench_press", label: "Лежанка" },
  { key: "deadlift", label: "Мъртва тяга" },
  { key: "overhead_press", label: "Военна преса" },
];

const SETTINGS: WendlerSettings = {
  roundingIncrementKg: 2.5,
  tmIncreaseUpperKg: 2.5,
  tmIncreaseLowerKg: 5,
  trainingMaxPercentOf1RM: 0.9,
};

export default function CalculatePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-graphite" />}>
      <CalculateInner />
    </Suspense>
  );
}

function CalculateInner() {
  const searchParams = useSearchParams();
  const programSlug = searchParams.get("program") ?? "";

  const [maxes, setMaxes] = useState<Record<WendlerLift, string>>({
    squat: "",
    bench_press: "",
    deadlift: "",
    overhead_press: "",
  });
  const [showResults, setShowResults] = useState(false);

  const supported = programSlug === "531";

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setShowResults(true);
  }

  const oneRepMaxes = Object.fromEntries(
    LIFTS.map((l) => [l.key, Number(maxes[l.key]) || 0])
  ) as Record<WendlerLift, number>;

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-2xl">
        <Link href={`/programs/${programSlug}`} className="text-sm text-chalkDim hover:text-chalk">
          ← Назад към програмата
        </Link>

        <h1 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
          Калкулатор — без регистрация
        </h1>
        <p className="mt-2 text-chalkDim">
          Въведи максимумите си и виж реалния план веднага. Ще пазим нищо, докато сам не
          решиш да запазиш прогреса си.
        </p>

        {!supported && (
          <div className="mt-10 border-2 border-white/15 p-8 text-center">
            <p className="text-chalkDim">
              Калкулаторът за тази програма е в процес на изграждане — засега може да
              продължиш директно с регистрация, за да ти изготвим плана.
            </p>
            <Link
              href={`/start?program=${programSlug}`}
              className="mt-6 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
            >
              Продължи с регистрация →
            </Link>
          </div>
        )}

        {supported && !showResults && (
          <form onSubmit={handleCalculate} className="mt-10 grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              {LIFTS.map((lift) => (
                <div key={lift.key}>
                  <label className="text-xs uppercase tracking-widest text-chalkDim">
                    {lift.label} — 1RM (kg)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    required
                    placeholder="напр. 100"
                    value={maxes[lift.key]}
                    onChange={(e) => setMaxes({ ...maxes, [lift.key]: e.target.value })}
                    className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
            >
              Изчисли плана →
            </button>
          </form>
        )}

        {supported && showResults && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-semibold">Седмица 1 — твоят план</h2>
            <p className="mt-1 text-sm text-chalkDim">
              Тренировъчен максимум = 90% от въведения 1RM. Последната серия е AMRAP
              (максимален брой качествени повторения).
            </p>

            <div className="mt-6 grid gap-6">
              {LIFTS.map((lift) => {
                const tm = calculateTrainingMax(
                  oneRepMaxes[lift.key],
                  SETTINGS,
                  SETTINGS.roundingIncrementKg
                );
                const sets = planWendlerLift(
                  lift.key,
                  { cycleNumber: 1, weekNumber: 1, trainingMaxKg: { ...oneRepMaxes, [lift.key]: tm } },
                  SETTINGS
                );

                return (
                  <div key={lift.key} className="border-2 border-white/15 p-5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-display text-lg font-semibold">{lift.label}</h3>
                      <span className="text-sm text-chalkDim">TM: {tm} kg</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {sets.map((set, i) => (
                        <div key={i} className="border border-white/10 p-3 text-center">
                          <div className="font-display text-2xl font-bold text-steelLight">
                            {set.weightKg}
                            <span className="text-xs text-chalkDim"> kg</span>
                          </div>
                          <div className="mt-1 text-sm text-chalkDim">
                            {set.reps}
                            {set.isAmrap ? "+" : ""} повт.
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 border-t border-white/10 pt-8 text-center">
              <p className="text-chalkDim">
                Това е само първата седмица. За пълния 4-седмичен цикъл, автоматична
                прогресия и календар по дати — запази прогреса си.
              </p>
              <Link
                href={`/start?program=${programSlug}&squat=${maxes.squat}&bench=${maxes.bench_press}&deadlift=${maxes.deadlift}&press=${maxes.overhead_press}`}
                className="mt-5 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
              >
                Запази прогреса си →
              </Link>
              <p className="mt-3 text-xs text-chalkDim">
                Максимумите ти вече ще са попълнени — няма да ги пишеш втори път.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
