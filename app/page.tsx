"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

// Универсален пример за прогресия — тежестта нараства всяка следваща
// тренировка. Не са данни на конкретна програма, а илюстрация на
// принципа, общ за всичките 8 програми в каталога.
const PROGRESSION_EXAMPLE = [40, 42.5, 45, 47.5, 50, 52.5, 55, 57.5];

export default function HomePage() {
  const { t, localizedHref } = useLanguage();
  const h = t.home;

  return (
    <main className="min-h-screen bg-graphite text-chalk">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 font-display text-sm uppercase tracking-[0.3em] text-amber">
              {h.heroKicker}
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              {h.heroTitle1}
              <br />
              {h.heroTitle2} <span className="text-steelLight">{h.heroTitle3}</span>.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-chalkDim">{h.heroSubtitle}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={localizedHref("/quiz")}
                className="group inline-flex items-center gap-3 border-2 border-amber bg-amber px-7 py-4 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
              >
                {h.ctaQuiz}
                <span aria-hidden className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href={localizedHref("/programs")}
                className="inline-flex items-center gap-2 border-2 border-white/20 px-7 py-4 font-display text-sm font-semibold uppercase tracking-wider text-chalk transition hover:border-white/50"
              >
                {h.ctaCatalog}
              </Link>
            </div>
          </div>

          {/* Сигнатурен елемент: тежестта нараства всяка тренировка — общо за всички програми */}
          <div aria-hidden className="relative">
            <div className="flex items-end justify-center gap-2 md:gap-3">
              {PROGRESSION_EXAMPLE.map((weight, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="font-display text-xs font-semibold text-steelLight">{weight}</span>
                  <div
                    className="w-8 border-2 border-steel bg-steel/20 transition-all duration-700 md:w-11"
                    style={{
                      height: `${36 + i * 16}px`,
                      transitionDelay: `${i * 80}ms`,
                    }}
                  />
                  <span className="font-display text-xs text-chalkDim">{i + 1}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs uppercase tracking-widest text-chalkDim">
              {h.progressionCaption}
            </p>
          </div>
        </div>
      </section>

      {/* ================= КАК РАБОТИ ================= */}
      <section className="border-b border-white/10 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
            {h.howItWorks}
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            <div>
              <span className="font-display text-4xl font-bold text-amber">1</span>
              <h3 className="mt-3 font-display text-lg font-semibold">{h.step1Title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-chalkDim">{h.step1Desc}</p>
            </div>
            <div>
              <span className="font-display text-4xl font-bold text-amber">2</span>
              <h3 className="mt-3 font-display text-lg font-semibold">{h.step2Title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-chalkDim">{h.step2Desc}</p>
            </div>
            <div>
              <span className="font-display text-4xl font-bold text-amber">3</span>
              <h3 className="mt-3 font-display text-lg font-semibold">{h.step3Title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-chalkDim">{h.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= КАТАЛОГ ПРЕГЛЕД ================= */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
              {h.programsTitle}
            </h2>
            <Link href={localizedHref("/programs")} className="text-sm text-steelLight underline-offset-4 hover:underline">
              {h.viewAll}
            </Link>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
            {h.featuredPrograms.map((p) => (
              <div key={p.name} className="bg-graphite p-6 transition hover:bg-graphite2">
                <span className="font-display text-[11px] uppercase tracking-widest text-amber">{p.tag}</span>
                <h3 className="mt-2 font-display text-lg font-semibold text-chalk">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-chalkDim">{p.pitch}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER CTA ================= */}
      <section className="border-t border-white/10 px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-semibold">{h.finalCta}</h2>
        <Link
          href={localizedHref("/quiz")}
          className="mt-8 inline-flex items-center gap-3 border-2 border-amber bg-amber px-7 py-4 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
        >
          {h.startQuiz}
        </Link>
      </section>
    </main>
  );
}
