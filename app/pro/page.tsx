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

const COMPARISON = {
  bg: [
    { free: "1 активен план", pro: "Неограничени планове" },
    { free: "Основен календар", pro: "Автоматично преизчисляване" },
    { free: "Текущ цикъл", pro: "Пълна история" },
    { free: "Основен 1RM", pro: "Графики и анализ" },
    { free: "Без експорт", pro: "PDF и .ics" },
    { free: "Стандартна програма", pro: "Персонализирани шаблони" },
  ],
  en: [
    { free: "1 active plan", pro: "Unlimited plans" },
    { free: "Basic calendar", pro: "Automatic recalculation" },
    { free: "Current cycle", pro: "Full history" },
    { free: "Basic 1RM", pro: "Charts and analysis" },
    { free: "No export", pro: "PDF and .ics" },
    { free: "Standard program", pro: "Personalized templates" },
  ],
};

const FOUNDING_PERKS_BG = [
  "Значка Founding Member в профила",
  "Гласуване за следващите програми",
  "Ранно тестване на нови функции",
  "Директен канал за обратна връзка",
  "Цената никога не се променя",
];

const FOUNDING_PERKS_EN = [
  "Founding Member badge on your profile",
  "Vote on which programs come next",
  "Early access to test new features",
  "Direct feedback channel",
  "Your price never changes",
];

export default function ProPage() {
  const { locale, localizedHref } = useLanguage();
  const isEn = locale === "en";
  const FEATURES = isEn ? FEATURES_EN : FEATURES_BG;
  const FOUNDING_PERKS = isEn ? FOUNDING_PERKS_EN : FOUNDING_PERKS_BG;
  const comparison = COMPARISON[locale];

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

        {/* Founding Member — водещата оферта */}
        <div className="mt-10 border-2 border-amber bg-amber/5 p-6">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-amber">
            {isEn ? "Best launch offer — only 100 spots" : "Най-добра стартова оферта — само 100 места"}
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-display text-2xl text-chalkDim/50 line-through">€99</span>
            <span className="font-display text-5xl font-bold text-amber">€49</span>
            <span className="text-sm text-chalkDim">{isEn ? "one-time" : "еднократно"}</span>
          </div>
          <p className="mt-1 font-display text-lg font-semibold text-chalk">
            {isEn ? "Lifetime Pro access" : "Доживотен Pro достъп"}
          </p>
          <ul className="mt-4 grid gap-1.5">
            {FOUNDING_PERKS.map((perk, i) => (
              <li key={i} className="flex gap-2 text-sm text-chalk">
                <span className="text-amber">✓</span> {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Месечно/годишно — по-малки, вторични карти */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="border border-white/15 p-5">
            <p className="text-xs uppercase tracking-widest text-chalkDim">{isEn ? "Monthly" : "Месечно"}</p>
            <p className="mt-2 font-display text-2xl font-bold text-chalk">€4.99</p>
          </div>
          <div className="border border-white/15 p-5">
            <p className="text-xs uppercase tracking-widest text-chalkDim">{isEn ? "Yearly" : "Годишно"}</p>
            <p className="mt-2 font-display text-2xl font-bold text-chalk">
              €39 <span className="text-sm font-normal text-chalkDim">/ {isEn ? "yr" : "год"}</span>
            </p>
            <p className="mt-1 text-xs text-steelLight">
              {isEn ? "only €3.25/month · save 35%" : "само €3.25/месец · спестяваш 35%"}
            </p>
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

        {/* Free vs Pro сравнение */}
        <div className="mt-12">
          <h2 className="font-display text-sm uppercase tracking-widest text-chalkDim">
            {isEn ? "Free stays genuinely useful" : "Free остава реално полезен"}
          </h2>
          <div className="mt-4 overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-chalkDim">
                  <th className="p-3">Free</th>
                  <th className="p-3 text-amber">Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-3 text-chalkDim">{row.free}</td>
                    <td className="p-3 text-chalk">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Чакаща листа */}
        <div className="mt-14 border-t border-white/10 pt-10">
          <h2 className="font-display text-xl font-semibold">
            {isEn ? "Get early access before the public launch" : "Вземи ранен достъп преди публичния старт"}
          </h2>
          <p className="mt-2 text-sm text-chalkDim">
            {isEn
              ? "The €49 Founding Member price is only for the first 100 people who actually pay — not just sign up. Leave your email and you'll get a head start to purchase before everyone else."
              : "Цената €49 Founding Member е само за първите 100 души, които реално платят — не просто се запишат. Остави имейла си и ще получиш преднина да купиш преди всички останали."}
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
                {submitting ? (isEn ? "Sending…" : "Изпращаме…") : isEn ? "Get early access" : "Вземи ранен достъп"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
