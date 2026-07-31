// =====================================================================
//  HEPBURN POWER ROUTINE A — ГЕНЕРАТОР
//
//  Прогресия по схема на повторенията, СЕДМИЧНА (не на всяка тренировка):
//   1x3+7x2 → 2x3+6x2 → ... → 8x3 → +тежест, връщане на 1x3+7x2
//   (класическото 8x2 не е част от реалната прогресия — потвърдено)
//
//  Работи ПЕР УПРАЖНЕНИЕ (клек / лежанка / мъртва тяга / преса) —
//  композицията коя тренировка кои упражнения включва се решава на
//  по-високо ниво (session_exercises в БД), точно както при SS движока.
// =====================================================================

export type HepburnLift = "squat" | "bench_press" | "deadlift" | "overhead_press";

export interface HepburnSettings {
  roundingIncrementKg: number;
  barWeightKg: number;
  failureThreshold: number;     // 2 или 3 поредни неуспеха → предложение за намаляване (по подразбиране 3)
}

// По подразбиране: ~2.5 kg за лежанка/преса, ~5 kg за клек/тяга
// (оригиналното увеличение на Hepburn е ~4.5 kg общо, но по твое
//  указание разделяме на практичните стъпки на приложението)
export const DEFAULT_HEPBURN_INCREMENTS_KG: Record<HepburnLift, number> = {
  bench_press: 2.5,
  overhead_press: 2.5,
  squat: 5,
  deadlift: 5,
};

export interface HepburnLiftState {
  workingWeightKg: number;
  schemeIndex: number;          // 1 = 1x3+7x2 ... 8 = 8x3 (0=8x2 не се използва в реалната прогресия)
  consecutiveFailures: number;
}

export interface HepburnSetPlan {
  weightKg: number;
  reps: number;
}

// ---------------------------------------------------------------------
// Схема на сериите: schemeIndex n → n серии по 3 повторения + (8-n) серии по 2
// ---------------------------------------------------------------------

export function schemeForIndex(schemeIndex: number): { reps: number }[] {
  const threes = schemeIndex;      // 0..8
  const twos = 8 - schemeIndex;
  return [
    ...Array.from({ length: threes }, () => ({ reps: 3 })),
    ...Array.from({ length: twos }, () => ({ reps: 2 })),
  ];
}

export function schemeLabel(schemeIndex: number): string {
  if (schemeIndex === 0) return "8×2";
  if (schemeIndex === 8) return "8×3";
  return `${schemeIndex}×3 + ${8 - schemeIndex}×2`;
}

// ---------------------------------------------------------------------
// Загряване — точната формула от спецификацията: 25% / 50% / 75% / 87% от работната тежест
// ---------------------------------------------------------------------

export function generateHepburnWarmup(
  workWeightKg: number,
  settings: HepburnSettings
): HepburnSetPlan[] {
  const steps = [
    { pct: 0.25, reps: 20 },
    { pct: 0.5, reps: 10 },
    { pct: 0.75, reps: 5 },
    { pct: 0.87, reps: 3 },
  ];
  return steps.map(({ pct, reps }) => ({
    weightKg: Math.max(
      settings.barWeightKg,
      Math.round((workWeightKg * pct) / settings.roundingIncrementKg) * settings.roundingIncrementKg
    ),
    reps,
  }));
}

// ---------------------------------------------------------------------
// Начално състояние
//   ВАЖНО: прогресията тръгва от 1×3+7×2 (schemeIndex = 1), НЕ от чисто
//   8×2 (schemeIndex = 0) — потвърдено от потребителя. Прогресията е
//   СЕДМИЧНА: една и съща схема се повтаря през цялата седмица (при
//   класическото разписание — 2 пъти седмично на движение), и напредва
//   само веднъж, след успешно приключена седмица, не след всяка сесия.
// ---------------------------------------------------------------------

export function initHepburnLiftState(workingWeightKg: number): HepburnLiftState {
  return { workingWeightKg, schemeIndex: 1, consecutiveFailures: 0 };
}

export function planHepburnLift(state: HepburnLiftState): HepburnSetPlan[] {
  return schemeForIndex(state.schemeIndex).map((s) => ({
    weightKg: state.workingWeightKg,
    reps: s.reps,
  }));
}

// ---------------------------------------------------------------------
// Резултат → ново състояние
//   Успех (всички серии изпълнени с предписаните повторения):
//     - ако schemeIndex < 8 → напредва с 1 стъпка нагоре
//     - ако schemeIndex === 8 → добавя тежест, връща schemeIndex на 0
//   Неуспех: тежест и схема остават същите; consecutiveFailures++.
//     Три поредни неуспеха → needsUserDecision = true (НЕ автоматична
//     промяна — потребителят потвърждава решението, съгласно т.8).
// ---------------------------------------------------------------------

export interface HepburnResult {
  newState: HepburnLiftState;
  needsUserDecision: boolean;
}

export function applyHepburnResult(
  state: HepburnLiftState,
  allSetsCompleted: boolean,
  lift: HepburnLift,
  settings: HepburnSettings,
  weightIncrementKg: number = DEFAULT_HEPBURN_INCREMENTS_KG[lift]
): HepburnResult {
  if (allSetsCompleted) {
    if (state.schemeIndex >= 8) {
      return {
        newState: {
          workingWeightKg:
            Math.round((state.workingWeightKg + weightIncrementKg) / settings.roundingIncrementKg) *
            settings.roundingIncrementKg,
          schemeIndex: 1,
          consecutiveFailures: 0,
        },
        needsUserDecision: false,
      };
    }
    return {
      newState: {
        ...state,
        schemeIndex: state.schemeIndex + 1,
        consecutiveFailures: 0,
      },
      needsUserDecision: false,
    };
  }

  const failures = state.consecutiveFailures + 1;
  return {
    newState: { ...state, consecutiveFailures: failures },
    needsUserDecision: failures >= settings.failureThreshold, // предлага се намаляване, но потребителят потвърждава
  };
}
