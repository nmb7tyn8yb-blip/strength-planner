"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useLanguage } from "@/components/language-provider";
import { useUnit } from "@/components/unit-provider";
import { trackMetaCustomEvent } from "@/components/meta-pixel";
import { displayWeight, inputToKg, type WeightUnit } from "@/lib/units";
import type { TranslationShape } from "@/lib/i18n-dictionary";
import {
  calculateTrainingMax,
  planWendlerLift,
  planFSLSets,
  type WendlerLift,
  type WendlerSettings,
} from "@/lib/wendler-531-generator";
import {
  initStartingStrengthState,
  planSession,
  type StartingStrengthSettings,
} from "@/lib/starting-strength-generator";
import {
  planHepburnLift,
  generateHepburnWarmup,
  DEFAULT_HEPBURN_INCREMENTS_KG,
  type HepburnSettings,
  type HepburnLift,
} from "@/lib/hepburn-generator";
import {
  initTexasMethodState,
  planVolumeDay,
  type TexasMethodSettings,
} from "@/lib/texas-method-generator";
import {
  initTableEngineState,
  planTableSession,
} from "@/lib/table-driven-engine";
import { surovetskySystem1 } from "@/lib/surovetsky-tables";
import {
  initJuggernautClassicState,
  planJuggernautWeek,
  type JuggernautLift,
} from "@/lib/juggernaut-classic-generator";
import {
  initJuggernautExcelState,
  planJuggernautExcelWeek,
  DEFAULT_JUGGERNAUT_EXCEL_SETTINGS,
} from "@/lib/juggernaut-excel-generator";

const LIFTS: { key: WendlerLift; label: string }[] = [
  { key: "squat", label: "Клек" },
  { key: "bench_press", label: "Лежанка" },
  { key: "deadlift", label: "Мъртва тяга" },
  { key: "overhead_press", label: "Военна преса" },
];

const WENDLER_SETTINGS: WendlerSettings = {
  roundingIncrementKg: 2.5,
  tmIncreaseUpperKg: 2.5,
  tmIncreaseLowerKg: 5,
  trainingMaxPercentOf1RM: 0.9,
};

const SS_SETTINGS: StartingStrengthSettings = {
  roundingIncrementKg: 2.5,
  progressionStyle: "standard",
  deadliftFrequency: "every_other_session",
  barWeightKg: 20,
};

const SUPPORTED_PROGRAMS = [
  "531",
  "starting-strength",
  "hepburn-a",
  "texas-method",
  "surovetsky-1",
  "surovetsky-2",
  "surovetsky-full",
  "juggernaut",
  "juggernaut-excel",
];

const TEXAS_SETTINGS: TexasMethodSettings = {
  roundingIncrementKg: 2.5,
  volumeDayPercentOfFriday: 0.9,
  recoveryDayPercentOfMonday: 0.8,
  fridayIncrementUpperKg: 1.25,
  fridayIncrementSquatKg: 2.5,
  deadliftWeeklyIncrementKg: 2.5,
};

const HEPBURN_SETTINGS: HepburnSettings = {
  roundingIncrementKg: 2.5,
  barWeightKg: 20,
  failureThreshold: 3,
};

const LIFT_LABEL_BG: Record<string, string> = {
  squat: "Клек",
  bench_press: "Лежанка",
  deadlift: "Мъртва тяга",
  overhead_press: "Военна преса",
};

export default function CalculatePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-graphite" />}>
      <CalculateInner />
    </Suspense>
  );
}

function CalculateInner() {
  const { localizedHref, t } = useLanguage();
  const pc = t.programCalc;
  const { unit } = useUnit();
  const searchParams = useSearchParams();
  const programSlug = searchParams.get("program") ?? "";
  const supported = SUPPORTED_PROGRAMS.includes(programSlug);
  const trackedProgramRef = useRef<string | null>(null);

  useEffect(() => {
    if (!supported || !programSlug) return;
    if (trackedProgramRef.current === programSlug) return; // вече проследено — не изпраща пак при re-render
    trackedProgramRef.current = programSlug;
    trackMetaCustomEvent("ProgramSelected", { program: programSlug });
  }, [programSlug, supported]);

  const [maxes, setMaxes] = useState<Record<WendlerLift, string>>({
    squat: searchParams.get("squat") ?? "",
    bench_press: searchParams.get("bench") ?? "",
    deadlift: searchParams.get("deadlift") ?? "",
    overhead_press: searchParams.get("press") ?? "",
  });

  // Ако потребителят вече е логнат и има записани максимуми, ги предзарежда —
  // за да не се въвеждат наново всеки път (стойности от URL, ако има, имат предимство)
  useEffect(() => {
    async function prefillFromAccount() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: maxRows } = await supabase
        .from("exercise_maxes")
        .select("one_rep_max, tested_at, exercises(name)")
        .eq("user_id", userData.user.id)
        .order("tested_at", { ascending: false });

      if (!maxRows) return;

      const nameToSlug: Record<string, WendlerLift> = {
        Клек: "squat",
        Лежанка: "bench_press",
        "Мъртва тяга": "deadlift",
        "Военна преса": "overhead_press",
      };
      const latestByLift: Partial<Record<WendlerLift, number>> = {};
      for (const row of maxRows as any[]) {
        const slug = nameToSlug[row.exercises?.name];
        if (slug && latestByLift[slug] === undefined) latestByLift[slug] = row.one_rep_max;
      }

      setMaxes((prev) => ({
        squat: prev.squat || (latestByLift.squat ? String(latestByLift.squat) : ""),
        bench_press: prev.bench_press || (latestByLift.bench_press ? String(latestByLift.bench_press) : ""),
        deadlift: prev.deadlift || (latestByLift.deadlift ? String(latestByLift.deadlift) : ""),
        overhead_press: prev.overhead_press || (latestByLift.overhead_press ? String(latestByLift.overhead_press) : ""),
      }));
    }
    prefillFromAccount();
  }, []);
  const [showResults, setShowResults] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubscribing(true);
    try {
      await supabase.from("email_subscribers").insert({
        email: subscriberEmail,
        source: "calculator",
        program_slug: programSlug,
      });
      setSubscribed(true);
    } catch {
      // при дублиран имейл (unique constraint) или мрежова грешка — все пак
      // показваме успех, за да не обезсърчим потребителя с техническа грешка
      setSubscribed(true);
    } finally {
      setSubscribing(false);
    }
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setShowResults(true);
  }

  const numericMaxes = Object.fromEntries(
    LIFTS.map((l) => [l.key, Number(maxes[l.key]) || 0])
  ) as Record<WendlerLift, number>;

  const isStartingStrength = programSlug === "starting-strength";
  const isHepburn = programSlug === "hepburn-a";
  const inputLabel = "1RM (реален или приблизителен)";

  // Официалната Starting Strength НЕ използва проценти от 1RM — Rippetoe буквално
  // казва "започни по-леко, отколкото мислиш, че можеш", без фиксирана формула.
  // Истинските калкулатори питат за скорошен работен сет и смятат 5RM оттам.
  // Тук нямаме такъв сет, затова оценяваме 5RM по формулата на Brzycki
  // (5RM ≈ 1RM × 32/36 ≈ 89%) и добавяме ~10% запас за безопасност на първата
  // тренировка — това Е ПРЕЦЕНКА НА ПРИЛОЖЕНИЕТО, не правило от оригинала.
  const estimatedFiveRM = (oneRepMax: number) => oneRepMax * (32 / 36);
  const SAFETY_BUFFER = 0.9;

  // За Hepburn НАЧАЛНАТА тежест ~80% от 1RM Е документирана в оригиналния източник
  // (Muscle & Strength, "Extreme Powerbuilding: The Hepburn Method") — не е наша преценка.
  const HEPBURN_START_PERCENT = 0.8;

  const effectiveStartingWeights = Object.fromEntries(
    LIFTS.map((l) => {
      if (isStartingStrength) {
        return [l.key, Math.round((estimatedFiveRM(numericMaxes[l.key]) * SAFETY_BUFFER) / 2.5) * 2.5];
      }
      if (isHepburn) {
        return [l.key, Math.round((numericMaxes[l.key] * HEPBURN_START_PERCENT) / HEPBURN_SETTINGS.roundingIncrementKg) * HEPBURN_SETTINGS.roundingIncrementKg];
      }
      return [l.key, numericMaxes[l.key]];
    })
  ) as Record<WendlerLift, number>;

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-2xl">
        <Link href={localizedHref(`/programs/${programSlug}`)} className="text-sm text-chalkDim hover:text-chalk">
          {pc.backToProgram.replace("← ", "")}
        </Link>

        <h1 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
          {pc.title}
        </h1>
        <p className="mt-2 text-chalkDim">
{pc.subtitle}
        </p>

        {!supported && (
          <div className="mt-10 border-2 border-white/15 p-8 text-center">
            <p className="text-chalkDim">
{pc.unsupportedText}
            </p>
            <Link
              href={localizedHref(`/start?program=${programSlug}`)}
              className="mt-6 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
            >
              {pc.continueSignup}
            </Link>
          </div>
        )}

        {supported && !showResults && isStartingStrength && (
          <p className="mt-6 text-sm text-amber">
{pc.ssNote}
          </p>
        )}

        {supported && !showResults && isHepburn && (
          <p className="mt-6 text-sm text-steelLight">
{pc.hepburnNote}
          </p>
        )}

{supported && !showResults && (
          <form onSubmit={handleCalculate} className="mt-6 grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              {LIFTS.map((lift) => (
                <div key={lift.key}>
                  <div className="flex items-baseline justify-between">
                    <label className="text-xs uppercase tracking-widest text-chalkDim">
                      {t.calculator.exercises[lift.key]} — {pc.inputLabel} ({unit})
                    </label>
                    <Link
                      href={localizedHref(`/1rm-calculator?lift=${lift.key}&returnTo=${encodeURIComponent(
                        localizedHref(`/calculate?program=${programSlug}&squat=${maxes.squat}&bench=${maxes.bench_press}&deadlift=${maxes.deadlift}&press=${maxes.overhead_press}`)
                      )}`)}
                      className="text-xs text-steelLight underline-offset-4 hover:underline"
                    >
                      {pc.unknownMax}
                    </Link>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    required
                    placeholder={pc.placeholder}
                    value={maxes[lift.key] ? displayWeight(Number(maxes[lift.key]), unit) : ""}
                    onChange={(e) =>
                      setMaxes({ ...maxes, [lift.key]: String(inputToKg(Number(e.target.value) || 0, unit)) })
                    }
                    className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
            >
              {pc.calculateButton}
            </button>
          </form>
        )}

        {supported && showResults && programSlug === "531" && (
          <Wendler531Results numericMaxes={numericMaxes} unit={unit} pc={pc} exerciseLabels={t.calculator.exercises} />
        )}

        {supported && showResults && programSlug === "starting-strength" && (
          <StartingStrengthResults numericMaxes={effectiveStartingWeights} wasReduced={isStartingStrength} unit={unit} pc={pc} exerciseLabels={t.calculator.exercises} />
        )}

        {supported && showResults && programSlug === "hepburn-a" && (
          <HepburnResults startingWeights={effectiveStartingWeights} unit={unit} pc={pc} exerciseLabels={t.calculator.exercises} />
        )}

        {supported && showResults && programSlug === "texas-method" && (
          <TexasMethodResults oneRepMaxes={numericMaxes} unit={unit} pc={pc} exerciseLabels={t.calculator.exercises} />
        )}

        {supported && showResults && (programSlug === "surovetsky-1" || programSlug === "surovetsky-2" || programSlug === "surovetsky-full") && (
          <SurovetskyResults benchOneRepMax={numericMaxes.bench_press} unit={unit} pc={pc} />
        )}

        {supported && showResults && programSlug === "juggernaut" && (
          <JuggernautResults oneRepMaxes={numericMaxes} variant="classic" unit={unit} pc={pc} exerciseLabels={t.calculator.exercises} />
        )}

        {supported && showResults && programSlug === "juggernaut-excel" && (
          <JuggernautResults oneRepMaxes={numericMaxes} variant="excel" unit={unit} pc={pc} exerciseLabels={t.calculator.exercises} />
        )}

        {supported && showResults && (
          <div className="mt-10 border-t border-white/10 pt-8 text-center">
            <p className="text-chalkDim">
{pc.saveProgressText}
            </p>
            <Link
              href={localizedHref(`/start?program=${programSlug}&squat=${maxes.squat}&bench=${maxes.bench_press}&deadlift=${maxes.deadlift}&press=${maxes.overhead_press}&max_type=1rm`)}
              className="mt-5 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
            >
              {pc.saveProgressButton}
            </Link>
            <p className="mt-3 text-xs text-chalkDim">
              {pc.prefilledNote}
            </p>

            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="text-sm text-chalkDim">{pc.emailCaptureTitle}</p>
              {subscribed ? (
                <p className="mt-3 text-sm text-green-500">{pc.emailSuccess}</p>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-3 flex flex-wrap justify-center gap-2">
                  <input
                    type="email"
                    required
                    placeholder={pc.emailPlaceholder}
                    value={subscriberEmail}
                    onChange={(e) => setSubscriberEmail(e.target.value)}
                    className="w-64 border-2 border-white/15 bg-transparent px-4 py-2 text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="border-2 border-white/20 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-chalk transition hover:border-white/50 disabled:opacity-50"
                  >
                    {subscribing ? pc.emailSubmitting : pc.emailSubmit}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Wendler531Results({ numericMaxes, unit, pc, exerciseLabels }: { numericMaxes: Record<WendlerLift, number>; unit: WeightUnit; pc: TranslationShape["programCalc"]; exerciseLabels: TranslationShape["calculator"]["exercises"] }) {
  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-semibold">{pc.wendlerTitle}</h2>
<p className="mt-1 text-sm text-chalkDim">{pc.wendlerSubtitle}</p>

      <div className="mt-6 grid gap-6">
        {LIFTS.map((lift) => {
          const state = {
            cycleNumber: 1,
            weekNumber: 1 as const,
            trainingMaxKg: { ...numericMaxes, [lift.key]: 0 },
          };
          const tm = calculateTrainingMax(numericMaxes[lift.key], WENDLER_SETTINGS, WENDLER_SETTINGS.roundingIncrementKg);
          state.trainingMaxKg[lift.key] = tm;
          const sets = planWendlerLift(lift.key, state, WENDLER_SETTINGS);
          const fslSets = planFSLSets(lift.key, state, WENDLER_SETTINGS);

          return (
            <div key={lift.key} className="border-2 border-white/15 p-5">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg font-semibold">{exerciseLabels[lift.key]}</h3>
                <span className="text-sm text-chalkDim">TM: {displayWeight(tm, unit)} {unit}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {sets.map((set, i) => (
                  <div key={i} className="border border-white/10 p-3 text-center">
                    <div className="font-display text-2xl font-bold text-steelLight">
                      {displayWeight(set.weightKg, unit)}
                      <span className="text-xs text-chalkDim"> {unit}</span>
                    </div>
                    <div className="mt-1 text-sm text-chalkDim">
                      {set.reps}
                      {set.isAmrap ? "+" : ""} {pc.reps}
                    </div>
                  </div>
                ))}
              </div>

              {fslSets.length > 0 && (
                <>
                  <p className="mt-4 text-xs uppercase tracking-widest text-chalkDim">FSL 5×5</p>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {fslSets.map((set, i) => (
                      <div key={i} className="border border-white/10 p-2 text-center">
                        <div className="font-display text-sm font-bold text-steelLight">{displayWeight(set.weightKg, unit)}</div>
                        <div className="text-xs text-chalkDim">×{set.reps}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StartingStrengthResults({
  numericMaxes,
  wasReduced,
  unit,
  pc,
  exerciseLabels,
}: {
  numericMaxes: Record<WendlerLift, number>;
  wasReduced: boolean;
  unit: WeightUnit;
  pc: TranslationShape["programCalc"];
  exerciseLabels: TranslationShape["calculator"]["exercises"];
}) {
  const state = initStartingStrengthState({
    squat: numericMaxes.squat,
    benchPress: numericMaxes.bench_press,
    deadlift: numericMaxes.deadlift,
    overheadPress: numericMaxes.overhead_press,
  });
  const session = planSession(state, SS_SETTINGS);

  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-semibold">{pc.ssTitle(session.sessionType)}</h2>
      <p className="mt-1 text-sm text-chalkDim">
        {wasReduced ? pc.ssSubtitleReduced : pc.ssSubtitleNormal}
      </p>

      <div className="mt-6 grid gap-6">
        {session.exercises.map((exercise) => (
          <div key={exercise.exerciseSlug} className="border-2 border-white/15 p-5">
            <h3 className="font-display text-lg font-semibold">
              {exerciseLabels[exercise.exerciseSlug]}
            </h3>

            <p className="mt-3 text-xs uppercase tracking-widest text-chalkDim">{pc.warmup}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {exercise.warmupSets.map((w, i) => (
                <span key={i} className="border border-white/10 px-3 py-1 text-sm text-chalkDim">
                  {displayWeight(w.weightKg, unit)} {unit} × {w.reps}
                </span>
              ))}
            </div>

            <p className="mt-4 text-xs uppercase tracking-widest text-chalkDim">{pc.workingSets}</p>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {exercise.workingSets.map((w, i) => (
                <div key={i} className="border border-white/10 p-3 text-center">
                  <div className="font-display text-2xl font-bold text-steelLight">
                    {displayWeight(w.weightKg, unit)}
                    <span className="text-xs text-chalkDim"> {unit}</span>
                  </div>
                  <div className="mt-1 text-sm text-chalkDim">{w.reps} {pc.reps}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HepburnResults({ startingWeights, unit, pc, exerciseLabels }: { startingWeights: Record<WendlerLift, number>; unit: WeightUnit; pc: TranslationShape["programCalc"]; exerciseLabels: TranslationShape["calculator"]["exercises"] }) {
  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-semibold">{pc.hepburnTitle}</h2>
      <p className="mt-1 text-sm text-chalkDim">{pc.hepburnSubtitle}</p>

      <div className="mt-6 grid gap-6">
        {LIFTS.map((lift) => {
          const startWeight = startingWeights[lift.key];
          const state = { workingWeightKg: startWeight, schemeIndex: 1, consecutiveFailures: 0 };
          const warmup = generateHepburnWarmup(startWeight, HEPBURN_SETTINGS);
          const workingSets = planHepburnLift(state);

          return (
            <div key={lift.key} className="border-2 border-white/15 p-5">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg font-semibold">{exerciseLabels[lift.key]}</h3>
                <span className="text-sm text-chalkDim">
                  +{displayWeight(DEFAULT_HEPBURN_INCREMENTS_KG[lift.key as HepburnLift], unit)} {unit} {pc.hepburnAfter}
                </span>
              </div>

              <p className="mt-3 text-xs uppercase tracking-widest text-chalkDim">{pc.warmup}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {warmup.map((w, i) => (
                  <span key={i} className="border border-white/10 px-3 py-1 text-sm text-chalkDim">
                    {displayWeight(w.weightKg, unit)} {unit} × {w.reps}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-xs uppercase tracking-widest text-chalkDim">
                {pc.hepburnThisWeek(displayWeight(startWeight, unit), unit)}
              </p>
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {workingSets.map((set, i) => (
                  <div key={i} className="border border-white/10 p-2 text-center">
                    <div className="font-display text-sm font-bold text-steelLight">{displayWeight(set.weightKg, unit)}</div>
                    <div className="text-xs text-chalkDim">×{set.reps}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TexasMethodResults({ oneRepMaxes, unit, pc, exerciseLabels }: { oneRepMaxes: Record<WendlerLift, number>; unit: WeightUnit; pc: TranslationShape["programCalc"]; exerciseLabels: TranslationShape["calculator"]["exercises"] }) {
  // Texas Method иска "текущ 5RM или работна тежест" (документирано в оригинала) —
  // оценяваме 5RM от 1RM по формулата на Brzycki (~89%), без допълнителен запас.
  const estimate5RM = (max: number) => Math.round((max * (32 / 36)) / 2.5) * 2.5;

  const state = initTexasMethodState({
    squat: estimate5RM(oneRepMaxes.squat),
    benchPress: estimate5RM(oneRepMaxes.bench_press),
    overheadPress: estimate5RM(oneRepMaxes.overhead_press),
    deadlift: estimate5RM(oneRepMaxes.deadlift),
  });
  const plan = planVolumeDay(state, TEXAS_SETTINGS);

  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-semibold">{pc.texasTitle}</h2>
      <p className="mt-1 text-sm text-chalkDim">{pc.texasSubtitle}</p>

      <div className="mt-6 grid gap-6">
        <div className="border-2 border-white/15 p-5">
          <h3 className="font-display text-lg font-semibold">{exerciseLabels.squat}</h3>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {plan.squat.map((s, i) => (
              <div key={i} className="border border-white/10 p-2 text-center">
                <div className="font-display text-sm font-bold text-steelLight">{displayWeight(s.weightKg, unit)}</div>
                <div className="text-xs text-chalkDim">×{s.reps}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-2 border-white/15 p-5">
          <h3 className="font-display text-lg font-semibold">{exerciseLabels[plan.heavyUpperLift.lift]}</h3>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {plan.heavyUpperLift.sets.map((s, i) => (
              <div key={i} className="border border-white/10 p-2 text-center">
                <div className="font-display text-sm font-bold text-steelLight">{displayWeight(s.weightKg, unit)}</div>
                <div className="text-xs text-chalkDim">×{s.reps}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-2 border-white/15 p-5">
          <h3 className="font-display text-lg font-semibold">{exerciseLabels.deadlift}</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 w-24">
            <div className="border border-white/10 p-2 text-center">
              <div className="font-display text-sm font-bold text-steelLight">{displayWeight(state.currentDeadliftKg, unit)}</div>
              <div className="text-xs text-chalkDim">×5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SurovetskyResults({ benchOneRepMax, unit, pc }: { benchOneRepMax: number; unit: WeightUnit; pc: TranslationShape["programCalc"] }) {
  const state = initTableEngineState("surovetsky-1", benchOneRepMax);
  const { session, sets } = planTableSession(surovetskySystem1, state, 2.5);

  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-semibold">{session.name}</h2>
<p className="mt-1 text-sm text-chalkDim">{pc.surovetskySubtitle}</p>
      <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {sets.map((s, i) => (
          <div key={i} className="border border-white/10 p-2 text-center">
            <div className="font-display text-sm font-bold text-steelLight">{displayWeight(s.weightKg, unit)}</div>
            <div className="text-xs text-chalkDim">
              ×{s.reps}
              {s.isPausedRep ? " ⏸" : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JuggernautResults({
  oneRepMaxes,
  variant,
  unit,
  pc,
  exerciseLabels,
}: {
  oneRepMaxes: Record<WendlerLift, number>;
  variant: "classic" | "excel";
  unit: WeightUnit;
  pc: TranslationShape["programCalc"];
  exerciseLabels: TranslationShape["calculator"]["exercises"];
}) {
  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-semibold">{pc.juggernautTitle}</h2>
      <p className="mt-1 text-sm text-chalkDim">
        {pc.juggernautSubtitle(variant === "classic" ? pc.juggernautClassic : pc.juggernautExcel)}
      </p>

      <div className="mt-6 grid gap-6">
        {LIFTS.map((lift) => {
          const sets =
            variant === "classic"
              ? planJuggernautWeek(
                  lift.key as JuggernautLift,
                  initJuggernautClassicState(oneRepMaxes as any, {
                    roundingIncrementKg: 2.5,
                    trainingMaxPercentOf1RM: 0.9,
                    progressionStyle: "standard",
                  }),
                  { roundingIncrementKg: 2.5, trainingMaxPercentOf1RM: 0.9, progressionStyle: "standard" }
                )
              : planJuggernautExcelWeek(
                  lift.key as JuggernautLift,
                  initJuggernautExcelState(oneRepMaxes as any, DEFAULT_JUGGERNAUT_EXCEL_SETTINGS),
                  DEFAULT_JUGGERNAUT_EXCEL_SETTINGS
                );

          return (
            <div key={lift.key} className="border-2 border-white/15 p-5">
              <h3 className="font-display text-lg font-semibold">{exerciseLabels[lift.key]}</h3>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {sets.map((s, i) => (
                  <div key={i} className="border border-white/10 p-2 text-center">
                    <div className="font-display text-sm font-bold text-steelLight">{displayWeight(s.weightKg, unit)}</div>
                    <div className="text-xs text-chalkDim">
                      ×{s.reps}
                      {s.isAmrap ? "+" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
