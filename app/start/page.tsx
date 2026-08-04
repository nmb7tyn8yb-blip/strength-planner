"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { createFirstStartingStrengthWorkout, createFirstWendlerWorkout, createFirstHepburnWorkout, createFirstTexasWorkout, createFirstSurovetskyWorkout, createFirstJuggernautClassicWorkout, createFirstJuggernautExcelWorkout } from "@/lib/workout-engine";

type Step = "loading" | "auth" | "profile" | "saving" | "done" | "error";
type AuthMode = "signup" | "login";

const PRIMARY_LIFTS = [
  { key: "squat", exerciseName: "Клек", label: "Клек" },
  { key: "bench_press", exerciseName: "Лежанка", label: "Лежанка" },
  { key: "deadlift", exerciseName: "Мъртва тяга", label: "Мъртва тяга" },
  { key: "overhead_press", exerciseName: "Военна преса", label: "Военна преса" },
] as const;

export default function StartPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-graphite px-6 py-16 text-chalk" />}>
      <StartPageInner />
    </Suspense>
  );
}

function StartPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const programSlug = searchParams.get("program") ?? "";

  const [step, setStep] = useState<Step>("loading");
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [errorMessage, setErrorMessage] = useState("");

  // авторизация
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // профил
  const [displayName, setDisplayName] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [unitSystem, setUnitSystem] = useState<"kg" | "lb">("kg");
  const [plateIncrement, setPlateIncrement] = useState(2.5);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [maxes, setMaxes] = useState<Record<string, string>>({
    squat: searchParams.get("squat") ?? "",
    bench_press: searchParams.get("bench") ?? "",
    deadlift: searchParams.get("deadlift") ?? "",
    overhead_press: searchParams.get("press") ?? "",
  });
  const [planReady, setPlanReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setStep(data.session ? "profile" : "auth");
    });
  }, []);

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const { error } =
      authMode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setStep("profile");
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("saving");
    setErrorMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setErrorMessage("Сесията изтече — влез отново.");
      setStep("auth");
      return;
    }

    try {
      // 1. профил (публична част)
      await supabase.from("profiles").upsert({
        id: userId,
        display_name: displayName || email,
        email,
      });

      // 2. тренировъчен профил
      await supabase.from("athlete_profiles").upsert(
        {
          user_id: userId,
          experience_level: experienceLevel,
          unit_system: unitSystem,
          plate_increment_kg: plateIncrement,
          sessions_per_week: sessionsPerWeek,
        },
        { onConflict: "user_id" }
      );

      // 3. максимуми — тегли exercise_id по име от каталога
      const { data: exercises } = await supabase
        .from("exercises")
        .select("id, name")
        .in(
          "name",
          PRIMARY_LIFTS.map((l) => l.exerciseName)
        );

      const maxRows = PRIMARY_LIFTS.filter((lift) => maxes[lift.key] && Number(maxes[lift.key]) > 0)
        .map((lift) => {
          const exercise = exercises?.find((ex) => ex.name === lift.exerciseName);
          if (!exercise) return null;
          return {
            user_id: userId,
            exercise_id: exercise.id,
            one_rep_max: Number(maxes[lift.key]),
            source: "tested",
          };
        })
        .filter(Boolean);

      if (maxRows.length > 0) {
        await supabase.from("exercise_maxes").insert(maxRows as any[]);
      }

      // 4. намери избраната програма и създай генериран план
      let firstWorkoutCreated = false;
      if (programSlug) {
        const { data: program } = await supabase
          .from("programs")
          .select("id")
          .eq("slug", programSlug)
          .single();

        if (program) {
          const startDate = new Date().toISOString().slice(0, 10);
          const { data: plan } = await supabase
            .from("generated_plans")
            .insert({
              user_id: userId,
              program_id: program.id,
              start_date: startDate,
              settings: {
                progression_style: "standard",
                rounding_increment_kg: plateIncrement,
                amrap_enabled: true,
              },
            })
            .select()
            .single();

          if (plan && programSlug === "starting-strength") {
            await createFirstStartingStrengthWorkout(
              supabase,
              plan.id,
              {
                squat: Number(maxes.squat) || 40,
                bench_press: Number(maxes.bench_press) || 30,
                deadlift: Number(maxes.deadlift) || 50,
                overhead_press: Number(maxes.overhead_press) || 20,
              },
              startDate
            );
            firstWorkoutCreated = true;
          }

          if (plan && programSlug === "531") {
            await createFirstWendlerWorkout(
              supabase,
              plan.id,
              {
                squat: Number(maxes.squat) || 60,
                bench_press: Number(maxes.bench_press) || 40,
                deadlift: Number(maxes.deadlift) || 80,
                overhead_press: Number(maxes.overhead_press) || 30,
              },
              startDate
            );
            firstWorkoutCreated = true;
          }

          if (plan && programSlug === "hepburn-a") {
            await createFirstHepburnWorkout(
              supabase,
              plan.id,
              {
                squat: Number(maxes.squat) || 60,
                bench_press: Number(maxes.bench_press) || 40,
                deadlift: Number(maxes.deadlift) || 80,
                overhead_press: Number(maxes.overhead_press) || 30,
              },
              startDate
            );
            firstWorkoutCreated = true;
          }

          if (plan && programSlug === "texas-method") {
            await createFirstTexasWorkout(
              supabase,
              plan.id,
              {
                squat: Number(maxes.squat) || 80,
                benchPress: Number(maxes.bench_press) || 60,
                overheadPress: Number(maxes.overhead_press) || 40,
                deadlift: Number(maxes.deadlift) || 100,
              },
              startDate
            );
            firstWorkoutCreated = true;
          }

          if (plan && (programSlug === "surovetsky-1" || programSlug === "surovetsky-2" || programSlug === "surovetsky-full")) {
            await createFirstSurovetskyWorkout(supabase, plan.id, Number(maxes.bench_press) || 60, startDate);
            firstWorkoutCreated = true;
          }

          if (plan && programSlug === "juggernaut") {
            await createFirstJuggernautClassicWorkout(
              supabase,
              plan.id,
              {
                squat: Number(maxes.squat) || 100,
                bench_press: Number(maxes.bench_press) || 70,
                deadlift: Number(maxes.deadlift) || 130,
                overhead_press: Number(maxes.overhead_press) || 50,
              },
              startDate
            );
            firstWorkoutCreated = true;
          }

          if (plan && programSlug === "juggernaut-excel") {
            await createFirstJuggernautExcelWorkout(
              supabase,
              plan.id,
              {
                squat: Number(maxes.squat) || 100,
                bench_press: Number(maxes.bench_press) || 70,
                deadlift: Number(maxes.deadlift) || 130,
                overhead_press: Number(maxes.overhead_press) || 50,
              },
              startDate
            );
            firstWorkoutCreated = true;
          }
        }
      }

      setStep("done");
      setPlanReady(firstWorkoutCreated);
    } catch (err) {
      setErrorMessage("Нещо се обърка при запазването. Опитай пак.");
      setStep("error");
    }
  }

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-xl">
        {step === "loading" && <p className="text-chalkDim">Зареждане…</p>}

        {step === "auth" && (
          <>
            <h1 className="font-display text-3xl font-semibold">
              {authMode === "signup" ? "Направи профил" : "Влез в профила си"}
            </h1>
            <p className="mt-2 text-chalkDim">
              Нужен е, за да пазим твоя календар, максимуми и прогрес.
            </p>

            <form onSubmit={handleAuthSubmit} className="mt-8 grid gap-4">
              <input
                type="email"
                required
                placeholder="Имейл"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Парола (мин. 6 символа)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
              />

              {errorMessage && <p className="text-sm text-rust">{errorMessage}</p>}

              <button
                type="submit"
                className="mt-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
              >
                {authMode === "signup" ? "Регистрирай се" : "Влез"}
              </button>
            </form>

            <button
              onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
              className="mt-4 text-sm text-chalkDim underline-offset-4 hover:text-chalk hover:underline"
            >
              {authMode === "signup" ? "Вече имаш профил? Влез" : "Нямаш профил? Регистрирай се"}
            </button>
          </>
        )}

        {(step === "profile" || step === "saving") && (
          <>
            <h1 className="font-display text-3xl font-semibold">Твоят профил</h1>
            <p className="mt-2 text-chalkDim">
              Нужно е само веднъж — после винаги можеш да го редактираш.
            </p>

            <form onSubmit={handleProfileSubmit} className="mt-8 grid gap-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-chalkDim">Име</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Псевдоним"
                  className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-chalkDim">
                    Тренировъчен стаж
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="mt-1 w-full border-2 border-white/15 bg-graphite px-4 py-3 text-chalk focus:border-amber"
                  >
                    <option value="beginner">Начинаещ</option>
                    <option value="intermediate">Средно напреднал</option>
                    <option value="advanced">Напреднал</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-chalkDim">
                    Мерни единици
                  </label>
                  <select
                    value={unitSystem}
                    onChange={(e) => setUnitSystem(e.target.value as "kg" | "lb")}
                    className="mt-1 w-full border-2 border-white/15 bg-graphite px-4 py-3 text-chalk focus:border-amber"
                  >
                    <option value="kg">Килограми</option>
                    <option value="lb">Паундове</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-chalkDim">
                    Стъпка на дисковете (kg)
                  </label>
                  <select
                    value={plateIncrement}
                    onChange={(e) => setPlateIncrement(Number(e.target.value))}
                    className="mt-1 w-full border-2 border-white/15 bg-graphite px-4 py-3 text-chalk focus:border-amber"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={2.5}>2.5</option>
                    <option value={5}>5</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-chalkDim">
                    Дни седмично
                  </label>
                  <select
                    value={sessionsPerWeek}
                    onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                    className="mt-1 w-full border-2 border-white/15 bg-graphite px-4 py-3 text-chalk focus:border-amber"
                  >
                    {[2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-chalkDim">
                  Стартови максимуми (kg) — попълни каквото знаеш
                </label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {PRIMARY_LIFTS.map((lift) => (
                    <div key={lift.key}>
                      <span className="text-sm text-chalk">{lift.label}</span>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        placeholder="напр. 80"
                        value={maxes[lift.key] ?? ""}
                        onChange={(e) => setMaxes({ ...maxes, [lift.key]: e.target.value })}
                        className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-2 text-chalk placeholder:text-chalkDim focus:border-amber"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {errorMessage && <p className="text-sm text-rust">{errorMessage}</p>}

              <button
                type="submit"
                disabled={step === "saving"}
                className="mt-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber disabled:opacity-50"
              >
                {step === "saving" ? "Запазваме…" : "Създай моята програма"}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="py-12 text-center">
            <h1 className="font-display text-3xl font-semibold text-amber">Готово!</h1>
            {planReady ? (
              <>
                <p className="mt-4 text-chalkDim">
                  Първата ти тренировка вече е готова, изчислена от твоите данни.
                </p>
                <a
                  href="/today"
                  className="mt-6 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
                >
                  Към днешната тренировка →
                </a>
              </>
            ) : (
              <p className="mt-4 text-chalkDim">
                Профилът и планът ти са запазени. Календарният екран за тази програма е в
                процес на изграждане — засега данните ти вече чакат готови в базата.
              </p>
            )}
          </div>
        )}

        {step === "error" && (
          <div className="py-12 text-center">
            <p className="text-rust">{errorMessage}</p>
            <button
              onClick={() => setStep("profile")}
              className="mt-6 border-2 border-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-amber transition hover:bg-amber hover:text-graphite"
            >
              Пробвай пак
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
