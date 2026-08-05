// =====================================================================
//  РЕЧНИК С ПРЕВОДИ — bg (по подразбиране) / en
//  Добавяме namespace по namespace, докато превеждаме всяка страница.
//  Засега: nav, footer, home (landing).
// =====================================================================

export type Locale = "bg" | "en";

export const translations = {
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
  },
  en: {
    nav: {
      programs: "Programs",
      createProgram: "Build Your Own",
      calculator: "1RM Calculator",
      quiz: "Quiz",
      dashboard: "Dashboard",
      login: "Log In",
      logout: "Log Out",
    },
    footer: {
      rights: "StrengthPlanner",
      privacy: "Privacy",
      terms: "Terms",
    },
    home: {
      heroKicker: "Exact kilograms. Every session.",
      heroTitle1: "Your training plan,",
      heroTitle2: "calculated to the",
      heroTitle3: "kilogram",
      heroSubtitle:
        "Pick a system. Enter your maxes. Get a real calendar — date, weight, sets, reps, rest. No guessing what's next.",
      ctaQuiz: "What are your goals?",
      ctaCatalog: "Browse the catalog",
      progressionCaption: "Example: your load changes automatically following the exact rules of your chosen program",
      howItWorks: "How it works",
      step1Title: "Answer a few questions",
      step1Desc: "Goal, experience, availability, equipment. You get 2–3 matching programs, not 8.",
      step2Title: "Enter your maxes",
      step2Desc: "Real or estimated 1RM. You choose how the plates round.",
      step3Title: "Train off a ready calendar",
      step3Desc: "Date, weight, sets, reps, rest timer. Progression calculates itself.",
      programsTitle: "Programs",
      viewAll: "View all →",
      finalCta: "Ready to know exactly what's next?",
      startQuiz: "Start the quiz →",
      featuredPrograms: [
        { name: "Starting Strength", tag: "Beginners", pitch: "Weight goes up every workout. The simplest proven starting point." },
        { name: "Wendler 5/3/1", tag: "Flexible", pitch: "Training max, AMRAP set, built-in deload." },
        { name: "Suровецкий — System #1", tag: "Precise", pitch: "Exact percentages from the original Russian tables, day by day." },
        { name: "Texas Method", tag: "Intermediate", pitch: "Volume, recovery, and intensity day within one week." },
        { name: "Juggernaut Method", tag: "Advanced", pitch: "Wave periodization with AMRAP tests each wave." },
        { name: "Hepburn Power Routine A", tag: "Classic", pitch: "Doubles become triples — set by set to a new max." },
      ],
    },
  },
} as const;

export type TranslationKey = typeof translations.bg;
