import Link from "next/link";
import { AFFILIATE_PRODUCTS, PLACEMENT_MAP, HIGHLIGHT_LABEL, type AffiliateProduct } from "@/lib/affiliate-products";

interface ProductRecommendationsProps {
  placement?: string;
  productIds?: string[]; // директен списък от ID-та, ако не искаш да минаваш през PLACEMENT_MAP
  title?: string;
}

export default function ProductRecommendations({ placement, productIds, title }: ProductRecommendationsProps) {
  const ids = productIds ?? (placement ? PLACEMENT_MAP[placement] ?? [] : []);
  const products = AFFILIATE_PRODUCTS.filter((p) => ids.includes(p.id));

  if (products.length === 0) return null;

  return (
    <div className="mt-10 border-t border-white/10 pt-8">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-chalkDim">{title ?? "Може да ти свърши работа"}</p>
        <Link href="/picks" className="text-xs text-steelLight underline-offset-4 hover:underline">
          Виж всички →
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <p className="mt-3 text-[11px] text-chalkDim">
        Партньорски линкове — може да получим малка комисионна, без допълнителна такса за теб.
      </p>
    </div>
  );
}

export function ProductCard({ product }: { product: AffiliateProduct }) {
  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group border border-white/10 p-4 transition hover:border-amber/50"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-chalk group-hover:text-amber">{product.name}</h3>
        {product.highlight && (
          <span className="shrink-0 border border-amber/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber">
            {HIGHLIGHT_LABEL[product.highlight]}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-chalkDim">{product.note}</p>
    </a>
  );
}
