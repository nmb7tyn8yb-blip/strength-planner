"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import LoadingScreen from "@/components/loading-screen";
import EmptyState from "@/components/empty-state";

export default function AdminEditProgramPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [phase, setPhase] = useState<"checking" | "denied" | "ready" | "saving" | "saved" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("beginner");
  const [primaryGoal, setPrimaryGoal] = useState("strength");
  const [daysPerWeek, setDaysPerWeek] = useState("3");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [equipment, setEquipment] = useState("");
  const [failureRule, setFailureRule] = useState("");
  const [pitch, setPitch] = useState("");
  const [recommendationProfile, setRecommendationProfile] = useState<any>({});
  const [overview, setOverview] = useState("");
  const [howItWorks, setHowItWorks] = useState("");
  const [bestFor, setBestFor] = useState("");
  const [considerations, setConsiderations] = useState("");

  useEffect(() => {
    load();
  }, [slug]);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setPhase("denied");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
    if (!profile?.is_admin) {
      setPhase("denied");
      return;
    }

    const { data: program, error } = await supabase.from("programs").select("*").eq("slug", slug).single();
    if (error || !program) {
      setPhase("error");
      setErrorMessage("Не намерихме тази програма.");
      return;
    }

    setName(program.name ?? "");
    setDescription(program.description ?? "");
    setLevel(program.level ?? "beginner");
    setPrimaryGoal(program.primary_goal ?? "strength");
    setDaysPerWeek(String(program.days_per_week ?? 3));
    setDurationWeeks(program.duration_weeks ? String(program.duration_weeks) : "");
    setEquipment((program.required_equipment ?? []).join(", "));
    setFailureRule(program.failure_rule_summary ?? "");
    setRecommendationProfile(program.recommendation_profile ?? {});
    setPitch(program.recommendation_profile?.pitch ?? "");
    setOverview(program.detailed_description?.overview ?? "");
    setHowItWorks(program.detailed_description?.how_it_works ?? "");
    setBestFor((program.detailed_description?.best_for ?? []).join("\n"));
    setConsiderations((program.detailed_description?.considerations ?? []).join("\n"));

    setPhase("ready");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setPhase("saving");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("programs")
        .update({
          name,
          description,
          level,
          primary_goal: primaryGoal,
          days_per_week: Number(daysPerWeek) || 1,
          duration_weeks: durationWeeks ? Number(durationWeeks) : null,
          required_equipment: equipment
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          failure_rule_summary: failureRule,
          recommendation_profile: { ...recommendationProfile, pitch },
          detailed_description: {
            overview,
            how_it_works: howItWorks,
            best_for: bestFor.split("\n").map((s) => s.trim()).filter(Boolean),
            considerations: considerations.split("\n").map((s) => s.trim()).filter(Boolean),
          },
        })
        .eq("slug", slug);

      if (error) throw new Error(error.message);
      setPhase("saved");
    } catch (err: any) {
      setErrorMessage(err?.message || "Нещо се обърка при запазването.");
      setPhase("error");
    }
  }

  if (phase === "checking") return <LoadingScreen label="Проверяваме достъпа ти…" />;

  if (phase === "denied") {
    return (
      <EmptyState
        title="Нямаш достъп до тази страница"
        description="Административният редактор е достъпен само за одобрени администратори."
        ctaHref="/"
        ctaLabel="Обратно към началото"
      />
    );
  }

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin" className="text-sm text-chalkDim hover:text-chalk">
          ← Всички програми
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold">Редактираш: {name}</h1>

        <form onSubmit={handleSave} className="mt-8 grid gap-6">
          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">Име</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">Кратко описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">
              Pitch (кратка реклама в картата на каталога)
            </label>
            <input
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk focus:border-amber"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-chalkDim">Ниво</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1 w-full border-2 border-white/15 bg-graphite px-4 py-3 text-chalk focus:border-amber"
              >
                <option value="beginner">Начинаещ</option>
                <option value="intermediate">Средно напреднал</option>
                <option value="advanced">Напреднал</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-chalkDim">Цел</label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="mt-1 w-full border-2 border-white/15 bg-graphite px-4 py-3 text-chalk focus:border-amber"
              >
                <option value="strength">Сила</option>
                <option value="strength_mass">Сила и маса</option>
                <option value="bench_focus">Основно лежанка</option>
                <option value="powerlifting_total">Трибой</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-chalkDim">Дни седмично</label>
              <input
                type="number"
                min={1}
                max={7}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(e.target.value)}
                className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk focus:border-amber"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-chalkDim">
                Продължителност (седмици, празно = циклична)
              </label>
              <input
                type="number"
                min={1}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk focus:border-amber"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">
              Оборудване (разделено със запетая)
            </label>
            <input
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="щанга, дискове, силова рамка"
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">
              Какво се случва при неуспешна серия
            </label>
            <textarea
              value={failureRule}
              onChange={(e) => setFailureRule(e.target.value)}
              rows={2}
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">Какво представлява</label>
            <textarea
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              rows={3}
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">Как точно работи</label>
            <textarea
              value={howItWorks}
              onChange={(e) => setHowItWorks(e.target.value)}
              rows={4}
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">
              За кого е подходяща (по един ред за точка)
            </label>
            <textarea
              value={bestFor}
              onChange={(e) => setBestFor(e.target.value)}
              rows={3}
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-chalkDim">
              На какво да обърне внимание (по един ред за точка)
            </label>
            <textarea
              value={considerations}
              onChange={(e) => setConsiderations(e.target.value)}
              rows={3}
              className="mt-1 w-full border-2 border-white/15 bg-transparent px-4 py-3 text-chalk focus:border-amber"
            />
          </div>

          {errorMessage && <p className="text-sm text-rust">{errorMessage}</p>}
          {phase === "saved" && <p className="text-sm text-green-500">Запазено успешно!</p>}

          <button
            type="submit"
            disabled={phase === "saving"}
            className="border-2 border-amber bg-amber px-6 py-4 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber disabled:opacity-50"
          >
            {phase === "saving" ? "Запазваме…" : "Запази промените →"}
          </button>
        </form>
      </div>
    </main>
  );
}
