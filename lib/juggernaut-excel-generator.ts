// =====================================================================
//  JUGGERNAUT (EXCEL ВАРИАНТ) — 12 седмици
//  Кодиран точно по стойностите от Juggernaut_Calculator_BG_v2.xlsx
//  (листове "Percents (Edit)" и "Settings"). Различен от класическия
//  16-седмичен вариант — пази се като ОТДЕЛНА програма в каталога.
// =====================================================================

export type JuggernautLift = "squat" | "bench_press" | "deadlift" | "overhead_press";

export interface JuggernautExcelSettings {
  roundingIncrementKg: number;         // 2.5 по подразбиране (от Settings листа)
  trainingMaxPercentOf1RM: number;     // 0.90
  upperBumpMeetGoalKg: number;         // 2.5
  upperBumpExceedBy5Kg: number;        // 5
  lowerBumpMeetGoalKg: number;         // 5
  lowerBumpExceedBy5Kg: number;        // 10
  amrapGoalReps: { "10s": number; "8s": number; "5s": number; "3s": number }; // 10/8/5/3
}

export const DEFAULT_JUGGERNAUT_EXCEL_SETTINGS: JuggernautExcelSettings = {
  roundingIncrementKg: 2.5,
  trainingMaxPercentOf1RM: 0.9,
  upperBumpMeetGoalKg: 2.5,
  upperBumpExceedBy5Kg: 5,
  lowerBumpMeetGoalKg: 5,
  lowerBumpExceedBy5Kg: 10,
  amrapGoalReps: { "10s": 10, "8s": 8, "5s": 5, "3s": 3 },
};

export type WaveName = "10s" | "8s" | "5s" | "3s";
export type WeekInWave = 1 | 2 | 3;

export interface JuggernautExcelState {
  waveIndex: number; // 0=10s,1=8s,2=5s,3=3s
  weekInWave: WeekInWave;
  tmKg: Record<JuggernautLift, number>;
}

export interface JuggernautExcelSetPlan {
  pct: number;
  weightKg: number;
  reps: number;
  isAmrap: boolean;
}

const WAVE_ORDER: WaveName[] = ["10s", "8s", "5s", "3s"];

// Точно по "Percents (Edit)" листа от Excel файла
const WAVE_TABLE: Record<WaveName, { pct: number; sets: number; reps: number; isAmrap: boolean }[]> = {
  "10s": [
    { pct: 0.6, sets: 5, reps: 10, isAmrap: false },
    { pct: 0.65, sets: 6, reps: 8, isAmrap: false },
    { pct: 0.7, sets: 7, reps: 5, isAmrap: true },
  ],
  "8s": [
    { pct: 0.65, sets: 5, reps: 8, isAmrap: false },
    { pct: 0.7, sets: 6, reps: 6, isAmrap: false },
    { pct: 0.75, sets: 7, reps: 5, isAmrap: true },
  ],
  "5s": [
    { pct: 0.7, sets: 5, reps: 5, isAmrap: false },
    { pct: 0.75, sets: 6, reps: 3, isAmrap: false },
    { pct: 0.8, sets: 7, reps: 3, isAmrap: true },
  ],
  "3s": [
    { pct: 0.75, sets: 5, reps: 3, isAmrap: false },
    { pct: 0.8, sets: 6, reps: 2, isAmrap: false },
    { pct: 0.85, sets: 7, reps: 1, isAmrap: true },
  ],
};

// Deload темплейт — по "Deload" листа (изпълнява се ръчно между вълните,
// не е "седмица" в основната таблица)
export const JUGGERNAUT_EXCEL_DELOAD: Record<WaveName, { sets: number; reps: number; pctOfOldTm: number } | "test_reset"> = {
  "10s": { sets: 3, reps: 5, pctOfOldTm: 0.6 },
  "8s": { sets: 2, reps: 5, pctOfOldTm: 0.6 },
  "5s": { sets: 2, reps: 3, pctOfOldTm: 0.6 },
  "3s": "test_reset", // след 3s вълната: тест за нов 1RM / рестарт на макроцикъла
};

const LOWER_BODY: JuggernautLift[] = ["squat", "deadlift"];

function roundToIncrement(weightKg: number, incrementKg: number): number {
  return Math.round(weightKg / incrementKg) * incrementKg;
}

// ---------------------------------------------------------------------
// Начално състояние
// ---------------------------------------------------------------------

export function initJuggernautExcelState(
  oneRepMaxesKg: Record<JuggernautLift, number>,
  settings: JuggernautExcelSettings
): JuggernautExcelState {
  const tmKg = Object.fromEntries(
    (Object.keys(oneRepMaxesKg) as JuggernautLift[]).map((lift) => [
      lift,
      oneRepMaxesKg[lift] * settings.trainingMaxPercentOf1RM,
    ])
  ) as Record<JuggernautLift, number>;

  return { waveIndex: 0, weekInWave: 1, tmKg };
}

// ---------------------------------------------------------------------
// Планиране на седмицата
// ---------------------------------------------------------------------

export function planJuggernautExcelWeek(
  lift: JuggernautLift,
  state: JuggernautExcelState,
  settings: JuggernautExcelSettings
): JuggernautExcelSetPlan[] {
  const wave = WAVE_ORDER[state.waveIndex];
  const weekPlan = WAVE_TABLE[wave][state.weekInWave - 1];
  const tm = state.tmKg[lift];

  return Array.from({ length: weekPlan.sets }, (_, i) => ({
    pct: weekPlan.pct,
    weightKg: roundToIncrement(tm * weekPlan.pct, settings.roundingIncrementKg),
    reps: weekPlan.reps,
    isAmrap: weekPlan.isAmrap && i === weekPlan.sets - 1,
  }));
}

// ---------------------------------------------------------------------
// Стъпаловидна корекция на TM (не непрекъсната формула, точно по Excel):
//   постигнат таргет (>= goal reps)      → малка добавка
//   надминат с 5+ повторения (>= goal+5) → голяма добавка
//   под таргета                          → без промяна, needsUserDecision
// ---------------------------------------------------------------------

export interface JuggernautExcelBumpResult {
  newTmKg: number;
  tier: "exceeded" | "met" | "below_goal";
  needsUserDecision: boolean;
}

export function calculateTmBump(
  lift: JuggernautLift,
  wave: WaveName,
  amrapRepsAchieved: number,
  currentTmKg: number,
  settings: JuggernautExcelSettings
): JuggernautExcelBumpResult {
  const goal = settings.amrapGoalReps[wave];
  const isLower = LOWER_BODY.includes(lift);

  if (amrapRepsAchieved >= goal + 5) {
    const bump = isLower ? settings.lowerBumpExceedBy5Kg : settings.upperBumpExceedBy5Kg;
    return { newTmKg: currentTmKg + bump, tier: "exceeded", needsUserDecision: false };
  }
  if (amrapRepsAchieved >= goal) {
    const bump = isLower ? settings.lowerBumpMeetGoalKg : settings.upperBumpMeetGoalKg;
    return { newTmKg: currentTmKg + bump, tier: "met", needsUserDecision: false };
  }
  return { newTmKg: currentTmKg, tier: "below_goal", needsUserDecision: true };
}

// ---------------------------------------------------------------------
// Преход към следваща седмица/вълна
// ---------------------------------------------------------------------

export function advanceJuggernautExcelWeek(
  lift: JuggernautLift,
  state: JuggernautExcelState,
  settings: JuggernautExcelSettings,
  amrapRepsAchieved?: number // подава се само в края на седмица 3 (AMRAP седмицата)
): JuggernautExcelState {
  const wave = WAVE_ORDER[state.waveIndex];
  let updatedTm = state.tmKg;

  if (state.weekInWave === 3 && amrapRepsAchieved !== undefined) {
    const bump = calculateTmBump(lift, wave, amrapRepsAchieved, state.tmKg[lift], settings);
    updatedTm = { ...state.tmKg, [lift]: bump.newTmKg };
  }

  if (state.weekInWave < 3) {
    return { ...state, weekInWave: (state.weekInWave + 1) as WeekInWave, tmKg: updatedTm };
  }

  // край на вълната (deload темплейтът се вкарва ръчно между тук и следващото)
  const nextWaveIndex = (state.waveIndex + 1) % WAVE_ORDER.length;
  return { waveIndex: nextWaveIndex, weekInWave: 1, tmKg: updatedTm };
}
