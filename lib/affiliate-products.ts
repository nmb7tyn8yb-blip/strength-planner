// =====================================================================
//  ПРЕПОРЪЧАНИ ПРОДУКТИ (партньорски линкове)
//
//  ВАЖНО: линковете по-долу са PLACEHOLDER ("#") — смени ги с реалните
//  си партньорски (affiliate) линкове, след като се регистрираш в
//  съответните партньорски програми (напр. Zamnia, MyProtein.bg,
//  Bodybuilding.bg, Decathlon и т.н. — всеки магазин има собствена
//  "Affiliate/Partner Program" секция, обикновено в футъра на сайта им).
// =====================================================================

export interface AffiliateProduct {
  id: string;
  name: string;
  category: "protein" | "creatine" | "recovery" | "equipment" | "vitamins";
  note: string; // кратко, честно обяснение защо е препоръчан
  link: string; // ЗАМЕНИ с реалния си партньорски линк
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    id: "whey-protein",
    name: "Суроватъчен протеин",
    category: "protein",
    note: "Помага за възстановяване, ако не покриваш нужния протеин само с храна",
    link: "#",
  },
  {
    id: "creatine",
    name: "Креатин монохидрат",
    category: "creatine",
    note: "Един от малкото добавки с реално доказан ефект върху силата (~5-10%)",
    link: "#",
  },
  {
    id: "lifting-belt",
    name: "Колан за вдигане на тежести",
    category: "equipment",
    note: "Полезен при тежки серии близо до максимума (клек, тяга)",
    link: "#",
  },
  {
    id: "wrist-wraps",
    name: "Каишки за китки",
    category: "equipment",
    note: "Стабилизация при тежка лежанка или военна преса",
    link: "#",
  },
  {
    id: "magnesium",
    name: "Магнезий",
    category: "vitamins",
    note: "Чест дефицит при интензивно тренирали хора; помага при крампи",
    link: "#",
  },
];

// Кои продукти да се показват на кои места по сайта
export const PLACEMENT_MAP: Record<string, string[]> = {
  "post-workout": ["whey-protein", "creatine"],
  "1rm-calculator": ["creatine", "magnesium"],
  "heavy-programs": ["lifting-belt", "wrist-wraps"],
};
