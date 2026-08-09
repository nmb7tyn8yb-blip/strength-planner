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
    moreToNextTier: (amount: number, unit: string, tier: string) => string;
    repTableTitle: string;
    useAndReturn: string;
    returningBanner: string;
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
  today: {
    loading: string;
    noPlanTitle: string;
    noPlanDesc: string;
    browsePrograms: string;
    unsupportedDesc: string;
    backToDashboard: string;
    doneTitle: string;
    nextScheduled: (date: string) => string;
    viewNext: string;
    progressLabel: string;
    setsOf: (done: number, total: number) => string;
    confirmMarked: string;
    confirmUnmark: string;
    weightQuestion: string;
    optionalLabel: string;
    pauseLabel: string;
    testLabel: string;
    setsMarked: (done: number, total: number) => string;
    finishButton: string;
    failureTitle: string;
    failureDesc: string;
    saveContinue: string;
    failureReasons: {
      weight_too_high: string;
      poor_sleep: string;
      pain: string;
      poor_technique: string;
      insufficient_rest: string;
      missed_previous_session: string;
      illness: string;
      other: string;
    };
    confirmMaxTitle: string;
    confirmMaxDesc: string;
    saveNewMax: string;
    submitting: string;
    errorPrefix: string;
    weightPlaceholder: string;
    forTodaySession: string;
  };
  activePlanWarning: {
    badge: string;
    startedOn: (date: string) => string;
    createNew: string;
    newSeparate: string;
    restOfSentence: string;
    proLink: string;
  };
  createProgram: {
    loadingProfile: string;
    authRequired: string;
    authRequiredDesc: string;
    makeProfile: string;
    doneTitle: string;
    doneDesc: string;
    goToToday: string;
    title: string;
    subtitle: string;
    programNameLabel: string;
    programNamePlaceholder: string;
    maxesLabel: string;
    maxesHint: string;
    maxPlaceholder: string;
    switchToPercent: string;
    switchToKg: string;
    deleteDay: string;
    exerciseHeader: string;
    setsHeader: string;
    repsHeader: string;
    kgHeader: string;
    restHeader: string;
    exercisePlaceholder: string;
    setsPlaceholder: string;
    repsPlaceholder: string;
    kgPlaceholder: string;
    restPlaceholder: string;
    deleteExerciseLabel: string;
    addExercise: string;
    addDay: string;
    savingButton: string;
    createButton: string;
    dayNamePrefix: (n: number) => string;
    sessionExpiredError: string;
    saveProgramError: string;
    saveDayError: string;
    saveExercisesError: string;
    createPlanError: string;
    genericError: string;
  };
  dangerZone: {
    title: string;
    description: string;
    deleteButton: string;
    confirmTitle: string;
    confirmDescription: string;
    confirmInputLabel: string;
    confirmWord: string;
    confirmButton: string;
    cancelButton: string;
    deleting: string;
    error: string;
  };
  dashboard: {
    loading: string;
    noPlanTitle: string;
    noPlanDesc: string;
    browsePrograms: string;
    yourPlans: (n: number) => string;
    currentWeights: string;
    completedWorkouts: string;
    successRate: string;
    upcoming: string;
    noUpcoming: string;
    recentWorkouts: string;
    noRecent: string;
    hide: string;
    viewAll: (n: number) => string;
    programStructure: string;
    weekOverview: string;
    historyTitle: string;
    dateHeader: string;
    exerciseHeader: string;
    weightHeader: string;
    repsHeader: string;
    noHistory: string;
    programFallback: string;
    statusLabels: {
      planned: string;
      in_progress: string;
      completed: string;
      partial: string;
      failed: string;
      skipped: string;
      moved: string;
    };
  };
  programCalc: {
    backToProgram: string;
    title: string;
    subtitle: string;
    unsupportedText: string;
    continueSignup: string;
    ssNote: string;
    hepburnNote: string;
    inputLabel: string;
    unknownMax: string;
    placeholder: string;
    calculateButton: string;
    saveProgressText: string;
    saveProgressButton: string;
    prefilledNote: string;
    warmup: string;
    workingSets: string;
    reps: string;
    wendlerTitle: string;
    wendlerSubtitle: string;
    ssTitle: (n: string) => string;
    ssSubtitleReduced: string;
    ssSubtitleNormal: string;
    ssWarmupNote: string;
    hepburnTitle: string;
    hepburnSubtitle: string;
    hepburnAfter: string;
    hepburnThisWeek: (w: number, unit: string) => string;
    texasTitle: string;
    texasSubtitle: string;
    surovetskySubtitle: string;
    juggernautTitle: string;
    juggernautSubtitle: (variant: string) => string;
    juggernautClassic: string;
    juggernautExcel: string;
    emailCaptureTitle: string;
    emailPlaceholder: string;
    emailSubmit: string;
    emailSubmitting: string;
    emailSuccess: string;
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
    unknownMax: string;
    saveButton: string;
    savingButton: string;
    doneTitle: string;
    planReadyText: string;
    todayButton: string;
    planNotReadyText: string;
    errorGeneric: string;
    retryButton: string;
    marketingLabel: string;
    authErrorRateLimit: (seconds: string) => string;
    authErrorAlreadyRegistered: string;
    authErrorInvalidCredentials: string;
    authErrorWeakPassword: string;
    authErrorEmailNotConfirmed: string;
    authErrorEmailRateLimit: string;
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
      rights: "SilaPlan",
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
      weightLabel: "Вдигнато тегло",
      repsLabel: "Повторения",
      repsHint: "Най-точно е под 10 повторения.",
      compareShow: "+ Сравни спрямо ниво на сила (по тегло/пол/възраст)",
      compareHide: "− Скрий сравнение с ниво на сила",
      bodyweightLabel: "Твоето тегло",
      sexLabel: "Пол",
      male: "Мъж",
      female: "Жена",
      ageLabel: "Възраст (по избор)",
      ageOptional: "незадължително",
      calculateButton: "Изчисли →",
      resultTitle: "Приблизителен максимум",
      strengthLevelPrefix: "× телесното тегло",
      moreToNextTier: (amount, unit, tier) => `Още ${amount} ${unit} до ниво ${tier}.`,
      repTableTitle: "Тежест за други повторения (изчислено от максимума)",
      useAndReturn: "Използвай тази тежест и се върни в плана →",
      returningBanner: "Изчисляваш максимум, за да продължиш плана си — след изчислението ще се върнеш автоматично.",
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
      unknownMax: "Не знаеш максимума? →",
      saveButton: "Създай моята програма",
      savingButton: "Запазваме…",
      doneTitle: "Готово!",
      planReadyText: "Първата ти тренировка вече е готова, изчислена от твоите данни.",
      todayButton: "Към днешната тренировка →",
      planNotReadyText:
        "Профилът и планът ти са запазени. Календарният екран за тази програма е в процес на изграждане — засега данните ти вече чакат готови в базата.",
      errorGeneric: "Нещо се обърка при запазването. Опитай пак.",
      retryButton: "Пробвай пак",
      marketingLabel: "Искам да получавам полезни тренировъчни съвети по имейл (по избор)",
      authErrorRateLimit: (seconds) => `От съображения за сигурност можеш да опиташ пак след ${seconds} секунди.`,
      authErrorAlreadyRegistered: "Вече има профил с този имейл — опитай да влезеш вместо да се регистрираш.",
      authErrorInvalidCredentials: "Грешен имейл или парола.",
      authErrorWeakPassword: "Паролата трябва да е поне 6 символа.",
      authErrorEmailNotConfirmed: "Провери пощата си — трябва да потвърдиш имейла преди да влезеш.",
      authErrorEmailRateLimit: "Изпратени са твърде много имейли скоро — изчакай малко и опитай пак.",
    },
    programCalc: {
      backToProgram: "← Назад към програмата",
      title: "Калкулатор — без регистрация",
      subtitle: "Въведи максимумите си и виж реалния план веднага. Ще пазим нищо, докато сам не решиш да запазиш прогреса си.",
      unsupportedText: "Калкулаторът за тази програма е в процес на изграждане — засега може да продължиш директно с регистрация, за да ти изготвим плана.",
      continueSignup: "Продължи с регистрация →",
      ssNote: "Официалната програма не смята по проценти — Rippetoe просто съветва да започнеш по-леко, отколкото мислиш, че можеш. Ще изчислим безопасна начална тежест от оценка за 5 повторения (формула на Brzycki + запас) — това е наша преценка, не фиксирано правило от оригинала. Тежестта бързо ще настигне истинската ти сила.",
      hepburnNote: "Началната тежест ще бъде ~80% от максимума ти — това е документирано в оригиналния източник на метода, не наша преценка.",
      inputLabel: "1RM (реален или приблизителен)",
      unknownMax: "Не знаеш максимума? →",
      placeholder: "напр. 60",
      calculateButton: "Изчисли плана →",
      saveProgressText: "Това е само първата стъпка. За пълния план, автоматична прогресия и календар по дати — запази прогреса си.",
      saveProgressButton: "Запази прогреса си →",
      prefilledNote: "Тежестите ти вече ще са попълнени — няма да ги пишеш втори път.",
      warmup: "Загряване",
      workingSets: "Работни серии",
      reps: "повт.",
      wendlerTitle: "Седмица 1 — твоят план",
      wendlerSubtitle: "Тренировъчен максимум = 90% от въведения 1RM. Последната серия е AMRAP, следвана от FSL 5×5 — помощен обем, изрично препоръчан от Wendler.",
      ssTitle: (n) => `Тренировка ${n} — твоята първа стъпка`,
      ssSubtitleReduced: "Тежестите по-долу са консервативна оценка (5RM по формула + запас за безопасност) — не фиксирано правило от оригинала, а разумен, безопасен старт. Загряването е изчислено автоматично спрямо работната тежест.",
      ssSubtitleNormal: "Тежестта расте на всяка следваща успешна тренировка. Загряването е изчислено автоматично спрямо работната тежест.",
      ssWarmupNote: "",
      hepburnTitle: "Седмица 1 — 1×3 + 7×2",
      hepburnSubtitle: "Прогресията е седмична — тренираш този lift 2 пъти седмично (по класическото разписание), с една и съща схема през цялата седмица. Всяка следваща седмица една двойка става тройка, докато стигнеш 8×3 — тогава се добавя тежест и цикълът започва отново.",
      hepburnAfter: "след 8×3",
      hepburnThisWeek: (w, unit) => `Работни серии тази седмица (1×3 + 7×2 — ${w} ${unit})`,
      texasTitle: "Понеделник — обемен ден",
      texasSubtitle: "Тежестите са оценени от твоя 1RM (формула на Brzycki за 5RM) — Texas Method реално иска текущ 5RM, не максимум.",
      surovetskySubtitle: "Точните проценти от оригиналните таблици, изчислени от твоя реален максимум.",
      juggernautTitle: "Седмица 1 (натрупване)",
      juggernautSubtitle: (variant) => `Тренировъчен максимум = 90% от въведения 1RM. ${variant}`,
      juggernautClassic: "Класически 16-седмичен вариант.",
      juggernautExcel: "Опростен 12-седмичен вариант.",
      emailCaptureTitle: "Или само остави имейла си — ще ти пращаме полезни тренировъчни съвети, без да се регистрираш сега.",
      emailPlaceholder: "твоят@имейл.com",
      emailSubmit: "Абонирай ме",
      emailSubmitting: "Изпращаме…",
      emailSuccess: "Готово! Ще ти пишем с полезни съвети.",
    },
    today: {
      loading: "Зареждаме днешната ти тренировка…",
      noPlanTitle: "Нямаш насрочена тренировка",
      noPlanDesc: "Или още нямаш активен план, или си влязъл с друг акаунт.",
      browsePrograms: "Разгледай програмите",
      unsupportedDesc:
        "Тази програма все още не е свързана с този екран — но всичките 8 програми вече имат готова логика, скоро ще бъде и тук.",
      backToDashboard: "Обратно към таблото",
      doneTitle: "Записано!",
      nextScheduled: (date) => `Следващата ти тренировка е насрочена за ${date}, изчислена спрямо резултата ти днес.`,
      viewNext: "Виж следващата тренировка →",
      progressLabel: "Прогрес на тренировката",
      setsOf: (done, total) => `${done} / ${total} серии`,
      confirmMarked: "Отбелязано по план — кликни за отмяна",
      confirmUnmark: "Отбележи като изпълнена по план",
      weightQuestion: "С колко",
      optionalLabel: "по избор",
      pauseLabel: "Пауза 2-3 сек",
      testLabel: "Проходка",
      setsMarked: (done, total) => `${done} от ${total} серии отбелязани`,
      finishButton: "Завърши тренировката →",
      failureTitle: "Не всички серии бяха изпълнени",
      failureDesc:
        "Няма проблем — избери причината, за да запазим точна история. Решението (повторение на тежестта или намаление) следва вградените правила на Starting Strength автоматично.",
      saveContinue: "Запази и продължи →",
      failureReasons: {
        weight_too_high: "Тежестта беше прекалено висока",
        poor_sleep: "Недоспиване",
        pain: "Болка/дискомфорт",
        poor_technique: "Лоша техника",
        insufficient_rest: "Недостатъчна почивка между сериите",
        missed_previous_session: "Пропусната предишна тренировка",
        illness: "Заболяване",
        other: "Друга причина",
      },
      confirmMaxTitle: "Каква тежест реално вдигна на теста?",
      confirmMaxDesc:
        'Това е "проходката" — истинският опит за нов максимум, не планираната тежест. Въведи реално постигнатото, дори ако е различно от плана.',
      saveNewMax: "Запази новия максимум →",
      submitting: "Запазваме…",
      errorPrefix: "Грешка: ",
      weightPlaceholder: "напр. 20",
      forTodaySession: "За днешната тренировка",
    },
    activePlanWarning: {
      badge: "⚠ Вече имаш активен план",
      startedOn: (date) => `започнат на ${date}.`,
      createNew: "Ако продължиш, ще създадем",
      newSeparate: "нов, отделен",
      restOfSentence:
        "план — старият ще си остане в историята ти (виждаш го от таблото), но вече няма да е активният по подразбиране.",
      proLink: "Pro поддържа неограничени активни планове едновременно →",
    },
    createProgram: {
      loadingProfile: "Проверяваме профила ти…",
      authRequired: "Нужен е профил",
      authRequiredDesc: "За да създадеш и следиш собствена програма, първо ти трябва профил (безплатно).",
      makeProfile: "Направи профил →",
      doneTitle: "Готово!",
      doneDesc:
        "Твоята програма е запазена. Първата тренировка вече те чака — сайтът ще повтаря шаблона ти всяка седмица и ще следи прогреса ти автоматично.",
      goToToday: "Към днешната тренировка →",
      title: "Създай своя програма",
      subtitle:
        "Определи седмичния си шаблон веднъж — сайтът ще го повтаря автоматично всяка седмица и ще ти показва днешната тренировка на ред, точно както при готовите програми. Промяна на тежести/повторения правиш, като редактираш шаблона си.",
      programNameLabel: "Име на програмата",
      programNamePlaceholder: "напр. Моята сплит програма",
      maxesLabel: "Твоите максимуми (по избор)",
      maxesHint: "Попълни, ако искаш тежести на упражнения да се изчисляват автоматично като процент от максимума ти, вместо да пишеш килограми ръчно за всяко.",
      maxPlaceholder: "напр. 100",
      switchToPercent: "% от макс",
      switchToKg: "фикс. кг",
      deleteDay: "Изтрий деня",
      exerciseHeader: "Упражнение",
      setsHeader: "Серии",
      repsHeader: "Повторения",
      kgHeader: "Кг",
      restHeader: "Почивка сек",
      exercisePlaceholder: "Упражнение",
      setsPlaceholder: "Серии",
      repsPlaceholder: "Повт.",
      kgPlaceholder: "Кг",
      restPlaceholder: "Почивка сек",
      deleteExerciseLabel: "Изтрий упражнението",
      addExercise: "+ Добави упражнение",
      addDay: "+ Добави тренировъчен ден",
      savingButton: "Запазваме…",
      createButton: "Създай програмата →",
      dayNamePrefix: (n) => `Ден ${n}`,
      sessionExpiredError: "Сесията изтече — влез отново.",
      saveProgramError: "Не успяхме да запазим програмата.",
      saveDayError: "Не успяхме да запазим тренировъчния ден.",
      saveExercisesError: "Не успяхме да запазим упражненията.",
      createPlanError: "Не успяхме да създадем плана.",
      genericError: "Нещо се обърка. Опитай пак.",
    },
    dangerZone: {
      title: "Изтрий профила си",
      description: "Изтриването на профила е необратимо — всичките ти планове, история и записи ще бъдат изтрити завинаги.",
      deleteButton: "Изтрий профила си",
      confirmTitle: "Наистина ли искаш да изтриеш профила си?",
      confirmDescription: "Това действие не може да бъде отменено. За да потвърдиш, напиши ИЗТРИЙ в полето по-долу.",
      confirmInputLabel: "Напиши ИЗТРИЙ, за да потвърдиш",
      confirmWord: "ИЗТРИЙ",
      confirmButton: "Потвърди изтриването",
      cancelButton: "Отказ",
      deleting: "Изтриваме…",
      error: "Не успяхме да изтрием профила. Опитай пак или пиши ни.",
    },
    dashboard: {
      loading: "Зареждаме таблото ти…",
      noPlanTitle: "Нямаш активен план",
      noPlanDesc: "Избери програма от каталога — калкулаторът работи веднага, без регистрация, ако само искаш да провериш числата.",
      browsePrograms: "Разгледай програмите",
      yourPlans: (n) => `Твоите планове (${n})`,
      currentWeights: "Текущи тежести",
      completedWorkouts: "Изиграни тренировки",
      successRate: "Успеваемост",
      upcoming: "Предстоящи",
      noUpcoming: "Няма насрочени тренировки.",
      recentWorkouts: "Последни тренировки",
      noRecent: "Още нямаш изиграни тренировки.",
      hide: "Скрий",
      viewAll: (n) => `Виж всички (${n})`,
      programStructure: "Структура на програмата",
      weekOverview: "Твоят седмичен план",
      historyTitle: "История на сериите",
      dateHeader: "Дата",
      exerciseHeader: "Упражнение",
      weightHeader: "Тегло",
      repsHeader: "Повторения",
      noHistory: "Все още няма записана история.",
      programFallback: "Програма",
      statusLabels: {
        planned: "Планирана",
        in_progress: "В прогрес",
        completed: "Изпълнена",
        partial: "Частично изпълнена",
        failed: "Неуспешна",
        skipped: "Пропусната",
        moved: "Преместена",
      },
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
      rights: "SilaPlan",
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
      weightLabel: "Weight lifted",
      repsLabel: "Reps",
      repsHint: "Most accurate under 10 reps.",
      compareShow: "+ Compare against strength level (bodyweight/sex/age)",
      compareHide: "− Hide strength level comparison",
      bodyweightLabel: "Your bodyweight",
      sexLabel: "Sex",
      male: "Male",
      female: "Female",
      ageLabel: "Age (optional)",
      ageOptional: "optional",
      calculateButton: "Calculate →",
      resultTitle: "Estimated Max",
      strengthLevelPrefix: "× bodyweight",
      moreToNextTier: (amount, unit, tier) => `${amount} ${unit} to reach ${tier}.`,
      repTableTitle: "Weight for other rep ranges (from your estimated max)",
      useAndReturn: "Use this weight and return to your plan →",
      returningBanner: "You're calculating a max to continue your plan — you'll return automatically after this.",
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
      unknownMax: "Don't know your max? →",
      saveButton: "Create my program",
      savingButton: "Saving…",
      doneTitle: "Done!",
      planReadyText: "Your first workout is ready, calculated from your numbers.",
      todayButton: "Go to today's workout →",
      planNotReadyText:
        "Your profile and plan are saved. The calendar screen for this program is still being built — your data is already waiting in the database.",
      errorGeneric: "Something went wrong while saving. Please try again.",
      retryButton: "Try again",
      marketingLabel: "I'd like to receive useful training tips by email (optional)",
      authErrorRateLimit: (seconds) => `For security purposes, you can only try again after ${seconds} seconds.`,
      authErrorAlreadyRegistered: "An account with this email already exists — try logging in instead of signing up.",
      authErrorInvalidCredentials: "Incorrect email or password.",
      authErrorWeakPassword: "Password must be at least 6 characters.",
      authErrorEmailNotConfirmed: "Check your inbox — you need to confirm your email before logging in.",
      authErrorEmailRateLimit: "Too many emails sent recently — please wait a bit and try again.",
    },
    programCalc: {
      backToProgram: "← Back to program",
      title: "Calculator — no signup",
      subtitle: "Enter your maxes and see the real plan right away. We won't save anything until you decide to save your progress.",
      unsupportedText: "The calculator for this program is still being built — for now you can sign up directly and we'll prepare your plan.",
      continueSignup: "Continue with sign up →",
      ssNote: "The official program doesn't use percentages — Rippetoe simply advises starting lighter than you think you can. We'll calculate a safe starting weight from a 5-rep estimate (Brzycki formula + buffer) — this is our own judgment call, not a fixed rule from the original. The weight will quickly catch up to your real strength.",
      hepburnNote: "The starting weight will be ~80% of your max — this is documented in the original source of the method, not our own guess.",
      inputLabel: "1RM (real or estimated)",
      unknownMax: "Don't know your max? →",
      placeholder: "e.g. 60",
      calculateButton: "Calculate plan →",
      saveProgressText: "This is just the first step. For the full plan, automatic progression, and a dated calendar — save your progress.",
      saveProgressButton: "Save my progress →",
      prefilledNote: "Your weights will already be filled in — no need to type them twice.",
      warmup: "Warm-up",
      workingSets: "Working sets",
      reps: "reps",
      wendlerTitle: "Week 1 — your plan",
      wendlerSubtitle: "Training max = 90% of the entered 1RM. The last set is AMRAP, followed by FSL 5×5 — assistance volume explicitly recommended by Wendler.",
      ssTitle: (n) => `Workout ${n} — your first step`,
      ssSubtitleReduced: "The weights below are a conservative estimate (formula-based 5RM + safety buffer) — not a fixed rule from the original, but a sensible, safe start. Warm-up is calculated automatically from the working weight.",
      ssSubtitleNormal: "The weight increases every successful workout. Warm-up is calculated automatically from the working weight.",
      ssWarmupNote: "",
      hepburnTitle: "Week 1 — 1×3 + 7×2",
      hepburnSubtitle: "Progression is weekly — you train this lift twice a week (per the classic schedule), with the same scheme all week. Each following week one double becomes a triple, until you reach 8×3 — then weight is added and the cycle restarts.",
      hepburnAfter: "after 8×3",
      hepburnThisWeek: (w, unit) => `This week's working sets (1×3 + 7×2 — ${w} ${unit})`,
      texasTitle: "Monday — volume day",
      texasSubtitle: "Weights are estimated from your 1RM (Brzycki 5RM formula) — Texas Method actually wants a current 5RM, not a max.",
      surovetskySubtitle: "Exact percentages from the original tables, calculated from your real max.",
      juggernautTitle: "Week 1 (accumulation)",
      juggernautSubtitle: (variant) => `Training max = 90% of the entered 1RM. ${variant}`,
      juggernautClassic: "Classic 16-week variant.",
      juggernautExcel: "Simplified 12-week variant.",
      emailCaptureTitle: "Or just leave your email — we'll send useful training tips, no need to sign up now.",
      emailPlaceholder: "your@email.com",
      emailSubmit: "Subscribe me",
      emailSubmitting: "Sending…",
      emailSuccess: "Done! We'll be in touch with useful tips.",
    },
    today: {
      loading: "Loading today's workout…",
      noPlanTitle: "No workout scheduled",
      noPlanDesc: "Either you don't have an active plan yet, or you're logged in with a different account.",
      browsePrograms: "Browse programs",
      unsupportedDesc:
        "This program isn't connected to this screen yet — but all 8 programs already have the logic ready, it's coming here soon.",
      backToDashboard: "Back to dashboard",
      doneTitle: "Saved!",
      nextScheduled: (date) => `Your next workout is scheduled for ${date}, calculated from today's result.`,
      viewNext: "View next workout →",
      progressLabel: "Workout progress",
      setsOf: (done, total) => `${done} / ${total} sets`,
      confirmMarked: "Marked as planned — click to undo",
      confirmUnmark: "Mark as done as planned",
      weightQuestion: "How much",
      optionalLabel: "optional",
      pauseLabel: "Pause 2-3 sec",
      testLabel: "Test attempt",
      setsMarked: (done, total) => `${done} of ${total} sets marked`,
      finishButton: "Finish workout →",
      failureTitle: "Not all sets were completed",
      failureDesc:
        "No problem — pick the reason, so we keep an accurate history. The decision (repeat the weight or reduce it) follows Starting Strength's built-in rules automatically.",
      saveContinue: "Save and continue →",
      failureReasons: {
        weight_too_high: "The weight was too heavy",
        poor_sleep: "Poor sleep",
        pain: "Pain/discomfort",
        poor_technique: "Poor technique",
        insufficient_rest: "Not enough rest between sets",
        missed_previous_session: "Missed a previous session",
        illness: "Illness",
        other: "Other reason",
      },
      confirmMaxTitle: "What weight did you actually hit on the test?",
      confirmMaxDesc:
        "This is the \"test attempt\" — the real try at a new max, not the planned weight. Enter what you actually achieved, even if different from plan.",
      saveNewMax: "Save new max →",
      submitting: "Saving…",
      errorPrefix: "Error: ",
      weightPlaceholder: "e.g. 20",
      forTodaySession: "For today's session",
    },
    activePlanWarning: {
      badge: "⚠ You already have an active plan",
      startedOn: (date) => `started on ${date}.`,
      createNew: "If you continue, we'll create a",
      newSeparate: "new, separate",
      restOfSentence:
        "plan — the old one stays in your history (visible from the dashboard), but it won't be the default active one anymore.",
      proLink: "Pro supports unlimited active plans at once →",
    },
    createProgram: {
      loadingProfile: "Checking your profile…",
      authRequired: "Account required",
      authRequiredDesc: "To create and track your own program, you first need a free account.",
      makeProfile: "Create account →",
      doneTitle: "Done!",
      doneDesc:
        "Your program is saved. Your first workout is ready — the site will repeat your template every week and track your progress automatically.",
      goToToday: "Go to today's workout →",
      title: "Build your own program",
      subtitle:
        "Set your weekly template once — the site will repeat it automatically every week and show today's workout in order, just like the built-in programs. Change weights/reps by editing your template.",
      programNameLabel: "Program name",
      programNamePlaceholder: "e.g. My split routine",
      maxesLabel: "Your maxes (optional)",
      maxesHint: "Fill in if you want exercise weights to calculate automatically as a percentage of your max, instead of typing kg manually for each one.",
      maxPlaceholder: "e.g. 100",
      switchToPercent: "% of max",
      switchToKg: "fixed kg",
      deleteDay: "Delete day",
      exerciseHeader: "Exercise",
      setsHeader: "Sets",
      repsHeader: "Reps",
      kgHeader: "Kg",
      restHeader: "Rest sec",
      exercisePlaceholder: "Exercise",
      setsPlaceholder: "Sets",
      repsPlaceholder: "Reps",
      kgPlaceholder: "Kg",
      restPlaceholder: "Rest sec",
      deleteExerciseLabel: "Delete exercise",
      addExercise: "+ Add exercise",
      addDay: "+ Add training day",
      savingButton: "Saving…",
      createButton: "Create program →",
      dayNamePrefix: (n) => `Day ${n}`,
      sessionExpiredError: "Your session expired — please log in again.",
      saveProgramError: "We couldn't save the program.",
      saveDayError: "We couldn't save the training day.",
      saveExercisesError: "We couldn't save the exercises.",
      createPlanError: "We couldn't create the plan.",
      genericError: "Something went wrong. Please try again.",
    },
    dangerZone: {
      title: "Delete account",
      description: "Deleting your account is permanent — all your plans, history, and records will be deleted forever.",
      deleteButton: "Delete my account",
      confirmTitle: "Are you sure you want to delete your account?",
      confirmDescription: "This action can't be undone. To confirm, type DELETE in the field below.",
      confirmInputLabel: "Type DELETE to confirm",
      confirmWord: "DELETE",
      confirmButton: "Confirm deletion",
      cancelButton: "Cancel",
      deleting: "Deleting…",
      error: "We couldn't delete your account. Please try again or contact us.",
    },
    dashboard: {
      loading: "Loading your dashboard…",
      noPlanTitle: "No active plan",
      noPlanDesc: "Pick a program from the catalog — the calculator works instantly, no signup, if you just want to check the numbers.",
      browsePrograms: "Browse programs",
      yourPlans: (n) => `Your plans (${n})`,
      currentWeights: "Current weights",
      completedWorkouts: "Workouts completed",
      successRate: "Success rate",
      upcoming: "Upcoming",
      noUpcoming: "No workouts scheduled.",
      recentWorkouts: "Recent workouts",
      noRecent: "No workouts completed yet.",
      hide: "Hide",
      viewAll: (n) => `View all (${n})`,
      programStructure: "Program structure",
      weekOverview: "Your weekly plan",
      historyTitle: "Set history",
      dateHeader: "Date",
      exerciseHeader: "Exercise",
      weightHeader: "Weight",
      repsHeader: "Reps",
      noHistory: "No history recorded yet.",
      programFallback: "Program",
      statusLabels: {
        planned: "Planned",
        in_progress: "In progress",
        completed: "Completed",
        partial: "Partially completed",
        failed: "Failed",
        skipped: "Skipped",
        moved: "Moved",
      },
    },
  },
};
