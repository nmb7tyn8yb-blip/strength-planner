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
  quiz: {
    questionProgress: (n: number, total: number) => string;
    back: string;
    loading: string;
    retry: string;
    resultsTitle: string;
    resultsSubtitle: string;
    noMatch: string;
    bestMatch: string;
    rankedMatch: (n: number) => string;
    matchSuffix: string;
    viewProgram: string;
    restart: string;
    loadError: string;
    questions: { question: string; options: string[] }[];
  };
  programDetail: {
    backToAll: string;
    statLevel: string;
    statGoal: string;
    statDays: string;
    statDuration: string;
    overviewTitle: string;
    howItWorksTitle: string;
    bestForTitle: string;
    considerationsTitle: string;
    equipmentTitle: string;
    equipmentFull: string;
    equipmentMinimal: string;
    autoregTitle: string;
    autoregLabels: { none: string; medium: string; high: string };
    sessionMinTitle: string;
    minutesSuffix: string;
    otherSportsTitle: string;
    otherSportsLabels: { low: string; medium: string; high: string };
    failureRuleTitle: string;
    calculateButton: string;
    browseOthers: string;
    equipmentItems: Record<string, string>;
  };
  start: {
    loading: string;
    signupTitle: string;
    loginTitle: string;
    authSubtitle: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    signupButton: string;
    loginButton: string;
    switchToLogin: string;
    switchToSignup: string;
    sessionExpired: string;
    profileTitle: string;
    profileSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    experienceLabel: string;
    unitsLabel: string;
    unitsKg: string;
    unitsLb: string;
    plateStepLabel: string;
    daysPerWeekLabel: string;
    startingMaxesLabel: string;
    maxPlaceholder: string;
    saveButton: string;
    savingButton: string;
    doneTitle: string;
    planReadyText: string;
    todayButton: string;
    planNotReadyText: string;
    errorGeneric: string;
    retryButton: string;
  };
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
    quiz: {
      questionProgress: (n, total) => `Въпрос ${n} от ${total}`,
      back: "← Назад",
      loading: "Изчисляваме най-подходящите програми за теб…",
      retry: "Пробвай пак",
      resultsTitle: "Ето какво ти препоръчваме",
      resultsSubtitle: "Подредени по това колко добре пасват на отговорите ти.",
      noMatch: "Нито една програма не пасва достатъчно добре на тази комбинация — пробвай да промениш някой отговор.",
      bestMatch: "Най-добро попадение",
      rankedMatch: (n) => `#${n} по подходящост`,
      matchSuffix: "мач",
      viewProgram: "Виж програмата →",
      restart: "← Отговори наново",
      loadError: "Не успяхме да заредим каталога с програми. Провери връзката и опитай пак.",
      questions: [
        { question: "Каква е основната ти цел?", options: ["Обща сила", "Сила и мускулна маса", "Основно лежанка", "Трибой / състезателен резултат"] },
        { question: "Какъв е тренировъчният ти стаж?", options: ["Начинаещ (< 6 месеца системни тренировки)", "Средно напреднал", "Напреднал"] },
        { question: "Колко дни седмично можеш да тренираш?", options: ["2 дни", "3 дни", "4 дни", "5+ дни"] },
        { question: "Колко време имаш за една тренировка?", options: ["До 60 минути", "60–90 минути", "Над 90 минути"] },
        { question: "С какво оборудване разполагаш?", options: ["Само щанга, дискове и стойка", "Пълна зала — рамка, дъмбели, ластици и др."] },
        { question: "Предпочиташ ли тежестите да се адаптират сами според представянето ти (AMRAP/RPE)?", options: ["Да, харесвам гъвкавост според деня", "Не, предпочитам фиксиран точен план"] },
        { question: "Тренираш ли и друг спорт успоредно?", options: ["Не", "Да, леко (1–2 пъти седмично)", "Да, интензивно (3+ пъти седмично)"] },
        { question: "Имаш ли стари травми или дискомфорт, за които да внимаваме?", options: ["Да", "Не"] },
      ],
    },
    programDetail: {
      backToAll: "← Всички програми",
      statLevel: "Ниво",
      statGoal: "Цел",
      statDays: "Дни/седмица",
      statDuration: "Продължителност",
      overviewTitle: "Какво представлява",
      howItWorksTitle: "Как точно работи",
      bestForTitle: "За кого е подходяща",
      considerationsTitle: "На какво да обърнеш внимание",
      equipmentTitle: "Оборудване",
      equipmentFull: "Пълна зала",
      equipmentMinimal: "Само щанга и дискове",
      autoregTitle: "Автоматична адаптация",
      autoregLabels: {
        none: "Фиксиран план, без автоматична адаптация",
        medium: "Частична автоматична адаптация (AMRAP серии)",
        high: "Висока автоматична адаптация по представяне",
      },
      sessionMinTitle: "Минимална продължителност на сесия",
      minutesSuffix: "минути",
      otherSportsTitle: "Съвместимост с други спортове",
      otherSportsLabels: {
        low: "Ниска — тежка честота, трудно се комбинира",
        medium: "Умерена",
        high: "Висока — гъвкава",
      },
      failureRuleTitle: "Какво се случва при неуспешна серия",
      calculateButton: "Изчисли моя план →",
      browseOthers: "Разгледай други",
      equipmentItems: {
        щанга: "щанга",
        дискове: "дискове",
        "силова рамка": "силова рамка (клетка с предпазни лостове — за самостоятелен клек/лежанка, без партньор)",
        дъмбели: "дъмбели (за помощни упражнения)",
        стойка: "силова рамка (клетка с предпазни лостове — за самостоятелен клек/лежанка, без партньор)",
      },
    },
    start: {
      loading: "Зареждане…",
      signupTitle: "Направи профил",
      loginTitle: "Влез в профила си",
      authSubtitle: "Нужен е, за да пазим твоя календар, максимуми и прогрес.",
      emailPlaceholder: "Имейл",
      passwordPlaceholder: "Парола (мин. 6 символа)",
      signupButton: "Регистрирай се",
      loginButton: "Влез",
      switchToLogin: "Вече имаш профил? Влез",
      switchToSignup: "Нямаш профил? Регистрирай се",
      sessionExpired: "Сесията изтече — влез отново.",
      profileTitle: "Твоят профил",
      profileSubtitle: "Нужно е само веднъж — после винаги можеш да го редактираш.",
      nameLabel: "Име",
      namePlaceholder: "Псевдоним",
      experienceLabel: "Тренировъчен стаж",
      unitsLabel: "Мерни единици",
      unitsKg: "Килограми",
      unitsLb: "Паундове",
      plateStepLabel: "Стъпка на дисковете (kg)",
      daysPerWeekLabel: "Дни седмично",
      startingMaxesLabel: "Стартови максимуми (kg) — попълни каквото знаеш",
      maxPlaceholder: "напр. 80",
      saveButton: "Създай моята програма",
      savingButton: "Запазваме…",
      doneTitle: "Готово!",
      planReadyText: "Първата ти тренировка вече е готова, изчислена от твоите данни.",
      todayButton: "Към днешната тренировка →",
      planNotReadyText:
        "Профилът и планът ти са запазени. Календарният екран за тази програма е в процес на изграждане — засега данните ти вече чакат готови в базата.",
      errorGeneric: "Нещо се обърка при запазването. Опитай пак.",
      retryButton: "Пробвай пак",
    },
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
    quiz: {
      questionProgress: (n, total) => `Question ${n} of ${total}`,
      back: "← Back",
      loading: "Calculating the best programs for you…",
      retry: "Try again",
      resultsTitle: "Here's what we recommend",
      resultsSubtitle: "Ranked by how well they match your answers.",
      noMatch: "No program fits this combination well enough — try changing an answer.",
      bestMatch: "Best match",
      rankedMatch: (n) => `#${n} best fit`,
      matchSuffix: "match",
      viewProgram: "View program →",
      restart: "← Answer again",
      loadError: "We couldn't load the program catalog. Check your connection and try again.",
      questions: [
        { question: "What's your main goal?", options: ["General strength", "Strength and muscle mass", "Bench press focus", "Powerlifting total / meet performance"] },
        { question: "What's your training experience?", options: ["Beginner (< 6 months consistent training)", "Intermediate", "Advanced"] },
        { question: "How many days a week can you train?", options: ["2 days", "3 days", "4 days", "5+ days"] },
        { question: "How much time do you have per session?", options: ["Up to 60 minutes", "60–90 minutes", "Over 90 minutes"] },
        { question: "What equipment do you have access to?", options: ["Just a barbell, plates, and a rack", "Full gym — rack, dumbbells, bands, etc."] },
        { question: "Do you prefer weights that auto-adjust to your performance (AMRAP/RPE)?", options: ["Yes, I like flexibility day to day", "No, I prefer a fixed, exact plan"] },
        { question: "Do you also train another sport alongside this?", options: ["No", "Yes, lightly (1–2×/week)", "Yes, intensely (3+×/week)"] },
        { question: "Do you have old injuries or discomfort we should watch for?", options: ["Yes", "No"] },
      ],
    },
    programDetail: {
      backToAll: "← All programs",
      statLevel: "Level",
      statGoal: "Goal",
      statDays: "Days/week",
      statDuration: "Duration",
      overviewTitle: "What it is",
      howItWorksTitle: "How it works",
      bestForTitle: "Who it's for",
      considerationsTitle: "What to keep in mind",
      equipmentTitle: "Equipment",
      equipmentFull: "Full gym",
      equipmentMinimal: "Just a barbell and plates",
      autoregTitle: "Auto-regulation",
      autoregLabels: {
        none: "Fixed plan, no auto-regulation",
        medium: "Partial auto-regulation (AMRAP sets)",
        high: "High auto-regulation based on performance",
      },
      sessionMinTitle: "Minimum session length",
      minutesSuffix: "minutes",
      otherSportsTitle: "Compatibility with other sports",
      otherSportsLabels: {
        low: "Low — heavy frequency, hard to combine",
        medium: "Moderate",
        high: "High — flexible",
      },
      failureRuleTitle: "What happens on a failed set",
      calculateButton: "Calculate My Plan →",
      browseOthers: "Browse other programs",
      equipmentItems: {
        щанга: "barbell",
        дискове: "plates",
        "силова рамка": "power rack (safety cage — for training squat/bench alone, without a spotter)",
        дъмбели: "dumbbells (for accessory work)",
        стойка: "power rack (safety cage — for training squat/bench alone, without a spotter)",
      },
    },
    start: {
      loading: "Loading…",
      signupTitle: "Create an account",
      loginTitle: "Log in",
      authSubtitle: "Needed to save your calendar, maxes, and progress.",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password (min. 6 characters)",
      signupButton: "Sign up",
      loginButton: "Log in",
      switchToLogin: "Already have an account? Log in",
      switchToSignup: "No account yet? Sign up",
      sessionExpired: "Your session expired — please log in again.",
      profileTitle: "Your profile",
      profileSubtitle: "Only needed once — you can always edit it later.",
      nameLabel: "Name",
      namePlaceholder: "Nickname",
      experienceLabel: "Training experience",
      unitsLabel: "Units",
      unitsKg: "Kilograms",
      unitsLb: "Pounds",
      plateStepLabel: "Plate increment (kg)",
      daysPerWeekLabel: "Days per week",
      startingMaxesLabel: "Starting maxes (kg) — fill in what you know",
      maxPlaceholder: "e.g. 80",
      saveButton: "Create my program",
      savingButton: "Saving…",
      doneTitle: "Done!",
      planReadyText: "Your first workout is ready, calculated from your numbers.",
      todayButton: "Go to today's workout →",
      planNotReadyText:
        "Your profile and plan are saved. The calendar screen for this program is still being built — your data is already waiting in the database.",
      errorGeneric: "Something went wrong while saving. Please try again.",
      retryButton: "Try again",
    },
  },
};
