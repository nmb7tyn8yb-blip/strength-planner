"use client";

import { AFFILIATE_PRODUCTS, PICKS_CATEGORIES } from "@/lib/affiliate-products";
import { ProductCard } from "@/components/product-recommendations";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";

export default function PicksPage() {
  const { locale, localizedHref } = useLanguage();
  const isEn = locale === "en";

  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-4xl">
        <Link href={localizedHref("/")} className="text-sm text-chalkDim hover:text-chalk">
          {isEn ? "← Home" : "← Начало"}
        </Link>

        <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
          Silaplan<span className="text-amber">Picks</span>
        </h1>
        <p className="mt-3 max-w-xl text-chalkDim">
          {isEn
            ? "Not 50 products — just 2-3 carefully chosen picks per category, the kind we'd actually recommend to a friend."
            : "Не 50 продукта, а по 2-3 внимателно избрани предложения във всяка категория — каквото реално бихме препоръчали на приятел."}
        </p>
        <p className="mt-2 text-xs text-chalkDim">
          {isEn
            ? "Affiliate links — we may earn a small commission, at no extra cost to you."
            : "Партньорски линкове — може да получим малка комисионна, без допълнителна такса за теб."}
        </p>

        <div className="mt-12 grid gap-12">
          {PICKS_CATEGORIES.map((cat) => {
            const products = AFFILIATE_PRODUCTS.filter((p) => p.category === cat.key && p.link !== "#");
            if (products.length === 0) return null;

            return (
              <div key={cat.key}>
                <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-amber">
                  {cat.label[locale]}
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            );
          })}

          {AFFILIATE_PRODUCTS.every((p) => p.link === "#") && (
            <p className="text-chalkDim">
              {isEn ? "Picks are coming soon — check back shortly." : "Препоръките предстоят — очаквай ги съвсем скоро."}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
