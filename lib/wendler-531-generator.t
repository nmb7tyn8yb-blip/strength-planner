// =====================================================================
//  WENDLER 5/3/1 — ГЕНЕРАТОР
//
//  4-седмичен цикъл на тренировъчния максимум (TM), общоизвестна
//  публична формула:
//   Седмица 1 (5s):   65% x5, 75% x5, 85% x5+ (AMRAP)
//   Седмица 2 (3s):   70% x3, 80% x3, 90% x3+ (AMRAP)
//   Седмица 3 (5/3/1): 75% x5, 85% x3, 95% x1+ (AMRAP)
//   Седмица 4 (deload): 40% x5, 50% x5, 60% x5 (без AMRAP)
//  След седмица 4 → TM се увеличава, цикълът се връща на седмица 1.
// =====================================================================

export type WendlerLift = "squat" | "bench_press" | "deadlift" | "overhead_press";

export interface WendlerSettings {
  roundingIncrementKg: number;
  tmIncreaseUpperKg: number; // по подразбиране 2.5 — бенч/преса
  tmIncreaseLowerKg: number; // по подразбиране 5   — клек/тяга
  trainingMaxPercentOf1RM: number; // по подразбиране 0.9
}

export interface WendlerState {
  cycleNumber: number;
  weekNumber: 1 | 2 | 3 | 4;
  trainingMaxKg: Record<WendlerLift, number>;
}

export interface WendlerSetPlan {
  pct: number;
  weightKg: number;
  reps: number;
  isAmrap: boolean;
}

const WEEK_SCHEMES: Record<1 | 2 | 3 | 4, { pct: number; reps: number; isAmrap: boolean }[]> = {
  1: [
    { pct: 0.65, reps: 5, isAmrap: false },
    { pct: 0.75, reps: 5, isAmrap: false },
    { pct: 0.85, reps: 5, isAmrap: true },
  ],
  2: [
    { pct: 0.7, reps: 3, isAmrap: false },
    { pct: 0.8, reps: 3, isAmrap: false },
    { pct: 0.9, reps: 3, isAmrap: true },
  ],
  3: [
    { pct: 0.75, reps: 5, isAmrap: false },
    { pct: 0.85, reps: 3, isAmrap: false },
    { pct: 0.95, reps: 1, isAmrap: true },
  ],
  4: [
    { pct: 0.4, reps: 5, isAmrap: false },
    { pct: 0.5, reps: 5, isAmrap: false },
    { pct: 0.6, reps: 5, isAmrap: false },
  ],
};

const LOWER_BODY: WendlerLift[] = ["squat", "deadlift"];

function roundToIncrement(weightKg: number, incrementKg: number): number {
  return Math.round(weightKg / incrementKg) * incrementKg;
}

// ---------------------------------------------------------------------
// Тренировъчен максимум от реален 1RM
// ---------------------------------------------------------------------

export function calculateTrainingMax(
  oneRepMaxKg: number,
  settings: WendlerSettings,
  roundingIncrementKg: number
): number {
  return roundToIncrement(oneRepMaxKg * settings.trainingMaxPercentOf1RM, roundingIncrementKg);
}

// ---------------------------------------------------------------------
// Планиране на седмицата за даден lift
// ---------------------------------------------------------------------

export function planWendlerLift(
  lift: WendlerLift,
  state: WendlerState,
  settings: WendlerSettings
): WendlerSetPlan[] {
  const tm = state.trainingMaxKg[lift];
  return WEEK_SCHEMES[state.weekNumber].map((step) => ({
    pct: step.pct,
    weightKg: roundToIncrement(tm * step.pct, settings.roundingIncrementKg),
    reps: step.reps,
    isAmrap: step.isAmrap,
  }));
}

// ---------------------------------------------------------------------
// Преход към следваща седмица / нов цикъл с увеличение на TM
// ---------------------------------------------------------------------

export function advanceWendlerWeek(
  state: WendlerState,
  settings: WendlerSettings
): WendlerState {
  if (state.weekNumber < 4) {
    return { ...state, weekNumber: (state.weekNumber + 1) as 1 | 2 | 3 | 4 };
  }

  // край на deload седмицата → увеличение на TM за всички lift-ове, нов цикъл
  const newTm: Record<WendlerLift, number> = { ...state.trainingMaxKg };
  (Object.keys(newTm) as WendlerLift[]).forEach((lift) => {
    const increase = LOWER_BODY.includes(lift) ? settings.tmIncreaseLowerKg : settings.tmIncreaseUpperKg;
    newTm[lift] = roundToIncrement(newTm[lift] + increase, settings.roundingIncrementKg);
  });

  return {
    cycleNumber: state.cycleNumber + 1,
    weekNumber: 1,
    trainingMaxKg: newTm,
  };
}

// ---------------------------------------------------------------------
// Начално състояние
// ---------------------------------------------------------------------

export function initWendlerState(
  oneRepMaxesKg: Record<WendlerLift, number>,
  settings: WendlerSettings
): WendlerState {
  const roundingIncrementKg = settings.roundingIncrementKg;
  const trainingMaxKg = Object.fromEntries(
    (Object.keys(oneRepMaxesKg) as WendlerLift[]).map((lift) => [
      lift,
      calculateTrainingMax(oneRepMaxesKg[lift], settings, roundingIncrementKg),
    ])
  ) as Record<WendlerLift, number>;

  return { cycleNumber: 1, weekNumber: 1, trainingMaxKg };
}
