import { AFFILIATE_PRODUCTS, PLACEMENT_MAP } from "@/lib/affiliate-products";

export default function ProductRecommendations({ placement }: { placement: string }) {
  const productIds = PLACEMENT_MAP[placement] ?? [];
  const products = AFFILIATE_PRODUCTS.filter((p) => productIds.includes(p.id));

  if (products.length === 0) return null;

  return (
    <div className="mt-10 border-t border-white/10 pt-8">
      <p className="text-xs uppercase tracking-widest text-chalkDim">Може да ти свърши работа</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {products.map((p) => (
          <a
            key={p.id}
            href={p.link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group border border-white/10 p-4 transition hover:border-amber/50"
          >
            <h3 className="font-display text-sm font-semibold text-chalk group-hover:text-amber">
              {p.name}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-chalkDim">{p.note}</p>
          </a>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-chalkDim">
        Партньорски линкове — може да получим малка комисионна, без допълнителна такса за теб.
      </p>
    </div>
  );
}
