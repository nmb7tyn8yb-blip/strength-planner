"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useLanguage } from "@/components/language-provider";
import { createFirstCustomWorkout } from "@/lib/workout-engine";
import LoadingScreen from "@/components/loading-screen";

interface ExerciseRow {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  rest: string;
  isAmrap: boolean;
  mode: "kg" | "percent";
  percentOf: "squat" | "bench_press" | "deadlift" | "overhead_press";
  percent: string;
}

interface SessionRow {
  name: string;
  exercises: ExerciseRow[];
}

function emptyExercise(): ExerciseRow {
  return {
    name: "",
    sets: "3",
    reps: "10",
    weight: "0",
    rest: "90",
    isAmrap: false,
    mode: "kg",
    percentOf: "squat",
    percent: "70",
  };
}

function emptySession(name: string): SessionRow {
  return { name, exercises: [emptyExercise()] };
}

export default function CreateProgramPage() {
  const { localizedHref, t } = useLanguage();
  const cp = t.createProgram;
  const aw = t.activePlanWarning;
  const router = useRouter();
  const [phase, setPhase] = useState<"checking" | "no-auth" | "form" | "saving" | "done" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [programName, setProgramName] = useState("");
  const [sessions, setSessions] = useState<SessionRow[]>([emptySession(cp.dayNamePrefix(1))]);
  const [existingActivePlan, setExistingActivePlan] = useState<{ name: string; date: string } | null>(null);
  const [maxes, setMaxes] = useState<Record<string, string>>({
    squat: "",
    bench_press: "",
    deadlift: "",
    overhead_press: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setPhase(data.user ? "form" : "no-auth");

      if (data.user) {
        const { data: activePlans } = await supabase
          .from("generated_plans")
          .select("start_date, programs(name), custom_programs(name)")
          .eq("user_id", data.user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1);

        const activePlan = activePlans?.[0] as any;
        if (activePlan) {
          setExistingActivePlan({
            name: activePlan.programs?.name ?? activePlan.custom_programs?.name ?? "програма",
            date: activePlan.start_date,
          });
        }
      }
    });
  }, []);

  function computeWeightKg(ex: ExerciseRow): number {
    if (ex.mode === "kg") return Number(ex.weight) || 0;
    const max = Number(maxes[ex.percentOf]) || 0;
    const pct = Number(ex.percent) || 0;
    return Math.round(((max * pct) / 100) * 2) / 2; // закръглено до 0.5кг
  }

  function updateSessionName(sIndex: number, name: string) {
    const next = [...sessions];
    next[sIndex] = { ...next[sIndex], name };
    setSessions(next);
  }

  function updateExercise(sIndex: number, eIndex: number, field: keyof ExerciseRow, value: string | boolean) {
    const next = [...sessions];
    const exercises = [...next[sIndex].exercises];
    exercises[eIndex] = { ...exercises[eIndex], [field]: value };
    next[sIndex] = { ...next[sIndex], exercises };
    setSessions(next);
  }

  function addExercise(sIndex: number) {
    const next = [...sessions];
    next[sIndex] = { ...next[sIndex], exercises: [...next[sIndex].exercises, emptyExercise()] };
    setSessions(next);
  }

  function removeExercise(sIndex: number, eIndex: number) {
    const next = [...sessions];
    next[sIndex] = { ...next[sIndex], exercises: next[sIndex].exercises.filter((_, i) => i !== eIndex) };
    setSessions(next);
  }

  function addSession() {
    setSessions([...sessions, emptySession(cp.dayNamePrefix(sessions.length + 1))]);
  }

  function removeSession(sIndex: number) {
    setSessions(sessions.filter((_, i) => i !== sIndex));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPhase("saving");
    setErrorMessage("");

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error(cp.sessionExpiredError);

      // 1. самата програма
      const { data: customProgram, error: programError } = await supabase
        .from("custom_programs")
        .insert({ user_id: userId, name: programName || cp.title, days_per_week: sessions.length })
        .select()
        .single();
      if (programError || !customProgram) throw new Error(cp.saveProgramError);

      // 2. сесиите + упражненията
      for (let i = 0; i < sessions.length; i++) {
        const { data: sessionRow, error: sessionError } = await supabase
          .from("custom_program_sessions")
          .insert({
            custom_program_id: customProgram.id,
            day_order: i + 1,
            session_name: sessions[i].name || cp.dayNamePrefix(i + 1),
          })
          .select()
          .single();
        if (sessionError || !sessionRow) throw new Error(cp.saveDayError);

        const exerciseRows = sessions[i].exercises
          .filter((ex) => ex.name.trim() !== "")
          .map((ex, idx) => ({
            custom_program_session_id: sessionRow.id,
            order_index: idx,
            exercise_name: ex.name.trim(),
            sets: Number(ex.sets) || 1,
            reps: Number(ex.reps) || 1,
            weight_kg: computeWeightKg(ex),
            rest_seconds: Number(ex.rest) || 90,
            is_amrap: ex.isAmrap,
          }));

        if (exerciseRows.length > 0) {
          const { error: exercisesError } = await supabase.from("custom_program_exercises").insert(exerciseRows);
          if (exercisesError) throw new Error(cp.saveExercisesError);
        }
      }

      // 3. генерираният план + първата тренировка
      const startDate = new Date().toISOString().slice(0, 10);
      const { data: plan, error: planError } = await supabase
        .from("generated_plans")
        .insert({
          user_id: userId,
          custom_program_id: customProgram.id,
          start_date: startDate,
          settings: {},
        })
        .select()
        .single();
      if (planError || !plan) throw new Error(cp.createPlanError);

      await createFirstCustomWorkout(supabase, plan.id, customProgram.id, startDate);

      setPhase("done");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || cp.genericError);
      setPhase("error");
    }
  }

  if (phase === "checking") return <LoadingScreen label={cp.loadingProfile} />;

  if (phase === "no-auth") {
    return (
      <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-2xl font-semibold">{cp.authRequired}</h1>
<p className="mt-3 text-chalkDim">{cp.authRequiredDesc}</p>
          <a
            href={localizedHref("/start")}
            className="mt-6 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
          >
            {cp.makeProfile}
          </a>
        </div>
      </main>
    );
  }

  if (phase === "done") {
    return (
      <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-3xl font-semibold text-amber">{cp.doneTitle}</h1>
<p className="mt-4 text-chalkDim">{cp.doneDesc}</p>
          <a
            href={localizedHref("/today")}
            className="mt-6 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
          >
            {cp.goToToday}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">{cp.title}</h1>
<p className="mt-2 text-chalkDim">{cp.subtitle}</p>

        {existingActivePlan && (
          <div className="mt-6 border-2 border-amber p-5">
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-amber">{aw.badge}</p>
            <p className="mt-2 text-sm text-chalk">
              <strong>{existingActivePlan.name}</strong>, {aw.startedOn(existingActivePlan.date)} {aw.createNew}{" "}
              <strong>{aw.newSeparate}</strong> {aw.restOfSentence}
            </p>
            <a href={localizedHref("/pro")} className="mt-2 inline-block text-xs text-amber underline-offset-4 hover:underline">
              {aw.proLink}
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 grid gap-8">
          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">{cp.programNameLabel}</label>
            <input
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder={cp.programNamePlaceholder}
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
            />
          </div>

          <div className="border border-white/10 p-4">
            <p className="text-xs uppercase tracking-widest text-chalkDim">{cp.maxesLabel}</p>
            <p className="mt-1 text-xs text-chalkDim">{cp.maxesHint}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(["squat", "bench_press", "deadlift", "overhead_press"] as const).map((lift) => (
                <div key={lift}>
                  <label className="text-xs text-chalkDim">{t.calculator.exercises[lift]}</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={maxes[lift]}
                    onChange={(e) => setMaxes({ ...maxes, [lift]: e.target.value })}
                    placeholder={cp.maxPlaceholder}
                    className="mt-1 w-full border-2 border-white/15 bg-transparent px-3 py-2 text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                  />
                </div>
              ))}
            </div>
          </div>

          {sessions.map((session, sIndex) => (
            <div key={sIndex} className="border-2 border-white/15 p-5">
              <div className="flex items-center justify-between gap-3">
                <input
                  value={session.name}
                  onChange={(e) => updateSessionName(sIndex, e.target.value)}
                  className="w-full border-2 border-white/15 bg-transparent px-3 py-2 font-display text-lg font-semibold text-chalk focus:border-amber"
                />
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSession(sIndex)}
                    className="border-2 border-white/15 px-3 py-2 text-xs uppercase tracking-wide text-chalkDim transition hover:border-rust hover:text-rust"
                  >
                    {cp.deleteDay}
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-3">
                <div className="grid grid-cols-12 gap-2 px-3 text-xs uppercase tracking-wide text-chalkDim">
                  <span className="col-span-3">{cp.exerciseHeader}</span>
                  <span className="col-span-2 text-center">{cp.setsHeader}</span>
                  <span className="col-span-2 text-center">{cp.repsHeader}</span>
                  <span className="col-span-2 text-center">{cp.kgHeader}</span>
                  <span className="col-span-1"></span>
                  <span className="col-span-1 text-center">{cp.restHeader}</span>
                  <span className="col-span-1"></span>
                </div>
                {session.exercises.map((ex, eIndex) => (
                  <div key={eIndex} className="grid grid-cols-12 items-center gap-2 border border-white/10 p-3">
                    <input
                      value={ex.name}
                      onChange={(e) => updateExercise(sIndex, eIndex, "name", e.target.value)}
                      placeholder={cp.exercisePlaceholder}
                      className="col-span-3 border-2 border-white/15 bg-transparent px-2 py-2 text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                    />
                    <input
                      value={ex.sets}
                      onChange={(e) => updateExercise(sIndex, eIndex, "sets", e.target.value)}
                      type="number"
                      min={1}
                      placeholder={cp.setsPlaceholder}
                      className="col-span-2 border-2 border-white/15 bg-transparent px-2 py-2 text-center text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                    />
                    <input
                      value={ex.reps}
                      onChange={(e) => updateExercise(sIndex, eIndex, "reps", e.target.value)}
                      type="number"
                      min={1}
                      placeholder={cp.repsPlaceholder}
                      className="col-span-2 border-2 border-white/15 bg-transparent px-2 py-2 text-center text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                    />
                    {ex.mode === "kg" ? (
                      <input
                        value={ex.weight}
                        onChange={(e) => updateExercise(sIndex, eIndex, "weight", e.target.value)}
                        type="number"
                        min={0}
                        step={0.5}
                        placeholder={cp.kgPlaceholder}
                        className="col-span-2 border-2 border-white/15 bg-transparent px-2 py-2 text-center text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                      />
                    ) : (
                      <div className="col-span-2 grid gap-1">
                        <select
                          value={ex.percentOf}
                          onChange={(e) => updateExercise(sIndex, eIndex, "percentOf", e.target.value)}
                          className="border-2 border-white/15 bg-graphite px-1 py-1 text-xs text-chalk focus:border-amber"
                        >
                          <option value="squat">{t.calculator.exercises.squat}</option>
                          <option value="bench_press">{t.calculator.exercises.bench_press}</option>
                          <option value="deadlift">{t.calculator.exercises.deadlift}</option>
                          <option value="overhead_press">{t.calculator.exercises.overhead_press}</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <input
                            value={ex.percent}
                            onChange={(e) => updateExercise(sIndex, eIndex, "percent", e.target.value)}
                            type="number"
                            min={0}
                            max={200}
                            className="w-full border-2 border-white/15 bg-transparent px-1 py-1 text-center text-xs text-chalk focus:border-amber"
                          />
                          <span className="text-xs text-chalkDim">%</span>
                        </div>
                        <p className="text-center text-[10px] text-amber">≈ {computeWeightKg(ex)} kg</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        updateExercise(sIndex, eIndex, "mode", ex.mode === "kg" ? "percent" : "kg")
                      }
                      className="col-span-1 text-[10px] uppercase text-steelLight underline-offset-2 hover:underline"
                    >
                      {ex.mode === "kg" ? cp.switchToPercent : cp.switchToKg}
                    </button>
                    <input
                      value={ex.rest}
                      onChange={(e) => updateExercise(sIndex, eIndex, "rest", e.target.value)}
                      type="number"
                      min={0}
                      placeholder={cp.restPlaceholder}
                      className="col-span-1 border-2 border-white/15 bg-transparent px-2 py-2 text-center text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(sIndex, eIndex)}
                      className="col-span-1 text-chalkDim transition hover:text-rust"
                      aria-label={cp.deleteExerciseLabel}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addExercise(sIndex)}
                className="mt-3 text-sm text-steelLight underline-offset-4 hover:underline"
              >
                {cp.addExercise}
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSession}
            className="border-2 border-white/20 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-chalk transition hover:border-white/50"
          >
            {cp.addDay}
          </button>

          {errorMessage && <p className="text-sm text-rust">{errorMessage}</p>}

          <button
            type="submit"
            disabled={phase === "saving"}
            className="border-2 border-amber bg-amber px-6 py-4 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber disabled:opacity-50"
          >
            {phase === "saving" ? cp.savingButton : cp.createButton}
          </button>
        </form>
      </div>
    </main>
  );
}
