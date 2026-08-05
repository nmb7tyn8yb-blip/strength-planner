// =====================================================================
//  1RM КАЛКУЛАТОР + ПРИБЛИЗИТЕЛНО НИВО НА СИЛА
//
//  Част 1: Изчисляване на 1RM от тегло+повторения — точна математика,
//          три общоприети формули (Epley, Brzycki, Lombardi), усреднени.
//
//  Част 2: Ниво на сила спрямо телесно тегло — ЯСНО ОБОЗНАЧЕНО КАТО
//          ПРИБЛИЗИТЕЛНО. Истинските "strength standards" (Lon Kilgore,
//          ExRx) са от реални състезателни данни, не формула, и са
//          авторско защитени — тук НЕ ги възпроизвеждаме едно към едно.
//          Вместо това ползваме общоприети закръглени съотношения
//          тегло/собствено тегло, срещани в множество публични
//          източници — ориентир, не прецизно измерване.
// =====================================================================

export type LiftKey = "squat" | "bench_press" | "deadlift" | "overhead_press";
export type Sex = "male" | "female";

// ---------------------------------------------------------------------
// ЧАСТ 1: 1RM от тегло + повторения
// ---------------------------------------------------------------------

export interface OneRepMaxEstimate {
  epley: number;
  brzycki: number;
  lombardi: number;
  average: number;
}

export function estimateOneRepMax(weight: number, reps: number): OneRepMaxEstimate {
  if (reps <= 0 || weight <= 0) {
    return { epley: 0, brzycki: 0, lombardi: 0, average: 0 };
  }
  if (reps === 1) {
    return { epley: weight, brzycki: weight, lombardi: weight, average: weight };
  }

  const epley = weight * (1 + reps / 30);
  const brzycki = weight * (36 / (37 - reps));
  const lombardi = weight * Math.pow(reps, 0.1);
  const average = (epley + brzycki + lombardi) / 3;

  return {
    epley: round(epley),
    brzycki: round(brzycki),
    lombardi: round(lombardi),
    average: round(average),
  };
}

/** Прогнозна тежест за друг брой повторения, изчислена от даден 1RM (обратна Brzycki). */
export function weightForReps(oneRepMax: number, reps: number): number {
  if (reps <= 1) return oneRepMax;
  return round(oneRepMax * ((37 - reps) / 36));
}

export function repMaxTable(oneRepMax: number, maxReps: number = 10): { reps: number; weight: number }[] {
  return Array.from({ length: maxReps }, (_, i) => {
    const reps = i + 1;
    return { reps, weight: weightForReps(oneRepMax, reps) };
  });
}

function round(n: number): number {
  return Math.round(n * 2) / 2; // закръгляне до 0.5 kg
}

// ---------------------------------------------------------------------
// ЧАСТ 2: ПРИБЛИЗИТЕЛНО ниво на сила (не точна класация)
// ---------------------------------------------------------------------

export type StrengthTierIndex = 0 | 1 | 2 | 3 | 4;

// Съотношения (лифт ÷ телесно тегло) — приблизителни, закръглени, ориентир.
// [Стабилен, Як, Звяр, Чудовище, Изрод]
const STRENGTH_RATIOS: Record<LiftKey, Record<Sex, [number, number, number, number]>> = {
  squat: {
    male: [0.75, 1.5, 2.25, 3.0],
    female: [0.5, 1.0, 1.5, 2.0],
  },
  bench_press: {
    male: [0.75, 1.25, 1.75, 2.25],
    female: [0.45, 0.75, 1.05, 1.4],
  },
  deadlift: {
    male: [1.0, 1.75, 2.5, 3.25],
    female: [0.75, 1.3, 1.85, 2.4],
  },
  overhead_press: {
    male: [0.5, 0.75, 1.0, 1.3],
    female: [0.3, 0.45, 0.65, 0.85],
  },
};

export interface StrengthLevelResult {
  ratio: number;
  ageAdjustedRatio: number;
  tierIndex: StrengthTierIndex;
  weightToNextTierKg: number | null;
  boundaries: [number, number, number, number];
}

/**
 * Приблизителна възрастова корекция — след 40г. приема се лек спад в
 * очакваната сила, затова изравняваме съотношението нагоре с ~1%/година
 * над 40, капнато на +30%. Това е груба апроксимация, не медицински факт.
 */
function ageAdjustment(age: number | null): number {
  if (!age || age <= 40) return 1;
  return 1 + Math.min(0.3, (age - 40) * 0.01);
}

export function estimateStrengthLevel(
  lift: LiftKey,
  oneRepMaxKg: number,
  bodyweightKg: number,
  sex: Sex,
  age: number | null = null
): StrengthLevelResult {
  const boundaries = STRENGTH_RATIOS[lift][sex];
  const ratio = oneRepMaxKg / bodyweightKg;
  const ageAdjustedRatio = ratio * ageAdjustment(age);

  let tierIndex = 0;
  for (let i = 0; i < boundaries.length; i++) {
    if (ageAdjustedRatio >= boundaries[i]) tierIndex = i + 1;
  }

  const nextBoundary = tierIndex < boundaries.length ? boundaries[tierIndex] : null;
  const weightToNextTierKg =
    nextBoundary !== null ? round((nextBoundary * bodyweightKg) / ageAdjustment(age) - oneRepMaxKg) : null;

  return { ratio, ageAdjustedRatio, tierIndex: tierIndex as StrengthTierIndex, weightToNextTierKg, boundaries };
}


