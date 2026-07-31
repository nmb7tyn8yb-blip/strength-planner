// =====================================================================
//  ПРЕПОРЪЧВАЩ АЛГОРИТЪМ — от отговорите на въпросника до подредена
//  листа с най-подходящи програми.
//
//  Използва се така:
//    const answers = { ... };                       // от wizard-а
//    const results = recommendProgram(answers, programsFromDb);
//    // results[0] е най-добрата препоръка, с explanation защо
// =====================================================================

// ---------------------------------------------------------------------
// 1. ВЪПРОСНИК — точно тези въпроси се показват на потребителя
// ---------------------------------------------------------------------

export type Goal = "strength" | "strength_mass" | "bench_focus" | "powerlifting_total";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type SessionDuration = "short" | "medium" | "long"; // <60 / 60-90 / 90+ мин
export type EquipmentLevel = "minimal" | "full";           // само щанга+дискове / пълна екипировка
export type SportsLoad = "none" | "light" | "heavy";       // други спортове успоредно

export interface QuizAnswers {
  goal: Goal;
  experience: ExperienceLevel;
  daysPerWeek: number;              // 2–6, от наличността на потребителя
  sessionDuration: SessionDuration;
  equipment: EquipmentLevel;
  prefersAutoregulation: boolean;   // харесва AMRAP/RPE решения вместо фиксирани %
  otherSportsLoad: SportsLoad;
  hasInjuryConcerns: boolean;
}

// Метаданни за UI-а на самия въпросник (текстове на бутоните)
export const QUIZ_QUESTIONS = [
  {
    key: "goal",
    question: "Каква е основната ти цел?",
    options: [
      { value: "strength", label: "Обща сила" },
      { value: "strength_mass", label: "Сила и мускулна маса" },
      { value: "bench_focus", label: "Основно лежанка" },
      { value: "powerlifting_total", label: "Трибой / състезателен резултат" },
    ],
  },
  {
    key: "experience",
    question: "Какъв е тренировъчният ти стаж?",
    options: [
      { value: "beginner", label: "Начинаещ (< 6 месеца системни тренировки)" },
      { value: "intermediate", label: "Средно напреднал" },
      { value: "advanced", label: "Напреднал" },
    ],
  },
  {
    key: "daysPerWeek",
    question: "Колко дни седмично можеш да тренираш?",
    options: [
      { value: 2, label: "2 дни" },
      { value: 3, label: "3 дни" },
      { value: 4, label: "4 дни" },
      { value: 5, label: "5+ дни" },
    ],
  },
  {
    key: "sessionDuration",
    question: "Колко време имаш за една тренировка?",
    options: [
      { value: "short", label: "До 60 минути" },
      { value: "medium", label: "60–90 минути" },
      { value: "long", label: "Над 90 минути" },
    ],
  },
  {
    key: "equipment",
    question: "С какво оборудване разполагаш?",
    options: [
      { value: "minimal", label: "Само щанга, дискове и стойка" },
      { value: "full", label: "Пълна зала — рамка, дъмбели, ластици и др." },
    ],
  },
  {
    key: "prefersAutoregulation",
    question: "Предпочиташ ли тежестите да се адаптират сами според представянето ти (AMRAP/RPE)?",
    options: [
      { value: true, label: "Да, харесвам гъвкавост според деня" },
      { value: false, label: "Не, предпочитам фиксиран точен план" },
    ],
  },
  {
    key: "otherSportsLoad",
    question: "Тренираш ли и друг спорт успоредно?",
    options: [
      { value: "none", label: "Не" },
      { value: "light", label: "Да, леко (1–2 пъти седмично)" },
      { value: "heavy", label: "Да, интензивно (3+ пъти седмично)" },
    ],
  },
  {
    key: "hasInjuryConcerns",
    question: "Имаш ли стари травми или дискомфорт, за които да внимаваме?",
    options: [
      { value: true, label: "Да" },
      { value: false, label: "Не" },
    ],
  },
] as const;

// ---------------------------------------------------------------------
// 2. ПРОФИЛ НА ПРОГРАМА (идва от programs.recommendation_profile в БД)
// ---------------------------------------------------------------------

export interface ProgramRecord {
  id: string;
  slug: string;
  name: string;
  level: ExperienceLevel;
  daysPerWeek: number;
  recommendationProfile: {
    goals: Goal[];
    experience_min: ExperienceLevel;
    experience_ideal: ExperienceLevel[];
    days_per_week_allowed: number[];
    min_session_minutes: number;
    equipment: EquipmentLevel;
    autoregulation: "none" | "medium" | "high";
    complexity: "low" | "medium" | "high";
    other_sports_tolerance: "low" | "medium" | "high";
    injury_friendly: boolean;
    pitch: string;
  };
}

export interface RecommendationResult {
  program: ProgramRecord;
  score: number;          // 0–100
  matchLevel: "отличен" | "добър" | "възможен";
  reasons: string[];      // защо е препоръчана (или с уговорка)
  warnings: string[];     // на какво да внимава потребителят
}

// ---------------------------------------------------------------------
// 3. ПОМОЩНИ СКАЛИ
// ---------------------------------------------------------------------

const EXPERIENCE_RANK: Record<ExperienceLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const SESSION_MINUTES: Record<SessionDuration, number> = {
  short: 50,
  medium: 75,
  long: 105,
};

const TOLERANCE_RANK: Record<"low" | "medium" | "high", number> = {
  low: 0,
  medium: 1,
  high: 2,
};

// ---------------------------------------------------------------------
// 4. ОСНОВНА ФУНКЦИЯ ЗА ПРЕПОРЪКА
// ---------------------------------------------------------------------

export function recommendProgram(
  answers: QuizAnswers,
  programs: ProgramRecord[]
): RecommendationResult[] {
  const results = programs
    .map((program) => scoreProgram(answers, program))
    .filter((r) => r.score > 0) // твърдите филтри вече са изключили негодните
    .sort((a, b) => b.score - a.score);

  return results;
}

function scoreProgram(
  answers: QuizAnswers,
  program: ProgramRecord
): RecommendationResult {
  const p = program.recommendationProfile;
  const reasons: string[] = [];
  const warnings: string[] = [];

  // --- ТВЪРДИ ФИЛТРИ (елиминират програмата напълно) -----------------

  // Ниво под минимума за програмата -> неподходяща
  if (EXPERIENCE_RANK[answers.experience] < EXPERIENCE_RANK[p.experience_min]) {
    return zeroResult(program, [
      `Изисква поне ниво "${labelForLevel(p.experience_min)}", а ти отбеляза "${labelForLevel(
        answers.experience
      )}".`,
    ]);
  }

  // Оборудване: "full" изисквания не могат да се покрият с "minimal"
  if (p.equipment === "full" && answers.equipment === "minimal") {
    return zeroResult(program, ["Изисква оборудване, с което засега не разполагаш."]);
  }

  // --- МЕКО СКОРИРАНЕ (0–100, натрупва се по критерии) ---------------

  let score = 0;
  const maxScore = 100;

  // Цел — 30 точки (най-тежък критерий)
  const goalWeight = 30;
  if (p.goals.includes(answers.goal)) {
    score += goalWeight;
    reasons.push("Целта ти съвпада директно с фокуса на програмата.");
  } else if (
    answers.goal === "powerlifting_total" &&
    p.goals.includes("strength")
  ) {
    score += goalWeight * 0.5;
    reasons.push("Покрива силовата основа, но не е специализирана за трибой.");
  } else {
    warnings.push("Основната цел на програмата не е точно твоята — все пак може да свърши работа.");
  }

  // Ниво (идеално vs просто допустимо) — 20 точки
  const experienceWeight = 20;
  if (p.experience_ideal.includes(answers.experience)) {
    score += experienceWeight;
    reasons.push(`Идеална е точно за ниво "${labelForLevel(answers.experience)}".`);
  } else {
    score += experienceWeight * 0.4;
    warnings.push("Ще работи, но не е първият избор за твоето ниво.");
  }

  // Дни седмично — 15 точки
  const daysWeight = 15;
  if (p.days_per_week_allowed.includes(answers.daysPerWeek)) {
    score += daysWeight;
    reasons.push(`Пасва точно на наличните ти ${answers.daysPerWeek} дни седмично.`);
  } else {
    const closestDiff = Math.min(
      ...p.days_per_week_allowed.map((d) => Math.abs(d - answers.daysPerWeek))
    );
    if (closestDiff === 1) {
      score += daysWeight * 0.5;
      warnings.push("Разписанието изисква с един ден повече/по-малко от посоченото — възможно е с лека корекция.");
    } else {
      warnings.push("Изисква тренировъчна честота, доста различна от посочената.");
    }
  }

  // Продължителност на тренировка — 10 точки
  const durationWeight = 10;
  const availableMinutes = SESSION_MINUTES[answers.sessionDuration];
  if (availableMinutes >= p.min_session_minutes) {
    score += durationWeight;
  } else {
    score += durationWeight * 0.3;
    warnings.push("Може да се наложи да съкратиш почивките, за да се вместиш във времето си.");
  }

  // Автоматична адаптация (AMRAP/RPE) vs фиксиран план — 10 точки
  const autoregWeight = 10;
  const wantsAuto = answers.prefersAutoregulation;
  const hasAuto = p.autoregulation !== "none";
  if (wantsAuto === hasAuto) {
    score += autoregWeight;
    reasons.push(
      wantsAuto
        ? "Има вградена автоматична адаптация според представянето ти."
        : "Планът е фиксиран и предвидим, точно както предпочиташ."
    );
  } else {
    score += autoregWeight * 0.3;
  }

  // Съвместимост с други спортове — 10 точки
  const sportsWeight = 10;
  if (answers.otherSportsLoad === "none") {
    score += sportsWeight; // няма конфликт по дефиниция
  } else {
    const neededTolerance =
      answers.otherSportsLoad === "heavy" ? "high" : "medium";
    if (TOLERANCE_RANK[p.other_sports_tolerance] >= TOLERANCE_RANK[neededTolerance]) {
      score += sportsWeight;
      reasons.push("Съвместима е с допълнителното ти спортно натоварване.");
    } else {
      score += sportsWeight * 0.2;
      warnings.push(
        "Комбинацията с другия ти спорт ще изисква внимателно планиране на тежките дни."
      );
    }
  }

  // Травми/дискомфорт — 5 точки
  const injuryWeight = 5;
  if (answers.hasInjuryConcerns) {
    if (p.injury_friendly) {
      score += injuryWeight;
      reasons.push("Позволява лесна замяна на упражнения при дискомфорт.");
    } else {
      warnings.push("Структурата е по-твърда — ще трябва индивидуална адаптация при болка.");
    }
  } else {
    score += injuryWeight;
  }

  score = Math.round(Math.min(score, maxScore));

  return {
    program,
    score,
    matchLevel: score >= 80 ? "отличен" : score >= 55 ? "добър" : "възможен",
    reasons,
    warnings,
  };
}

function zeroResult(program: ProgramRecord, warnings: string[]): RecommendationResult {
  return { program, score: 0, matchLevel: "възможен", reasons: [], warnings };
}

function labelForLevel(level: ExperienceLevel): string {
  return { beginner: "начинаещ", intermediate: "средно напреднал", advanced: "напреднал" }[level];
}

// ---------------------------------------------------------------------
// 5. ПРИМЕРНО ИЗПОЛЗВАНЕ (за справка — маха се в реалния код)
// ---------------------------------------------------------------------

/*
const answers: QuizAnswers = {
  goal: "strength",
  experience: "beginner",
  daysPerWeek: 3,
  sessionDuration: "medium",
  equipment: "minimal",
  prefersAutoregulation: false,
  otherSportsLoad: "none",
  hasInjuryConcerns: false,
};

const top = recommendProgram(answers, allProgramsFromSupabase)[0];
// top.program.name === "Starting Strength"
// top.reasons === [...]
*/
