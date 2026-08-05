// =====================================================================
//  ПРЕПОРЪЧАНИ ПРОДУКТИ (партньорски линкове) — двуезично съдържание
//
//  ВАЖНО: линковете по-долу са PLACEHOLDER ("#") — смени ги с реалните
//  си партньорски (affiliate) линкове след регистрация в съответните
//  партньорски програми (Zamnia, MyProtein.bg, GymBeam, Bodybuilding.bg,
//  iHerb, Amazon Associates и т.н.).
// =====================================================================

export type ProductCategory =
  | "protein"
  | "creatine"
  | "recovery"
  | "bench_gear"
  | "squat_gear"
  | "deadlift_gear"
  | "micro_plates"
  | "home_gym"
  | "vitamins";

export type Highlight = "best_price" | "our_pick" | "premium";

interface Localized {
  bg: string;
  en: string;
}

export interface AffiliateProduct {
  id: string;
  name: Localized;
  category: ProductCategory;
  note: Localized;
  highlight?: Highlight;
  link: string; // ЗАМЕНИ с реалния си партньорски линк
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  // --- Добавки ---
  {
    id: "whey-protein",
    name: { bg: "Суроватъчен протеин", en: "Whey Protein" },
    category: "protein",
    note: { bg: "Помага за възстановяване, ако не покриваш нужния протеин само с храна", en: "Helps recovery if you're not hitting your protein target from food alone" },
    highlight: "our_pick",
    link: "#",
  },
  {
    id: "whey-protein-budget",
    name: { bg: "Протеин — бюджетен вариант", en: "Protein — Budget Option" },
    category: "protein",
    note: { bg: "По-ниска цена на грам протеин, ако тестваш за пръв път", en: "Lower cost per gram of protein — good if you're trying it for the first time" },
    highlight: "best_price",
    link: "#",
  },
  {
    id: "creatine",
    name: { bg: "Креатин монохидрат", en: "Creatine Monohydrate" },
    category: "creatine",
    note: { bg: "Един от малкото добавки с реално доказан ефект върху силата (~5-10%)", en: "One of the few supplements with real, proven strength benefits (~5-10%)" },
    highlight: "our_pick",
    link: "#",
  },
  {
    id: "magnesium",
    name: { bg: "Магнезий", en: "Magnesium" },
    category: "vitamins",
    note: { bg: "Чест дефицит при интензивно тренирали хора; помага при крампи", en: "A common deficiency in heavy trainees; helps with cramps" },
    link: "#",
  },
  {
    id: "electrolytes",
    name: { bg: "Електролити", en: "Electrolytes" },
    category: "recovery",
    note: { bg: "За по-дълги/по-потни тренировки, особено лете", en: "For longer or sweatier sessions, especially in summer" },
    link: "#",
  },

  // --- Лежанка ---
  {
    id: "wrist-wraps",
    name: { bg: "Каишки за китки", en: "Wrist Wraps" },
    category: "bench_gear",
    note: { bg: "Стабилизация при тежка лежанка или военна преса", en: "Stabilization for heavy bench press or overhead press" },
    highlight: "our_pick",
    link: "#",
  },
  {
    id: "safety-pins",
    name: { bg: "Предпазни ограничители за рамка", en: "Safety Pins / Spotter Arms" },
    category: "bench_gear",
    note: { bg: "Задължителни при самостоятелна тежка лежанка без партньор", en: "Essential for heavy bench press without a spotter" },
    highlight: "premium",
    link: "#",
  },

  // --- Клек ---
  {
    id: "squat-shoes",
    name: { bg: "Обувки за клек", en: "Squat Shoes" },
    category: "squat_gear",
    note: { bg: "Твърда пета — по-добра стабилност и дълбочина при клек", en: "Hard heel — better stability and depth on squats" },
    highlight: "premium",
    link: "#",
  },
  {
    id: "knee-sleeves",
    name: { bg: "Наколенки", en: "Knee Sleeves" },
    category: "squat_gear",
    note: { bg: "Топлина и лека компресия при обемни клек дни", en: "Warmth and light compression on high-volume squat days" },
    link: "#",
  },

  // --- Тяга ---
  {
    id: "lifting-straps",
    name: { bg: "Фитили за хват", en: "Lifting Straps" },
    category: "deadlift_gear",
    note: { bg: "Помагат при тежки серии тяга, когато хватът се отказва първи", en: "Help on heavy deadlift sets when grip fails before the rest of you" },
    highlight: "our_pick",
    link: "#",
  },
  {
    id: "lifting-belt",
    name: { bg: "Колан за вдигане на тежести", en: "Lifting Belt" },
    category: "deadlift_gear",
    note: { bg: "Полезен при тежки серии близо до максимума (клек, тяга)", en: "Useful on heavy near-max sets (squat, deadlift)" },
    highlight: "best_price",
    link: "#",
  },
  {
    id: "chalk",
    name: { bg: "Магнезий за хват (тебешир)", en: "Lifting Chalk" },
    category: "deadlift_gear",
    note: { bg: "По-сигурен хват при потни ръце — особено важно за тежка тяга", en: "A more secure grip on sweaty hands — especially important for heavy deadlifts" },
    link: "#",
  },

  // --- Микро дискове / прогресия ---
  {
    id: "micro-plates",
    name: { bg: "Микро дискове 0.5–1.25 kg", en: "Micro Plates 0.5–1.25 kg" },
    category: "micro_plates",
    note: { bg: "За малки, точни увеличения при бавни прогресии (напр. Hepburn)", en: "For small, precise increases on slow progressions (e.g. Hepburn)" },
    highlight: "our_pick",
    link: "#",
  },

  // --- Домашен фитнес ---
  {
    id: "resistance-bands",
    name: { bg: "Ластици за съпротивление", en: "Resistance Bands" },
    category: "home_gym",
    note: { bg: "Компактна опция за загряване или помощни упражнения у дома", en: "A compact option for warm-ups or accessory work at home" },
    link: "#",
  },
  {
    id: "adjustable-dumbbells",
    name: { bg: "Регулируеми дъмбели", en: "Adjustable Dumbbells" },
    category: "home_gym",
    note: { bg: "Спестяват място — заместват цял стелаж с фиксирани тежести", en: "Save space — replace an entire rack of fixed dumbbells" },
    highlight: "premium",
    link: "#",
  },
];

// Кои продукти да се показват на кои общи места по сайта
export const PLACEMENT_MAP: Record<string, string[]> = {
  "post-workout": ["whey-protein", "creatine"],
  "1rm-calculator": ["creatine", "magnesium"],
  "heavy-programs": ["lifting-belt", "wrist-wraps"],
};

// Контекстни препоръки — според КОНКРЕТНАТА програма (по slug)
export const PROGRAM_PLACEMENT_MAP: Record<string, string[]> = {
  "hepburn-a": ["micro-plates", "creatine"],
  "starting-strength": ["lifting-belt", "chalk"],
  "531": ["lifting-belt", "wrist-wraps"],
  "texas-method": ["lifting-belt", "wrist-wraps", "chalk"],
  "surovetsky-1": ["wrist-wraps", "safety-pins"],
  "surovetsky-2": ["wrist-wraps", "safety-pins"],
  "surovetsky-full": ["wrist-wraps", "safety-pins"],
  juggernaut: ["lifting-belt", "lifting-straps", "knee-sleeves"],
  "juggernaut-excel": ["lifting-belt", "lifting-straps", "knee-sleeves"],
};

// Контекстни препоръки — според ДВИЖЕНИЕТО в днешната тренировка (/today).
// Ключовете съвпадат с имената на упражненията в базата (винаги на български).
export const EXERCISE_PLACEMENT_MAP: Record<string, string[]> = {
  "Мъртва тяга": ["lifting-straps", "chalk", "lifting-belt"],
  Клек: ["knee-sleeves", "squat-shoes", "lifting-belt"],
  Лежанка: ["wrist-wraps", "safety-pins"],
  "Военна преса": ["wrist-wraps"],
};

// Категории и подредба за страницата "SilaPlan Picks"
export const PICKS_CATEGORIES: { key: ProductCategory; label: Localized }[] = [
  { key: "creatine", label: { bg: "Добавки с реална практическа полза", en: "Supplements with real practical benefit" } },
  { key: "bench_gear", label: { bg: "Екипировка за лежанка", en: "Bench Press Gear" } },
  { key: "squat_gear", label: { bg: "Екипировка за клек", en: "Squat Gear" } },
  { key: "deadlift_gear", label: { bg: "Екипировка за тяга", en: "Deadlift Gear" } },
  { key: "home_gym", label: { bg: "Домашен фитнес", en: "Home Gym" } },
  { key: "micro_plates", label: { bg: "Микро дискове и прогресия", en: "Micro Plates & Progression" } },
  { key: "recovery", label: { bg: "Възстановяване", en: "Recovery" } },
];

export const HIGHLIGHT_LABEL: Record<Highlight, Localized> = {
  best_price: { bg: "Най-добра цена", en: "Best Price" },
  our_pick: { bg: "Нашият избор", en: "Our Pick" },
  premium: { bg: "Премиум вариант", en: "Premium" },
};
