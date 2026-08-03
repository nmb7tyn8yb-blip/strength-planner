"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { createFirstCustomWorkout } from "@/lib/workout-engine";
import LoadingScreen from "@/components/loading-screen";

interface ExerciseRow {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  rest: string;
  isAmrap: boolean;
}

interface SessionRow {
  name: string;
  exercises: ExerciseRow[];
}

function emptyExercise(): ExerciseRow {
  return { name: "", sets: "3", reps: "10", weight: "0", rest: "90", isAmrap: false };
}

function emptySession(index: number): SessionRow {
  return { name: `Ден ${index + 1}`, exercises: [emptyExercise()] };
}

export default function CreateProgramPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"checking" | "no-auth" | "form" | "saving" | "done" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [programName, setProgramName] = useState("");
  const [sessions, setSessions] = useState<SessionRow[]>([emptySession(0)]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setPhase(data.user ? "form" : "no-auth");
    });
  }, []);

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
    setSessions([...sessions, emptySession(sessions.length)]);
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
      if (!userId) throw new Error("Сесията изтече — влез отново.");

      // 1. самата програма
      const { data: customProgram, error: programError } = await supabase
        .from("custom_programs")
        .insert({ user_id: userId, name: programName || "Моята програма", days_per_week: sessions.length })
        .select()
        .single();
      if (programError || !customProgram) throw new Error("Не успяхме да запазим програмата.");

      // 2. сесиите + упражненията
      for (let i = 0; i < sessions.length; i++) {
        const { data: sessionRow, error: sessionError } = await supabase
          .from("custom_program_sessions")
          .insert({
            custom_program_id: customProgram.id,
            day_order: i + 1,
            session_name: sessions[i].name || `Ден ${i + 1}`,
          })
          .select()
          .single();
        if (sessionError || !sessionRow) throw new Error("Не успяхме да запазим тренировъчния ден.");

        const exerciseRows = sessions[i].exercises
          .filter((ex) => ex.name.trim() !== "")
          .map((ex, idx) => ({
            custom_program_session_id: sessionRow.id,
            order_index: idx,
            exercise_name: ex.name.trim(),
            sets: Number(ex.sets) || 1,
            reps: Number(ex.reps) || 1,
            weight_kg: Number(ex.weight) || 0,
            rest_seconds: Number(ex.rest) || 90,
            is_amrap: ex.isAmrap,
          }));

        if (exerciseRows.length > 0) {
          const { error: exercisesError } = await supabase.from("custom_program_exercises").insert(exerciseRows);
          if (exercisesError) throw new Error("Не успяхме да запазим упражненията.");
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
      if (planError || !plan) throw new Error("Не успяхме да създадем плана.");

      await createFirstCustomWorkout(supabase, plan.id, customProgram.id, startDate);

      setPhase("done");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Нещо се обърка. Опитай пак.");
      setPhase("error");
    }
  }

  if (phase === "checking") return <LoadingScreen label="Проверяваме профила ти…" />;

  if (phase === "no-auth") {
    return (
      <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-2xl font-semibold">Нужен е профил</h1>
          <p className="mt-3 text-chalkDim">
            За да създадеш и следиш собствена програма, първо ти трябва профил (безплатно).
          </p>
          <a
            href="/start"
            className="mt-6 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
          >
            Направи профил →
          </a>
        </div>
      </main>
    );
  }

  if (phase === "done") {
    return (
      <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-3xl font-semibold text-amber">Готово!</h1>
          <p className="mt-4 text-chalkDim">
            Твоята програма е запазена. Първата тренировка вече те чака — сайтът ще
            повтаря шаблона ти всяка седмица и ще следи прогреса ти автоматично.
          </p>
          <a
            href="/today"
            className="mt-6 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
          >
            Към днешната тренировка →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Създай своя програма</h1>
        <p className="mt-2 text-chalkDim">
          Определи седмичния си шаблон веднъж — сайтът ще го повтаря автоматично всяка
          седмица и ще ти показва днешната тренировка на ред, точно както при готовите
          програми. Промяна на тежести/повторения правиш, като редактираш шаблона си.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-8">
          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">Име на програмата</label>
            <input
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="напр. Моята сплит програма"
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
            />
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
                    Изтрий деня
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-3">
                {session.exercises.map((ex, eIndex) => (
                  <div key={eIndex} className="grid grid-cols-12 items-center gap-2 border border-white/10 p-3">
                    <input
                      value={ex.name}
                      onChange={(e) => updateExercise(sIndex, eIndex, "name", e.target.value)}
                      placeholder="Упражнение"
                      className="col-span-4 border-2 border-white/15 bg-transparent px-2 py-2 text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                    />
                    <input
                      value={ex.sets}
                      onChange={(e) => updateExercise(sIndex, eIndex, "sets", e.target.value)}
                      type="number"
                      min={1}
                      placeholder="Серии"
                      className="col-span-2 border-2 border-white/15 bg-transparent px-2 py-2 text-center text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                    />
                    <input
                      value={ex.reps}
                      onChange={(e) => updateExercise(sIndex, eIndex, "reps", e.target.value)}
                      type="number"
                      min={1}
                      placeholder="Повт."
                      className="col-span-2 border-2 border-white/15 bg-transparent px-2 py-2 text-center text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                    />
                    <input
                      value={ex.weight}
                      onChange={(e) => updateExercise(sIndex, eIndex, "weight", e.target.value)}
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="Кг"
                      className="col-span-2 border-2 border-white/15 bg-transparent px-2 py-2 text-center text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                    />
                    <input
                      value={ex.rest}
                      onChange={(e) => updateExercise(sIndex, eIndex, "rest", e.target.value)}
                      type="number"
                      min={0}
                      placeholder="Почивка сек"
                      className="col-span-1 border-2 border-white/15 bg-transparent px-2 py-2 text-center text-sm text-chalk placeholder:text-chalkDim focus:border-amber"
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(sIndex, eIndex)}
                      className="col-span-1 text-chalkDim transition hover:text-rust"
                      aria-label="Изтрий упражнението"
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
                + Добави упражнение
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSession}
            className="border-2 border-white/20 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-chalk transition hover:border-white/50"
          >
            + Добави тренировъчен ден
          </button>

          {errorMessage && <p className="text-sm text-rust">{errorMessage}</p>}

          <button
            type="submit"
            disabled={phase === "saving"}
            className="border-2 border-amber bg-amber px-6 py-4 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber disabled:opacity-50"
          >
            {phase === "saving" ? "Запазваме…" : "Създай програмата →"}
          </button>
        </form>
      </div>
    </main>
  );
}
