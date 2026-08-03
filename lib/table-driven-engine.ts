// =====================================================================
//  УНИВЕРСАЛЕН ДВИЖОК ЗА ТАБЛИЧНО-БАЗИРАНИ ПРОГРАМИ
//
//  За програми с точни, фиксирани таблици (Juggernaut, Суровецкий),
//  чиито оригинални числа не могат да се "познаят" — тук се въвежда
//  РЕАЛНАТА таблица (от книга/Excel/официален източник) и движокът
//  само я изпълнява. Това директно съответства на program_phases
//  .progression_rules (jsonb) от схемата на базата.
//
//  Веднъж потвърдена таблицата за дадена програма, тя се записва в БД
//  (program_phases.progression_rules) и вече не се пипа код — само данни.
// =====================================================================

export interface TableStep {
  setNumber: number;
  pct: number;          // процент от максимума/тренировъчния максимум, напр. 0.75
  reps: number;
  isAmrap?: boolean;
  isPausedRep?: boolean;
  label?: string;       // напр. "проходка" при тестова тренировка
}

export interface TableSession {
  sessionIndex: number;      // пореден номер в цикъла (1, 2, 3, ...)
  liftSlug: string;          // "bench_press", "squat", ...
  name: string;               // "Тренировка 11", "Проходка" и т.н.
  steps: TableStep[];
  isMaxTest?: boolean;        // сесия за нов максимум ("проходка")
}

export interface ProgramTable {
  slug: string;                // "surovetsky-1", "juggernaut-10s-wave"
  name: string;
  sessions: TableSession[];    // цикълът от сесии по ред
  onCycleComplete: "restart_with_new_max" | "advance_to_next_table";
  nextTableSlug?: string;      // напр. surovetsky-1 → surovetsky-2
}

export interface TableEngineState {
  tableSlug: string;
  sessionIndexInCycle: number; // 0-базиран индекс в table.sessions
  currentMaxKg: number;
  cycleNumber: number;
}

export interface PlannedTableSet {
  weightKg: number;
  reps: number;
  isAmrap: boolean;
  isPausedRep: boolean;
  label?: string;
}

function roundToIncrement(weightKg: number, incrementKg: number): number {
  return Math.round(weightKg / incrementKg) * incrementKg;
}

// ---------------------------------------------------------------------
// Планиране на текущата сесия от таблицата
// ---------------------------------------------------------------------

export function planTableSession(
  table: ProgramTable,
  state: TableEngineState,
  roundingIncrementKg: number
): { session: TableSession; sets: PlannedTableSet[] } {
  const session = table.sessions[state.sessionIndexInCycle];

  const sets: PlannedTableSet[] = session.steps.map((step) => ({
    weightKg: roundToIncrement(state.currentMaxKg * step.pct, roundingIncrementKg),
    reps: step.reps,
    isAmrap: step.isAmrap ?? false,
    isPausedRep: step.isPausedRep ?? false,
    label: step.label,
  }));

  return { session, sets };
}

// ---------------------------------------------------------------------
// Преход към следваща сесия / край на цикъла
//   При край на цикъла (последна сесия, обикновено "проходка"/тест):
//   новият максимум идва от РЕАЛНО постигнатия резултат на теста
//   (потвърден от потребителя), не от формула — така се пази точно
//   поведението, описано за Суровецкий в спецификацията.
// ---------------------------------------------------------------------

export function advanceTableSession(
  table: ProgramTable,
  state: TableEngineState,
  confirmedNewMaxKg?: number
): TableEngineState {
  const isLastSession = state.sessionIndexInCycle >= table.sessions.length - 1;

  if (!isLastSession) {
    return { ...state, sessionIndexInCycle: state.sessionIndexInCycle + 1 };
  }

  // край на цикъла
  const newMax = confirmedNewMaxKg ?? state.currentMaxKg;

  if (table.onCycleComplete === "advance_to_next_table" && table.nextTableSlug) {
    return {
      tableSlug: table.nextTableSlug,
      sessionIndexInCycle: 0,
      currentMaxKg: newMax,
      cycleNumber: 1,
    };
  }

  return {
    tableSlug: state.tableSlug,
    sessionIndexInCycle: 0,
    currentMaxKg: newMax,
    cycleNumber: state.cycleNumber + 1,
  };
}

// ---------------------------------------------------------------------
// Начално състояние
// ---------------------------------------------------------------------

export function initTableEngineState(tableSlug: string, startingMaxKg: number): TableEngineState {
  return { tableSlug, sessionIndexInCycle: 0, currentMaxKg: startingMaxKg, cycleNumber: 1 };
}

// ---------------------------------------------------------------------
// ПРИМЕР: как ще изглежда таблица, ПОПЪЛНЕНА С РЕАЛНИ ЧИСЛА
// (тези конкретни стойности са ИЛЮСТРАТИВНИ — не са реалната
//  таблица на Суровецкий; заменят се с точните числа при качване)
// ---------------------------------------------------------------------

/*
const exampleTable: ProgramTable = {
  slug: "surovetsky-1",
  name: "Суровецкий — Система №1",
  onCycleComplete: "advance_to_next_table",
  nextTableSlug: "surovetsky-2",
  sessions: [
    {
      sessionIndex: 1,
      liftSlug: "bench_press",
      name: "Тренировка 1",
      steps: [
        { setNumber: 1, pct: 0.5, reps: 8 },
        { setNumber: 2, pct: 0.6, reps: 6 },
        { setNumber: 3, pct: 0.7, reps: 5 },
      ],
    },
    // ... останалите сесии от РЕАЛНАТА таблица
    {
      sessionIndex: 12,
      liftSlug: "bench_press",
      name: "Проходка (тест за нов максимум)",
      isMaxTest: true,
      steps: [
        { setNumber: 1, pct: 0.36, reps: 8 },
        { setNumber: 2, pct: 0.54, reps: 6 },
        { setNumber: 3, pct: 0.68, reps: 5 },
        { setNumber: 4, pct: 0.76, reps: 4 },
        { setNumber: 5, pct: 0.84, reps: 3 },
        { setNumber: 6, pct: 0.92, reps: 2 },
        { setNumber: 7, pct: 1.0, reps: 1, label: "проходка" },
      ],
    },
  ],
};
*/
