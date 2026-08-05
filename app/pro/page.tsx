"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { useLanguage } from "@/components/language-provider";

const FEATURES_BG = [
  "Неограничени тренировъчни цикли",
  "Запазване на цялата история завинаги",
  "Автоматична прогресия след всяка тренировка",
  "Преместване на пропуснати тренировки",
  "Автоматично преизчисляване на календара",
  "Графики за сила, обем и прогнозен 1RM",
  "Лични рекорди",
  "RPE и бележки за всяка серия",
  "PDF и календарен (.ics) експорт",
  "Синхронизация между телефон и компютър",
  "Персонализирани помощни упражнения",
  "Собствени тренировъчни шаблони",
];

const FEATURES_EN = [
  "Unlimited training cycles",
  "Full history saved forever",
  "Automatic progression after every workout",
  "Moving missed workouts",
  "Automatic calendar recalculation",
  "Strength, volume, and projected 1RM charts",
  "Personal records",
  "RPE and notes on every set",
  "PDF and calendar (.ics) export",
  "Sync between phone and computer",
  "Personalized accessory work",
  "Your own training templates",
];

export default function ProPage() {
  const { locale, localizedHref } = useLanguage();
  const isEn = locale === "en";
  const FEATURES = isEn ? FEATURES_EN : FEATURES_BG;

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from("email_subscribers").insert({ email, source: "pro_waitlist" });
    } catch {
      // дублиран имейл или мрежова грешка — пак показваме успех
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-3xl">
        <Link href={localizedHref("/")} className="text-sm text-chalkDim hover:text-chalk">
          {isEn ? "← Home" : "← Начало"}
        </Link>

        <p className="mt-6 font-display text-sm uppercase tracking-[0.3em] text-amber">
          {isEn ? "Coming soon" : "Очаквайте скоро"}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          Strength<span className="text-amber">Planner</span> Pro
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-chalkDim">
          {isEn
            ? "Not just a table of numbers — a system that manages your entire training cycle."
            : "Не просто таблица с цифри — система, която управлява целия ти тренировъчен цикъл."}
        </p>

        {/* Цени */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="border-2 border-white/15 p-5 text-center">
            <p className="text-xs uppercase tracking-widest text-chalkDim">{isEn ? "Monthly" : "Месечно"}</p>
            <p className="mt-2 font-display text-3xl font-bold text-chalk">€4.99</p>
          </div>
          <div className="border-2 border-white/15 p-5 text-center">
            <p className="text-xs uppercase tracking-widest text-chalkDim">{isEn ? "Yearly" : "Годишно"}</p>
            <p className="mt-2 font-display text-3xl font-bold text-chalk">€39</p>
          </div>
          <div className="border-2 border-amber p-5 text-center">
            <p className="text-xs uppercase tracking-widest text-amber">
              {isEn ? "First 100 — Founding Member" : "Първите 100 — Founding Member"}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-amber">€49</p>
            <p className="mt-1 text-[11px] text-chalkDim">{isEn ? "one-time, lifetime access" : "еднократно, доживотен достъп"}</p>
          </div>
        </div>

        {/* Функции */}
        <div className="mt-12">
          <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
            {isEn ? "What Pro unlocks" : "Какво отключва Pro"}
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex gap-2 text-sm text-chalk">
                <span className="text-amber">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Чакаща листа */}
        <div className="mt-14 border-t border-white/10 pt-10">
          <h2 className="font-display text-xl font-semibold">
            {isEn ? "Be the first to know when it launches" : "Бъди първият, който ще научи при старта"}
          </h2>
          <p className="mt-2 text-sm text-chalkDim">
            {isEn
              ? "Founding Member pricing is only for the first 100 signups — leave your email to reserve your spot."
              : "Цената Founding Member е само за първите 100 регистрирани — остави имейла си, за да запазиш мястото си."}
          </p>

          {submitted ? (
            <p className="mt-4 text-sm text-green-500">
              {isEn ? "You're on the list! We'll email you at launch." : "Записан/а си! Ще ти пишем при старта."}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-2">
              <input
                type="email"
                required
                placeholder={isEn ? "your@email.com" : "твоят@имейл.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-64 border-2 border-white/15 bg-transparent px-4 py-3 text-chalk placeholder:text-chalkDim focus:border-amber"
              />
              <button
                type="submit"
                disabled={submitting}
                className="border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber disabled:opacity-50"
              >
                {submitting ? (isEn ? "Sending…" : "Изпращаме…") : isEn ? "Reserve my spot" : "Запази мястото ми"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
