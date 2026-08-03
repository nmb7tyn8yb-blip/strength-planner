// =====================================================================
//  JUGGERNAUT METHOD — КЛАСИЧЕСКИ ВАРИАНТ (16 седмици)
//  По точните данни от документа: 4 вълни (10s/8s/5s/3s) × 4 седмици
//  (натрупване/интензификация/реализация/разтоварване), TM се
//  преизчислява с непрекъсната формула след AMRAP на реализационната
//  седмица.
// =====================================================================

export type JuggernautLift = "squat" | "bench_press" | "deadlift" | "overhead_press";
export type WaveName = "10s" | "8s" | "5s" | "3s";
export type JuggernautWeek = 1 | 2 | 3 | 4;

export interface JuggernautClassicSettings {
  roundingIncrementKg: number;
  trainingMaxPercentOf1RM: number; // 0.90
  progressionStyle: "conservative" | "standard";
}

export interface JuggernautClassicState {
  waveIndex: number; // 0=10s,1=8s,2=5s,3=3s
  weekNumber: JuggernautWeek;
  tmKg: Record<JuggernautLift, number>; // пази се с десетична стойност
}

export interface JuggernautSetPlan {
  pct: number;
  weightKg: number;
  reps: number;
  isAmrap: boolean;
}

const WAVE_ORDER: WaveName[] = ["10s", "8s", "5s", "3s"];
const STANDARD_REPS: Record<WaveName, number> = { "10s": 10, "8s": 8, "5s": 5, "3s": 3 };

// [натрупване, интензификация, реализация] — %, брой прави серии, AMRAP reps
const WAVE_WEEKS: Record<WaveName, { pct: number; straightSets: number; reps: number }[]> = {
  "10s": [
    { pct: 0.6, straightSets: 4, reps: 10 },
    { pct: 0.675, straightSets: 2, reps: 10 },
    { pct: 0.75, straightSets: 0, reps: 10 },
  ],
  "8s": [
    { pct: 0.65, straightSets: 4, reps: 8 },
    { pct: 0.725, straightSets: 2, reps: 8 },
    { pct: 0.8, straightSets: 0, reps: 8 },
  ],
  "5s": [
    { pct: 0.7, straightSets: 4, reps: 5 },
    { pct: 0.775, straightSets: 2, reps: 5 },
    { pct: 0.85, straightSets: 0, reps: 5 },
  ],
  "3s": [
    { pct: 0.75, straightSets: 5, reps: 3 },
    { pct: 0.825, straightSets: 3, reps: 3 },
    { pct: 0.9, straightSets: 0, reps: 3 },
  ],
};

function roundToIncrement(weightKg: number, incrementKg: number): number {
  return Math.round(weightKg / incrementKg) * incrementKg;
}

const UPPER_BODY: JuggernautLift[] = ["bench_press", "overhead_press"];

function repIncrementPerRep(lift: JuggernautLift, style: "conservative" | "standard"): number {
  const isUpper = UPPER_BODY.includes(lift);
  if (style === "conservative") return isUpper ? 0.5625 : 1.25; // средата на 0.5–0.625
  return isUpper ? 1.25 : 2.5;
}

// ---------------------------------------------------------------------
// Начално състояние
// ---------------------------------------------------------------------

export function initJuggernautClassicState(
  oneRepMaxesKg: Record<JuggernautLift, number>,
  settings: JuggernautClassicSettings
): JuggernautClassicState {
  const tmKg = Object.fromEntries(
    (Object.keys(oneRepMaxesKg) as JuggernautLift[]).map((lift) => [
      lift,
      oneRepMaxesKg[lift] * settings.trainingMaxPercentOf1RM, // TM се пази неокръглено
    ])
  ) as Record<JuggernautLift, number>;

  return { waveIndex: 0, weekNumber: 1, tmKg };
}

// ---------------------------------------------------------------------
// Планиране на седмицата за даден lift
// ---------------------------------------------------------------------

export function planJuggernautWeek(
  lift: JuggernautLift,
  state: JuggernautClassicState,
  settings: JuggernautClassicSettings
): JuggernautSetPlan[] {
  const wave = WAVE_ORDER[state.waveIndex];
  const tm = state.tmKg[lift];

  if (state.weekNumber === 4) {
    // разтоварване — от TM преди тази вълна (все още непроменен tmKg)
    return [0.4, 0.5, 0.6].map((pct) => ({
      pct,
      weightKg: roundToIncrement(tm * pct, settings.roundingIncrementKg),
      reps: 5,
      isAmrap: false,
    }));
  }

  const weekPlan = WAVE_WEEKS[wave][state.weekNumber - 1];
  const straight: JuggernautSetPlan[] = Array.from({ length: weekPlan.straightSets }, () => ({
    pct: weekPlan.pct,
    weightKg: roundToIncrement(tm * weekPlan.pct, settings.roundingIncrementKg),
    reps: weekPlan.reps,
    isAmrap: false,
  }));

  const amrapSet: JuggernautSetPlan = {
    pct: weekPlan.pct,
    weightKg: roundToIncrement(tm * weekPlan.pct, settings.roundingIncrementKg),
    reps: weekPlan.reps,
    isAmrap: true,
  };

  return [...straight, amrapSet];
}

// ---------------------------------------------------------------------
// Преход между седмици / вълни, преизчисляване на TM след реализация (седмица 3)
// ---------------------------------------------------------------------

export function advanceJuggernautWeek(
  lift: JuggernautLift,
  state: JuggernautClassicState,
  settings: JuggernautClassicSettings,
  amrapRepsAchieved?: number // подава се само когато приключва седмица 3
): JuggernautClassicState {
  const wave = WAVE_ORDER[state.waveIndex];

  let newTm = state.tmKg[lift];

  if (state.weekNumber === 3 && amrapRepsAchieved !== undefined) {
    const standard = STANDARD_REPS[wave];
    const diff = Math.max(0, Math.min(10, amrapRepsAchieved - standard)); // капва се на 10 повторения над стандарта
    const perRep = repIncrementPerRep(lift, settings.progressionStyle);
    newTm = state.tmKg[lift] + diff * perRep;
  }

  const updatedTm = { ...state.tmKg, [lift]: newTm };

  if (state.weekNumber < 4) {
    return { ...state, weekNumber: (state.weekNumber + 1) as JuggernautWeek, tmKg: updatedTm };
  }

  // край на разтоварването → следваща вълна (или обратно към 10s след 3s)
  const nextWaveIndex = (state.waveIndex + 1) % WAVE_ORDER.length;
  return { waveIndex: nextWaveIndex, weekNumber: 1, tmKg: updatedTm };
}
