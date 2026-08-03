// =====================================================================
//  TEXAS METHOD — ГЕНЕРАТОР (коригиран по точните данни)
//
//  Понеделник (обем):        Клек 5x5, тежкия lift на седмицата 5x5,
//                             Мъртва тяга 1x5 (собствена седмична прогресия)
//  Сряда (възстановяване):   Клек 2x5 @80% от понеделник, лекия lift 3x5
//  Петък (интензивност):     Клек 1x5 нов PR, тежкия lift 1x5 нов PR
//                             (БЕЗ мъртва тяга — тя е само в понеделник)
//
//  Седмица A: тежък lift = Лежанка (сряда лек = Военна преса)
//  Седмица B: тежък lift = Военна преса (сряда лек = Лежанка)
// =====================================================================

export type TexasUpperLift = "bench_press" | "overhead_press";

export interface TexasMethodSettings {
  roundingIncrementKg: number;
  volumeDayPercentOfFriday: number;    // ~0.90
  recoveryDayPercentOfMonday: number;  // ~0.80
  fridayIncrementUpperKg: number;      // 1–2.5
  fridayIncrementSquatKg: number;      // 2.5
  deadliftWeeklyIncrementKg: number;   // 2.5–5
}

export interface TexasMethodState {
  weekNumber: number;
  upperLiftThisWeek: TexasUpperLift;         // тежкият lift тази седмица (пон + пет)
  lastFridaySquatKg: number;                  // последно постигнатата петъчна тежест на клека
  lastHeavyUpperKg: Record<TexasUpperLift, number>; // последно постигнатата тежка стойност на бенч/преса
  currentDeadliftKg: number;                  // работна тежест за понеделнишката тяга
}

export interface TexasSetPlan {
  weightKg: number;
  reps: number;
  isPrAttempt: boolean;
}

function roundToIncrement(weightKg: number, incrementKg: number): number {
  return Math.round(weightKg / incrementKg) * incrementKg;
}

function lightLiftOf(heavy: TexasUpperLift): TexasUpperLift {
  return heavy === "bench_press" ? "overhead_press" : "bench_press";
}

// ---------------------------------------------------------------------
// Начално състояние
// ---------------------------------------------------------------------

export function initTexasMethodState(startingWeightsKg: {
  squat: number;
  benchPress: number;
  overheadPress: number;
  deadlift: number;
}): TexasMethodState {
  return {
    weekNumber: 1,
    upperLiftThisWeek: "bench_press",
    lastFridaySquatKg: startingWeightsKg.squat,
    lastHeavyUpperKg: {
      bench_press: startingWeightsKg.benchPress,
      overhead_press: startingWeightsKg.overheadPress,
    },
    currentDeadliftKg: startingWeightsKg.deadlift,
  };
}

// ---------------------------------------------------------------------
// Понеделник — обемен ден (Клек 5x5, тежък lift 5x5, Тяга 1x5)
// ---------------------------------------------------------------------

export function planVolumeDay(
  state: TexasMethodState,
  settings: TexasMethodSettings
): {
  squat: TexasSetPlan[];
  heavyUpperLift: { lift: TexasUpperLift; sets: TexasSetPlan[] };
  deadlift: TexasSetPlan;
} {
  const squatWeight = roundToIncrement(
    state.lastFridaySquatKg * settings.volumeDayPercentOfFriday,
    settings.roundingIncrementKg
  );
  const upperWeight = roundToIncrement(
    state.lastHeavyUpperKg[state.upperLiftThisWeek] * settings.volumeDayPercentOfFriday,
    settings.roundingIncrementKg
  );

  return {
    squat: Array.from({ length: 5 }, () => ({ weightKg: squatWeight, reps: 5, isPrAttempt: false })),
    heavyUpperLift: {
      lift: state.upperLiftThisWeek,
      sets: Array.from({ length: 5 }, () => ({ weightKg: upperWeight, reps: 5, isPrAttempt: false })),
    },
    deadlift: { weightKg: state.currentDeadliftKg, reps: 5, isPrAttempt: false },
  };
}

// ---------------------------------------------------------------------
// Сряда — възстановителен ден (Клек 2x5 @80% от понеделник, лек lift 3x5)
// ---------------------------------------------------------------------

export function planRecoveryDay(
  state: TexasMethodState,
  settings: TexasMethodSettings
): { squat: TexasSetPlan[]; lightUpperLift: { lift: TexasUpperLift; sets: TexasSetPlan[] } } {
  const mondaySquat = state.lastFridaySquatKg * settings.volumeDayPercentOfFriday;
  const recoverySquat = roundToIncrement(mondaySquat * settings.recoveryDayPercentOfMonday, settings.roundingIncrementKg);

  const lightLift = lightLiftOf(state.upperLiftThisWeek);
  // "умерена" тежест — приложението приема ~80% от последната тежка стойност на този lift
  // (оригиналът не задава точна формула тук — маркирано като препоръка на приложението)
  const lightWeight = roundToIncrement(
    state.lastHeavyUpperKg[lightLift] * settings.recoveryDayPercentOfMonday,
    settings.roundingIncrementKg
  );

  return {
    squat: Array.from({ length: 2 }, () => ({ weightKg: recoverySquat, reps: 5, isPrAttempt: false })),
    lightUpperLift: {
      lift: lightLift,
      sets: Array.from({ length: 3 }, () => ({ weightKg: lightWeight, reps: 3, isPrAttempt: false })),
    },
  };
}

// ---------------------------------------------------------------------
// Петък — интензивен ден (Клек 1x5 нов PR, тежък lift 1x5 нов PR)
// Accessory: Обръщане 5x3 или изхвърляне от вис 6x2 — само текст, не се
// изчислява тежест автоматично (потребителят въвежда собствена).
// ---------------------------------------------------------------------

export function planIntensityDay(
  state: TexasMethodState,
  settings: TexasMethodSettings
): { squat: TexasSetPlan; upperLift: { lift: TexasUpperLift; set: TexasSetPlan } } {
  return {
    squat: {
      weightKg: roundToIncrement(state.lastFridaySquatKg + settings.fridayIncrementSquatKg, settings.roundingIncrementKg),
      reps: 5,
      isPrAttempt: true,
    },
    upperLift: {
      lift: state.upperLiftThisWeek,
      set: {
        weightKg: roundToIncrement(
          state.lastHeavyUpperKg[state.upperLiftThisWeek] + settings.fridayIncrementUpperKg,
          settings.roundingIncrementKg
        ),
        reps: 5,
        isPrAttempt: true,
      },
    },
  };
}

// ---------------------------------------------------------------------
// Резултат от понеделнишката тяга → нова тежест за СЛЕДВАЩИЯ понеделник
//   (собствена линейна прогресия, независима от петъчния тест)
// ---------------------------------------------------------------------

export function applyDeadliftResult(
  state: TexasMethodState,
  achieved: boolean,
  settings: TexasMethodSettings
): TexasMethodState {
  return {
    ...state,
    currentDeadliftKg: achieved
      ? roundToIncrement(state.currentDeadliftKg + settings.deadliftWeeklyIncrementKg, settings.roundingIncrementKg)
      : state.currentDeadliftKg,
  };
}

// ---------------------------------------------------------------------
// Резултат от петъчния ден → ново състояние, преход към следваща седмица
//   PR постигнат → пази се новата тежест;
//   PR пропуснат → тежестта остава (потребителят решава дали да опита пак
//   или да намали, съгласно т.8 — без автоматична промяна на методиката).
// ---------------------------------------------------------------------

export function applyIntensityDayResult(
  state: TexasMethodState,
  results: { squatAchieved: boolean; upperLiftAchieved: boolean },
  attemptedWeights: { squat: number; upperLift: number }
): TexasMethodState {
  return {
    weekNumber: state.weekNumber + 1,
    upperLiftThisWeek: lightLiftOf(state.upperLiftThisWeek),
    lastFridaySquatKg: results.squatAchieved ? attemptedWeights.squat : state.lastFridaySquatKg,
    lastHeavyUpperKg: {
      ...state.lastHeavyUpperKg,
      [state.upperLiftThisWeek]: results.upperLiftAchieved
        ? attemptedWeights.upperLift
        : state.lastHeavyUpperKg[state.upperLiftThisWeek],
    },
    currentDeadliftKg: state.currentDeadliftKg, // не се пипа тук — вижте applyDeadliftResult
  };
}
