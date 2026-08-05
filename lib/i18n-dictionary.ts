// =====================================================================
//  РЕЧНИК С ПРЕВОДИ — bg (по подразбиране) / en
//  Добавяме namespace по namespace, докато превеждаме всяка страница.
// =====================================================================

export type Locale = "bg" | "en";

interface FeaturedProgram {
  name: string;
  tag: string;
  pitch: string;
}

export interface TranslationShape {
  nav: {
    programs: string;
    createProgram: string;
    calculator: string;
    quiz: string;
    dashboard: string;
    login: string;
    logout: string;
  };
  footer: {
    rights: string;
    privacy: string;
    terms: string;
  };
  programs: {
    backHome: string;
    title: string;
    subtitle: string;
    quizPrompt: string;
    loadError: string;
    empty: string;
    levels: { beginner: string; intermediate: string; advanced: string };
    goals: { strength: string; strength_mass: string; bench_focus: string; powerlifting_total: string };
    daysPerWeek: string;
    weeks: string;
    cyclic: string;
    view: string;
  };
  home: {
    heroKicker: string;
    heroTitle1: string;
    heroTitle2: string;
    heroTitle3: string;
    heroSubtitle: string;
    ctaQuiz: string;
    ctaCatalog: string;
    progressionCaption: string;
    howItWorks: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    programsTitle: string;
    viewAll: string;
    finalCta: string;
    startQuiz: string;
    featuredPrograms: FeaturedProgram[];
  };
  calculator: {
    title: string;
    subtitle: string;
    exerciseLabel: string;
    exercises: { squat: string; bench_press: string; deadlift: string; overhead_press: string };
    weightLabel: string;
    repsLabel: string;
    repsHint: string;
    compareShow: string;
    compareHide: string;
    bodyweightLabel: string;
    sexLabel: string;
    male: string;
    female: string;
    ageLabel: string;
    ageOptional: string;
    calculateButton: string;
    resultTitle: string;
    strengthLevelPrefix: string; // "X.XX× bodyweight"
    moreToNextTier: (kg: number, tier: string) => string;
    repTableTitle: string;
    formulaNote: string;
    strengthDisclaimer: string;
  };
  strengthTiers: string[]; // professional: Beginner..Elite
  strengthBadges: string[]; // fun: Rookie..Monster
}

export const translations: Record<Locale, TranslationShape> = {
  bg: {
    nav: {
      programs: "Програми",
      createProgram: "Създай програма",
      calculator: "1RM Калкулатор",
      quiz: "Въпросник",
      dashboard: "Табло",
      login: "Вход",
      logout: "Изход",
    },
    footer: {
      rights: "StrengthPlanner",
      privacy: "Поверителност",
      terms: "Общи условия",
    },
    programs: {
      backHome: "← Начало",
      title: "Каталог с програми",
      subtitle:
        "Всяка програма е кодирана прецизно по оригинала — проценти, серии, повторения, правила за прогресия. Изрично обозначените модификации (напр. съкратени варианти) също следват точна, ясно описана логика. Не избираш описание, избираш реален алгоритъм.",
      quizPrompt: "Не си сигурен коя? Отговори на въпросника →",
      loadError: "Не успяхме да заредим каталога в момента. Презареди страницата след малко.",
      empty: "Каталогът все още е празен.",
      levels: { beginner: "Начинаещ", intermediate: "Средно напреднал", advanced: "Напреднал" },
      goals: {
        strength: "Сила",
        strength_mass: "Сила и маса",
        bench_focus: "Основно лежанка",
        powerlifting_total: "Трибой",
      },
      daysPerWeek: "дни/седмица",
      weeks: "седмици",
      cyclic: "циклична",
      view: "Виж →",
    },
    home: {
      heroKicker: "Точни килограми. Всяка тренировка.",
      heroTitle1: "Тренировъчният ти план,",
      heroTitle2: "изчислен до",
      heroTitle3: "килограм",
      heroSubtitle:
        "Избираш система. Въвеждаш максимумите си. Получаваш реален календар — дата, тежест, серии, повторения, почивки. Без гадаене какво следва.",
      ctaQuiz: "Какви са целите ви?",
      ctaCatalog: "Разгледай каталога",
      progressionCaption: "Пример: натоварването се променя автоматично според точните правила на избраната програма",
      howItWorks: "Как работи",
      step1Title: "Отговаряш на няколко въпроса",
      step1Desc: "Цел, стаж, наличност, оборудване. Системата ти предлага 2–3 подходящи програми, не 8.",
      step2Title: "Въвеждаш максимумите си",
      step2Desc: "Реален или изчислен 1RM. Изборът на закръгляне на дисковете е твой.",
      step3Title: "Тренираш по готов календар",
      step3Desc: "Дата, тежест, серии, повторения, таймер за почивка. Прогресията се пресмята сама.",
      programsTitle: "Програми",
      viewAll: "Виж всички →",
      finalCta: "Готов ли си да знаеш точно какво следва?",
      startQuiz: "Започни с въпросника →",
      featuredPrograms: [
        { name: "Starting Strength", tag: "За начинаещи", pitch: "Тежестта расте на всяка тренировка. Най-простият доказан старт." },
        { name: "Wendler 5/3/1", tag: "Гъвкава", pitch: "Тренировъчен максимум, AMRAP серия, вграден deload." },
        { name: "Суровецкий — Система №1", tag: "Прецизна", pitch: "Точните проценти от оригиналните руски таблици, ден по ден." },
        { name: "Texas Method", tag: "Средно напреднали", pitch: "Обемен, възстановителен и интензивен ден в рамките на седмицата." },
        { name: "Juggernaut Method", tag: "Напреднали", pitch: "Вълнообразна периодизация с AMRAP тестове по вълни." },
        { name: "Hepburn Power Routine A", tag: "Класика", pitch: "Двойки прерастват в тройки — серия по серия до нов максимум." },
      ],
    },
    calculator: {
      title: "Калкулатор за максимум (1RM)",
      subtitle: "Въведи тегло и повторения от скорошна тренировка — ще изчислим приблизителния ти едноповторен максимум по три формули.",
      exerciseLabel: "Упражнение",
      exercises: { squat: "Клек", bench_press: "Лежанка", deadlift: "Мъртва тяга", overhead_press: "Военна преса" },
      weightLabel: "Вдигнато тегло (kg)",
      repsLabel: "Повторения",
      repsHint: "Най-точно е под 10 повторения.",
      compareShow: "+ Сравни спрямо ниво на сила (по тегло/пол/възраст)",
      compareHide: "− Скрий сравнение с ниво на сила",
      bodyweightLabel: "Твоето тегло (kg)",
      sexLabel: "Пол",
      male: "Мъж",
      female: "Жена",
      ageLabel: "Възраст (по избор)",
      ageOptional: "незадължително",
      calculateButton: "Изчисли →",
      resultTitle: "Приблизителен максимум",
      strengthLevelPrefix: "× телесното тегло",
      moreToNextTier: (kg, tier) => `Още ${kg} kg до ниво ${tier}.`,
      repTableTitle: "Тежест за други повторения (изчислено от максимума)",
      formulaNote: "Тези оценки са формула, не тест — реалният ти максимум може да варира с ±5-10% според деня, техниката и умората.",
      strengthDisclaimer:
        "Тези нива са ориентировъчни — обобщение на общоприети, закръглени съотношения тегло/собствено тегло от множество публични източници. Не са точно възпроизвеждане на конкретна изследователска таблица (напр. Lon Kilgore/ExRx, които са базирани на реални състезателни данни, не формула) и реално варират според извадката. Приемай резултата като насока, не като прецизно измерване.",
    },
    strengthTiers: ["Начинаещ", "Любител", "Среднонапреднал", "Напреднал", "Елитен"],
    strengthBadges: ["Новак", "Стабилен", "Як", "Звяр", "Изрод"],
  },
  en: {
    nav: {
      programs: "Programs",
      createProgram: "Build My Program",
      calculator: "Calculate My 1RM",
      quiz: "Quiz",
      dashboard: "Training Calendar",
      login: "Log In",
      logout: "Log Out",
    },
    footer: {
      rights: "StrengthPlanner",
      privacy: "Privacy",
      terms: "Terms",
    },
    programs: {
      backHome: "← Home",
      title: "Program Catalog",
      subtitle:
        "Every program is coded precisely to the original — percentages, sets, reps, progression rules. Explicitly labeled modifications (e.g. shortened variants) also follow exact, clearly described logic. You're not picking a description, you're picking a real algorithm.",
      quizPrompt: "Not sure which one? Take the quiz →",
      loadError: "We couldn't load the catalog right now. Reload the page in a moment.",
      empty: "The catalog is still empty.",
      levels: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
      goals: {
        strength: "Strength",
        strength_mass: "Strength & Mass",
        bench_focus: "Bench Focus",
        powerlifting_total: "Powerlifting Total",
      },
      daysPerWeek: "days/week",
      weeks: "weeks",
      cyclic: "cyclic",
      view: "View →",
    },
    home: {
      heroKicker: "Exact weight. Every session.",
      heroTitle1: "Your training plan,",
      heroTitle2: "calculated to the",
      heroTitle3: "exact weight",
      heroSubtitle:
        "Choose a proven strength program. Enter your numbers. Get a complete training calendar with exact weights, sets, reps, rest times, and progression rules.",
      ctaQuiz: "What are your goals?",
      ctaCatalog: "Browse Programs",
      progressionCaption: "Example: your load changes automatically following the exact rules of your chosen program",
      howItWorks: "How it works",
      step1Title: "Answer a few questions",
      step1Desc: "Goal, experience, availability, equipment. You get 2–3 matching programs, not 8.",
      step2Title: "Enter your numbers",
      step2Desc: "Real or estimated 1RM. You choose how the weights round.",
      step3Title: "Train off a ready calendar",
      step3Desc: "Date, weight, sets, reps, rest timer. Progression calculates itself.",
      programsTitle: "Programs",
      viewAll: "View all →",
      finalCta: "Ready to know exactly what's next?",
      startQuiz: "Start the quiz →",
      featuredPrograms: [
        { name: "Starting Strength", tag: "Beginners", pitch: "Weight goes up every workout. The simplest proven starting point." },
        { name: "Wendler 5/3/1", tag: "Flexible", pitch: "Training max, AMRAP set, built-in deload." },
        { name: "Surovetsky — System #1", tag: "Precise", pitch: "Exact percentages from the original Russian tables, day by day." },
        { name: "Texas Method", tag: "Intermediate", pitch: "Volume, recovery, and intensity day within one week." },
        { name: "Juggernaut Method", tag: "Advanced", pitch: "Wave periodization with AMRAP tests each wave." },
        { name: "Hepburn Power Routine A", tag: "Classic", pitch: "Doubles become triples — set by set to a new max." },
      ],
    },
    calculator: {
      title: "1RM Calculator",
      subtitle: "Enter the weight and reps from a recent session — we'll estimate your one-rep max using three formulas.",
      exerciseLabel: "Exercise",
      exercises: { squat: "Squat", bench_press: "Bench Press", deadlift: "Deadlift", overhead_press: "Overhead Press" },
      weightLabel: "Weight lifted (kg)",
      repsLabel: "Reps",
      repsHint: "Most accurate under 10 reps.",
      compareShow: "+ Compare against strength level (bodyweight/sex/age)",
      compareHide: "− Hide strength level comparison",
      bodyweightLabel: "Your bodyweight (kg)",
      sexLabel: "Sex",
      male: "Male",
      female: "Female",
      ageLabel: "Age (optional)",
      ageOptional: "optional",
      calculateButton: "Calculate →",
      resultTitle: "Estimated Max",
      strengthLevelPrefix: "× bodyweight",
      moreToNextTier: (kg, tier) => `${kg} kg to reach ${tier}.`,
      repTableTitle: "Weight for other rep ranges (from your estimated max)",
      formulaNote: "These are formula estimates, not a test — your real max may vary ±5-10% depending on the day, technique, and fatigue.",
      strengthDisclaimer:
        "These levels are approximate — a summary of commonly cited, rounded weight-to-bodyweight ratios from multiple public sources. They are not an exact reproduction of any single research table (e.g. Lon Kilgore/ExRx, which are based on real competition data, not a formula) and vary by sample. Treat the result as a guide, not a precise measurement.",
    },
    strengthTiers: ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"],
    strengthBadges: ["Rookie", "Solid", "Strong", "Beast", "Monster"],
  },
};
