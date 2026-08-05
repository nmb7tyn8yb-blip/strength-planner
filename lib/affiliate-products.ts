// =====================================================================
//  ПРЕПОРЪЧАНИ ПРОДУКТИ (партньорски линкове)
//
//  ВАЖНО: линковете по-долу са PLACEHOLDER ("#") — смени ги с реалните
//  си партньорски (affiliate) линкове след регистрация в съответните
//  партньорски програми (Zamnia, MyProtein.bg, GymBeam, Bodybuilding.bg,
//  iHerb, Amazon Associates и т.н. — всеки магазин има собствена
//  "Affiliate/Partner Program" секция, обикновено в футъра на сайта им).
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

export interface AffiliateProduct {
  id: string;
  name: string;
  category: ProductCategory;
  note: string; // кратко, честно обяснение защо е препоръчан
  highlight?: Highlight;
  link: string; // ЗАМЕНИ с реалния си партньорски линк
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  // --- Добавки ---
  { id: "whey-protein", name: "Суроватъчен протеин", category: "protein", note: "Помага за възстановяване, ако не покриваш нужния протеин само с храна", highlight: "our_pick", link: "#" },
  { id: "whey-protein-budget", name: "Протеин — бюджетен вариант", category: "protein", note: "По-ниска цена на грам протеин, ако тестваш за пръв път", highlight: "best_price", link: "#" },
  { id: "creatine", name: "Креатин монохидрат", category: "creatine", note: "Един от малкото добавки с реално доказан ефект върху силата (~5-10%)", highlight: "our_pick", link: "#" },
  { id: "magnesium", name: "Магнезий", category: "vitamins", note: "Чест дефицит при интензивно тренирали хора; помага при крампи", link: "#" },
  { id: "electrolytes", name: "Електролити", category: "recovery", note: "За по-дълги/по-потни тренировки, особено лете", link: "#" },

  // --- Лежанка ---
  { id: "wrist-wraps", name: "Каишки за китки", category: "bench_gear", note: "Стабилизация при тежка лежанка или военна преса", highlight: "our_pick", link: "#" },
  { id: "safety-pins", name: "Предпазни ограничители за рамка", category: "bench_gear", note: "Задължителни при самостоятелна тежка лежанка без партньор", highlight: "premium", link: "#" },

  // --- Клек ---
  { id: "squat-shoes", name: "Обувки за клек", category: "squat_gear", note: "Твърда пета — по-добра стабилност и дълбочина при клек", highlight: "premium", link: "#" },
  { id: "knee-sleeves", name: "Наколенки", category: "squat_gear", note: "Топлина и лека компресия при обемни клек дни", link: "#" },

  // --- Тяга ---
  { id: "lifting-straps", name: "Фитили за хват", category: "deadlift_gear", note: "Помагат при тежки серии тяга, когато хватът се отказва първи", highlight: "our_pick", link: "#" },
  { id: "lifting-belt", name: "Колан за вдигане на тежести", category: "deadlift_gear", note: "Полезен при тежки серии близо до максимума (клек, тяга)", highlight: "best_price", link: "#" },
  { id: "chalk", name: "Магнезий за хват (тебешир)", category: "deadlift_gear", note: "По-сигурен хват при потни ръце — особено важно за тежка тяга", link: "#" },

  // --- Микро дискове / прогресия ---
  { id: "micro-plates", name: "Микро дискове 0.5–1.25 kg", category: "micro_plates", note: "За малки, точни увеличения при бавни прогресии (напр. Hepburn)", highlight: "our_pick", link: "#" },

  // --- Домашен фитнес ---
  { id: "resistance-bands", name: "Ластици за съпротивление", category: "home_gym", note: "Компактна опция за загряване или помощни упражнения у дома", link: "#" },
  { id: "adjustable-dumbbells", name: "Регулируеми дъмбели", category: "home_gym", note: "Спестяват място — заместват цял стелаж с фиксирани тежести", highlight: "premium", link: "#" },
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

// Контекстни препоръки — според ДВИЖЕНИЕТО в днешната тренировка (/today)
export const EXERCISE_PLACEMENT_MAP: Record<string, string[]> = {
  "Мъртва тяга": ["lifting-straps", "chalk", "lifting-belt"],
  Клек: ["knee-sleeves", "squat-shoes", "lifting-belt"],
  Лежанка: ["wrist-wraps", "safety-pins"],
  "Военна преса": ["wrist-wraps"],
};

// Категории и подредба за страницата "SilaPlan Picks"
export const PICKS_CATEGORIES: { key: ProductCategory; label: string }[] = [
  { key: "creatine", label: "Добавки с реална практическа полза" },
  { key: "bench_gear", label: "Екипировка за лежанка" },
  { key: "squat_gear", label: "Екипировка за клек" },
  { key: "deadlift_gear", label: "Екипировка за тяга" },
  { key: "home_gym", label: "Домашен фитнес" },
  { key: "micro_plates", label: "Микро дискове и прогресия" },
  { key: "recovery", label: "Възстановяване" },
];

export const HIGHLIGHT_LABEL: Record<Highlight, string> = {
  best_price: "Най-добра цена",
  our_pick: "Нашият избор",
  premium: "Премиум вариант",
};
