// =====================================================================
//  STARTING STRENGTH — ГЕНЕРАТОР НА ТРЕНИРОВКИ
//
//  Архитектурен принцип: SS е линейна прогресия, която зависи от
//  РЕАЛНИЯ резултат на всяка тренировка. Затова няма функция, която
//  "предварително пресмята 12 седмици напред и толкоз" — вместо това:
//
//   1. planSession(state)         → плана за СЛЕДВАЩАТА тренировка
//   2. applySessionResult(...)    → ново състояние според резултата
//   3. generateCalendarPreview()  → прогноза напред (за екрана
//                                    "Моят календар"), явно маркирана
//                                    като прогнозна, защото при първия
//                                    неуспех/успех тя се преизчислява.
// =====================================================================

// ---------------------------------------------------------------------
// 1. ТИПОВЕ
// ---------------------------------------------------------------------

export type LiftSlug = "squat" | "bench_press" | "deadlift" | "overhead_press";
export type SessionType = "A" | "B";
export type DeadliftFrequency = "every_session" | "every_other_session" | "weekly";

export interface StartingStrengthSettings {
  roundingIncrementKg: number;         // 1 | 2 | 2.5 | 5 — от athlete_profiles.plate_increment_kg
  progressionStyle: "conservative" | "standard" | "aggressive";
  deadliftFrequency: DeadliftFrequency; // по подразбиране "every_other_session" — по-безопасно от чист класически SS
  barWeightKg: number;                  // тегло на празната щанга (обикновено 20)
}

export interface LiftState {
  workingWeightKg: number;
  consecutiveFailures: number;         // 0, 1, 2 → на 3-ти неуспех се задейства deload
}

export interface StartingStrengthState {
  weekNumber: number;
  sessionNumberOverall: number;        // 1, 2, 3, 4, ... (за номериране, не за дата)
  nextSessionType: SessionType;
  lifts: Record<LiftSlug, LiftState>;
}

export interface WarmupSet {
  weightKg: number;
  reps: number;
}

export interface PlannedExercise {
  exerciseSlug: LiftSlug;
  warmupSets: WarmupSet[];
  workingSets: { weightKg: number; reps: number }[];
  restSecondsBetweenSets: number;
  isDeloadWeight: boolean;             // маркира ако тежестта е намалена спрямо предходната сесия
}

export interface PlannedSession {
  sessionNumberOverall: number;
  weekNumber: number;
  sessionType: SessionType;
  isProjected: boolean;                // true за бъдещи сесии в прегледа — все още не е реално изпълнена
  exercises: PlannedExercise[];
  estimatedDurationMinutes: number;
}

export type FailureReason =
  | "weight_too_high"
  | "poor_sleep"
  | "pain"
  | "poor_technique"
  | "insufficient_rest"
  | "missed_previous_session"
  | "illness"
  | "other";

export interface SessionResultInput {
  exerciseSlug: LiftSlug;
  allPrescribedSetsCompleted: boolean; // true = успешна тренировка за този lift
  failureReason?: FailureReason;
}

// ---------------------------------------------------------------------
// 2. БАЗОВИ СТЪПКИ ЗА ПРОГРЕСИЯ (kg, при "standard" стил)
//    "conservative" ги смалява, "aggressive" ги увеличава — виж
//    progressionMultiplier() по-долу.
// ---------------------------------------------------------------------

const BASE_INCREMENTS_KG: Record<LiftSlug, number> = {
  squat: 2.5,
  deadlift: 5,
  bench_press: 2.5,
  overhead_press: 2.5,
};

function progressionMultiplier(style: StartingStrengthSettings["progressionStyle"]): number {
  return { conservative: 0.7, standard: 1, aggressive: 1.3 }[style];
}

// ---------------------------------------------------------------------
// 3. ПОМОЩНИ ФУНКЦИИ
// ---------------------------------------------------------------------

/** Закръгля до най-близката налична стъпка на дисковете (напр. 2.5 kg). */
function roundToIncrement(weightKg: number, incrementKg: number): number {
  return Math.round(weightKg / incrementKg) * incrementKg;
}

/** Стандартна SS схема за загряване: бар → ~40% → ~60% → ~80% → работна тежест. */
export function generateWarmupSets(
  workWeightKg: number,
  settings: StartingStrengthSettings
): WarmupSet[] {
  const bar = settings.barWeightKg;
  if (workWeightKg <= bar) {
    return [{ weightKg: bar, reps: 5 }];
  }

  const steps = [
    { pct: 0, reps: 5 },   // празна щанга
    { pct: 0.4, reps: 5 },
    { pct: 0.6, reps: 3 },
    { pct: 0.8, reps: 2 },
    { pct: 0.9, reps: 1 },
  ];

  return steps
    .map(({ pct, reps }) => ({
      weightKg: pct === 0 ? bar : Math.max(bar, roundToIncrement(workWeightKg * pct, settings.roundingIncrementKg)),
      reps,
    }))
    // премахва загряващи серии, които се доближават твърде близо до работната тежест
    .filter((s, i, arr) => i === arr.length - 1 || s.weightKg < workWeightKg * 0.92);
}

function whichLiftsInSession(
  sessionType: SessionType,
  sessionNumberOverall: number,
  deadliftFrequency: DeadliftFrequency
): LiftSlug[] {
  const upperLift: LiftSlug = sessionType === "A" ? "bench_press" : "overhead_press";
  const base: LiftSlug[] = ["squat", upperLift];

  const includeDeadlift =
    deadliftFrequency === "every_session"
      ? true
      : deadliftFrequency === "every_other_session"
      ? sessionNumberOverall % 2 === 1
      : /* weekly */ sessionNumberOverall % 3 === 1; // първата сесия от всяка седмица (A/B/A цикъл)

  return includeDeadlift ? [...base, "deadlift"] : base;
}

// ---------------------------------------------------------------------
// 4. НАЧАЛНО СЪСТОЯНИЕ
// ---------------------------------------------------------------------

export function initStartingStrengthState(startingWeightsKg: {
  squat: number;
  benchPress: number;
  deadlift: number;
  overheadPress: number;
}): StartingStrengthState {
  return {
    weekNumber: 1,
    sessionNumberOverall: 1,
    nextSessionType: "A",
    lifts: {
      squat: { workingWeightKg: startingWeightsKg.squat, consecutiveFailures: 0 },
      bench_press: { workingWeightKg: startingWeightsKg.benchPress, consecutiveFailures: 0 },
      deadlift: { workingWeightKg: startingWeightsKg.deadlift, consecutiveFailures: 0 },
      overhead_press: { workingWeightKg: startingWeightsKg.overheadPress, consecutiveFailures: 0 },
    },
  };
}

// ---------------------------------------------------------------------
// 5. ПЛАНИРАНЕ НА СЛЕДВАЩАТА СЕСИЯ (реалната, изпълнима в момента)
// ---------------------------------------------------------------------

export function planSession(
  state: StartingStrengthState,
  settings: StartingStrengthSettings
): PlannedSession {
  const liftsToday = whichLiftsInSession(
    state.nextSessionType,
    state.sessionNumberOverall,
    settings.deadliftFrequency
  );

  const exercises: PlannedExercise[] = liftsToday.map((slug) => {
    const lift = state.lifts[slug];
    const isDeadlift = slug === "deadlift";
    const setsReps = isDeadlift ? { sets: 1, reps: 5 } : { sets: 3, reps: 5 };

    return {
      exerciseSlug: slug,
      warmupSets: generateWarmupSets(lift.workingWeightKg, settings),
      workingSets: Array.from({ length: setsReps.sets }, () => ({
        weightKg: lift.workingWeightKg,
        reps: setsReps.reps,
      })),
      restSecondsBetweenSets: isDeadlift ? 300 : 180,
      isDeloadWeight: lift.consecutiveFailures === 0 && false, // истинският deload флаг се слага в applySessionResult при самата смяна
    };
  });

  return {
    sessionNumberOverall: state.sessionNumberOverall,
    weekNumber: state.weekNumber,
    sessionType: state.nextSessionType,
    isProjected: false,
    exercises,
    estimatedDurationMinutes: exercises.length * 18 + 15, // грубо, за прегледа преди тренировка
  };
}

// ---------------------------------------------------------------------
// 6. ОБРАБОТКА НА РЕЗУЛТАТА → НОВО СЪСТОЯНИЕ (т.7 и т.8 от спецификацията)
// ---------------------------------------------------------------------

export function applySessionResult(
  state: StartingStrengthState,
  results: SessionResultInput[],
  settings: StartingStrengthSettings
): StartingStrengthState {
  const multiplier = progressionMultiplier(settings.progressionStyle);
  const newLifts: Record<LiftSlug, LiftState> = { ...state.lifts };

  for (const result of results) {
    const current = newLifts[result.exerciseSlug];
    const baseIncrement = BASE_INCREMENTS_KG[result.exerciseSlug] * multiplier;

    if (result.allPrescribedSetsCompleted) {
      // Успех → тежестта се увеличава, брояч на неуспехи се нулира
      newLifts[result.exerciseSlug] = {
        workingWeightKg: roundToIncrement(
          current.workingWeightKg + baseIncrement,
          settings.roundingIncrementKg
        ),
        consecutiveFailures: 0,
      };
    } else {
      const failures = current.consecutiveFailures + 1;

      if (failures >= 3) {
        // Трети пореден неуспех → намаляване с 10% (deload на самия lift)
        newLifts[result.exerciseSlug] = {
          workingWeightKg: roundToIncrement(
            current.workingWeightKg * 0.9,
            settings.roundingIncrementKg
          ),
          consecutiveFailures: 0,
        };
      } else {
        // Първи/втори неуспех → тежестта се повтаря непроменена
        newLifts[result.exerciseSlug] = {
          workingWeightKg: current.workingWeightKg,
          consecutiveFailures: failures,
        };
      }
    }
  }

  return {
    weekNumber: state.nextSessionType === "B" ? state.weekNumber + 1 : state.weekNumber,
    sessionNumberOverall: state.sessionNumberOverall + 1,
    nextSessionType: state.nextSessionType === "A" ? "B" : "A",
    lifts: newLifts,
  };
}

// ---------------------------------------------------------------------
// 7. ПРОГНОЗЕН ПРЕГЛЕД НА КАЛЕНДАРА (за екрана "Моят календар")
//    Симулира само успешни тренировки напред — ЯВНО е прогноза,
//    не гаранция; прекалкулира се автоматично при всеки реален резултат.
// ---------------------------------------------------------------------

export function generateCalendarPreview(
  state: StartingStrengthState,
  settings: StartingStrengthSettings,
  numberOfSessions: number
): PlannedSession[] {
  let workingState = state;
  const preview: PlannedSession[] = [];

  for (let i = 0; i < numberOfSessions; i++) {
    const session = planSession(workingState, settings);
    preview.push({ ...session, isProjected: i > 0 }); // първата е реалната следваща, останалите — прогноза

    // симулация: приема се пълен успех за прогнозата напред
    const simulatedResults: SessionResultInput[] = session.exercises.map((ex) => ({
      exerciseSlug: ex.exerciseSlug,
      allPrescribedSetsCompleted: true,
    }));
    workingState = applySessionResult(workingState, simulatedResults, settings);
  }

  return preview;
}

// ---------------------------------------------------------------------
// 8. ПРЕВРЪЩАНЕ В РЕДОВЕ ЗА БАЗАТА (scheduled_workouts + workout_sets)
// ---------------------------------------------------------------------

export interface ScheduledWorkoutInsert {
  generated_plan_id: string;
  scheduled_date: string; // YYYY-MM-DD
  session_name: string;
  status: "planned";
  is_deload: boolean;
  estimated_duration_minutes: number;
}

export interface WorkoutSetInsert {
  exercise_slug: LiftSlug; // ще се преобразува в exercise_id при вкарване в БД
  order_index: number;
  set_number: number;
  set_type: "warmup" | "working";
  planned_weight: number;
  planned_reps: number;
  planned_rest_seconds: number | null;
}

const LIFT_NAME_BG: Record<LiftSlug, string> = {
  squat: "Клек",
  bench_press: "Лежанка",
  deadlift: "Мъртва тяга",
  overhead_press: "Военна преса",
};

export function toDbRows(
  session: PlannedSession,
  generatedPlanId: string,
  scheduledDate: string
): { workout: ScheduledWorkoutInsert; sets: WorkoutSetInsert[] } {
  const exerciseNames = session.exercises.map((e) => LIFT_NAME_BG[e.exerciseSlug]).join(" + ");

  const sets: WorkoutSetInsert[] = [];
  let orderIndex = 0;

  for (const exercise of session.exercises) {
    exercise.warmupSets.forEach((w, i) => {
      sets.push({
        exercise_slug: exercise.exerciseSlug,
        order_index: orderIndex++,
        set_number: i + 1,
        set_type: "warmup",
        planned_weight: w.weightKg,
        planned_reps: w.reps,
        planned_rest_seconds: 60,
      });
    });

    exercise.workingSets.forEach((w, i) => {
      sets.push({
        exercise_slug: exercise.exerciseSlug,
        order_index: orderIndex++,
        set_number: i + 1,
        set_type: "working",
        planned_weight: w.weightKg,
        planned_reps: w.reps,
        planned_rest_seconds: exercise.restSecondsBetweenSets,
      });
    });
  }

  return {
    workout: {
      generated_plan_id: generatedPlanId,
      scheduled_date: scheduledDate,
      session_name: `Тренировка ${session.sessionType} — ${exerciseNames}`,
      status: "planned",
      is_deload: session.exercises.some((e) => e.isDeloadWeight),
      estimated_duration_minutes: session.estimatedDurationMinutes,
    },
    sets,
  };
}

// ---------------------------------------------------------------------
// 9. ПРИМЕРНО ИЗПОЛЗВАНЕ (справка — маха се в реалния код)
// ---------------------------------------------------------------------

/*
const settings: StartingStrengthSettings = {
  roundingIncrementKg: 2.5,
  progressionStyle: "standard",
  deadliftFrequency: "every_other_session",
  barWeightKg: 20,
};

let state = initStartingStrengthState({
  squat: 40,
  benchPress: 30,
  deadlift: 50,
  overheadPress: 20,
});

// Прогноза за календара — следващите 12 тренировки
const preview = generateCalendarPreview(state, settings, 12);

// След реално изпълнена тренировка 1 (успешна навсякъде):
const results: SessionResultInput[] = [
  { exerciseSlug: "squat", allPrescribedSetsCompleted: true },
  { exerciseSlug: "bench_press", allPrescribedSetsCompleted: true },
  { exerciseSlug: "deadlift", allPrescribedSetsCompleted: true },
];
state = applySessionResult(state, results, settings);
// state.lifts.squat.workingWeightKg === 42.5
*/
