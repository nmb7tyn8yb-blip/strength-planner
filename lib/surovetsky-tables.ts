// =====================================================================
//  СУРОВЕЦКИЙ — ТОЧНИ ТАБЛИЦИ (Система №1 и №2)
//  Кодирани по данните и снимката, предоставени от потребителя.
//
//  ПАУЗА (потвърдено от блог поста с превода на оригинала):
//  "Сериите с последната тежест преди лежанката с по-малка амплитуда
//  (дожим) се изпълняват с 2-3 сек. пауза на гърди. Примерно от 1-ва
//  до 6-та тренировка това са сериите на 80% от макса, които са в
//  колонката преди 'дожим'." — т.е. паузата е на ПОСЛЕДНАТА (най-дясна)
//  колона от "допълнителни пълни серии", НЕ на тежките единици 92-100%.
//  За Система №2 (няма дожим колона в предоставените данни) паузата
//  НЕ е маркирана — очаква потвърждение.
// =====================================================================

import { ProgramTable, TableSession, TableStep } from "./table-driven-engine";

// ---------------------------------------------------------------------
// Помощни функции
// ---------------------------------------------------------------------

function s(pct: number, reps: number, sets: number = 1, opts: Partial<TableStep> = {}): TableStep[] {
  return Array.from({ length: sets }, (_, i) => ({
    setNumber: i + 1,
    pct,
    reps,
    ...opts,
  }));
}



// ---------------------------------------------------------------------
// СИСТЕМА №1
// ---------------------------------------------------------------------

const SYS1_LADDER: TableStep[] = [
  ...s(0.3, 8, 1, { label: "загряване" }),
  ...s(0.45, 6, 1, { label: "загряване" }),
  ...s(0.6, 6, 1, { label: "загряване" }),
  ...s(0.7, 5, 1, { label: "подход" }),
  ...s(0.8, 4, 1, { label: "подход" }),
  ...s(0.84, 3, 1, { label: "подход" }),
  ...s(0.88, 3, 1, { label: "подход" }),
];

interface Sys1Row {
  heavy: TableStep[];
  additional: TableStep[];
  dozhim: TableStep[];
}

const SYS1_ROWS: Sys1Row[] = [
  { heavy: [], additional: [...s(0.84, 4, 2, { label: "допълнителна" }), ...s(0.8, 2, 2, { label: "допълнителна", isPausedRep: true })], dozhim: [] },
  {
    heavy: [...s(0.92, 1, 2, { label: "тежка единица" }), ...s(0.96, 1, 2, { label: "тежка единица" })],
    additional: [...s(0.84, 5, 2, { label: "допълнителна" }), ...s(0.8, 2, 2, { label: "допълнителна", isPausedRep: true })],
    dozhim: s(1.0, 2, 3, { label: "дожим (подложка ~10-12см)" }),
  },
  { heavy: s(0.92, 1, 3, { label: "тежка единица" }), additional: [...s(0.84, 6, 2, { label: "допълнителна" }), ...s(0.8, 3, 2, { label: "допълнителна", isPausedRep: true })], dozhim: [] },
  {
    heavy: [...s(0.92, 1, 2, { label: "тежка единица" }), ...s(0.96, 1, 1, { label: "тежка единица" }), ...s(1.0, 1, 1, { label: "тежка единица" })],
    additional: [...s(0.86, 3, 2, { label: "допълнителна" }), ...s(0.8, 3, 2, { label: "допълнителна", isPausedRep: true })],
    dozhim: s(1.0, 3, 3, { label: "дожим (подложка ~10-12см)" }),
  },
  { heavy: s(0.92, 1, 3, { label: "тежка единица" }), additional: [...s(0.86, 4, 2, { label: "допълнителна" }), ...s(0.8, 3, 3, { label: "допълнителна", isPausedRep: true })], dozhim: [] },
  {
    heavy: [...s(0.92, 1, 2, { label: "тежка единица" }), ...s(0.96, 1, 2, { label: "тежка единица" })],
    additional: [...s(0.86, 5, 2, { label: "допълнителна" }), ...s(0.8, 3, 3, { label: "допълнителна", isPausedRep: true })],
    dozhim: [],
  },
  {
    heavy: [...s(0.92, 1, 2, { label: "тежка единица" }), ...s(0.96, 1, 2, { label: "тежка единица" }), ...s(1.0, 1, 1, { label: "тежка единица" })],
    additional: [...s(0.88, 3, 2, { label: "допълнителна" }), ...s(0.82, 2, 2, { label: "допълнителна", isPausedRep: true })],
    dozhim: s(1.0, 4, 3, { label: "дожим (подложка ~10-12см)" }),
  },
  {
    heavy: [...s(0.92, 1, 3, { label: "тежка единица" }), ...s(0.96, 1, 2, { label: "тежка единица" })],
    additional: [...s(0.88, 4, 2, { label: "допълнителна" }), ...s(0.82, 3, 2, { label: "допълнителна", isPausedRep: true })],
    dozhim: [],
  },
  {
    heavy: [...s(0.92, 1, 3, { label: "тежка единица" }), ...s(0.96, 1, 2, { label: "тежка единица" }), ...s(1.0, 1, 1, { label: "тежка единица" })],
    additional: [...s(0.9, 3, 2, { label: "допълнителна" }), ...s(0.82, 3, 3, { label: "допълнителна", isPausedRep: true })],
    dozhim: [],
  },
  {
    heavy: [...s(0.92, 1, 3, { label: "тежка единица" }), ...s(0.96, 1, 2, { label: "тежка единица" }), ...s(1.0, 1, 1, { label: "тежка единица" })],
    additional: [...s(0.92, 3, 2, { label: "допълнителна" }), ...s(0.84, 2, 2, { label: "допълнителна", isPausedRep: true })],
    dozhim: s(1.0, 5, 3, { label: "дожим (подложка ~10-12см)" }),
  },
];

const sys1Sessions: TableSession[] = SYS1_ROWS.map((row, i) => ({
  sessionIndex: i + 1,
  liftSlug: "bench_press",
  name: `Тренировка ${i + 1}`,
  steps: ([...SYS1_LADDER, ...row.heavy, ...row.additional, ...row.dozhim]),
}));

sys1Sessions.push({
  sessionIndex: 11,
  liftSlug: "bench_press",
  name: "Тренировка 11",
  steps: ([
    ...s(0.3, 10, 1, { label: "загряване" }),
    ...s(0.45, 8, 1, { label: "загряване" }),
    ...s(0.6, 6, 1, { label: "загряване" }),
    ...s(0.7, 5, 3, { label: "подход" }),
  ]),
});

sys1Sessions.push({
  sessionIndex: 12,
  liftSlug: "bench_press",
  name: "Тренировка 12 — тест за нов максимум",
  isMaxTest: true,
  steps: ([
    ...s(0.36, 8, 1, { label: "загряване" }),
    ...s(0.54, 6, 1, { label: "загряване" }),
    ...s(0.68, 5, 1, { label: "подход" }),
    ...s(0.76, 4, 1, { label: "подход" }),
    ...s(0.84, 3, 1, { label: "подход" }),
    ...s(0.92, 2, 1, { label: "подход" }),
    ...s(1.0, 1, 1, { label: "проходка" }),
  ]),
});

export const surovetskySystem1: ProgramTable = {
  slug: "surovetsky-1",
  name: "Суровецкий — Система №1",
  onCycleComplete: "advance_to_next_table",
  nextTableSlug: "surovetsky-2",
  sessions: sys1Sessions,
};

// ---------------------------------------------------------------------
// СИСТЕМА №2
// ---------------------------------------------------------------------

const SYS2_LADDER: TableStep[] = [
  ...s(0.36, 8, 1, { label: "загряване" }),
  ...s(0.54, 6, 1, { label: "загряване" }),
  ...s(0.68, 6, 1, { label: "подход" }),
  ...s(0.76, 5, 1, { label: "подход" }),
  ...s(0.8, 4, 1, { label: "подход" }),
];

const sys2Sessions: TableSession[] = [
  {
    sessionIndex: 1,
    liftSlug: "bench_press",
    name: "Тренировка 1",
    steps: ([
      ...SYS2_LADDER,
      ...s(0.84, 3, 1, { label: "подход" }),
      ...s(0.88, 3, 1, { label: "подход" }),
      ...s(0.92, 2, 2, { label: "тежка единица" }),
      ...s(0.88, 3, 2, { label: "допълнителна" }),
    ]),
  },
  {
    sessionIndex: 2,
    liftSlug: "bench_press",
    name: "Тренировка 2",
    steps: ([...SYS2_LADDER, ...s(0.84, 3, 1, { label: "подход" }), ...s(0.88, 3, 4, { label: "допълнителна" })]),
  },
  {
    sessionIndex: 3,
    liftSlug: "bench_press",
    name: "Тренировка 3",
    steps: ([...SYS2_LADDER, ...s(0.84, 5, 5, { label: "допълнителна" })]),
  },
  {
    sessionIndex: 4,
    liftSlug: "bench_press",
    name: "Тренировка 4",
    steps: ([
      ...SYS2_LADDER,
      ...s(0.84, 3, 1, { label: "подход" }),
      ...s(0.88, 3, 1, { label: "подход" }),
      ...s(0.92, 3, 3, { label: "тежка единица" }),
      ...s(0.88, 3, 3, { label: "допълнителна" }),
    ]),
  },
  {
    sessionIndex: 5,
    liftSlug: "bench_press",
    name: "Тренировка 5",
    steps: ([...SYS2_LADDER, ...s(0.84, 3, 1, { label: "подход" }), ...s(0.88, 3, 3, { label: "допълнителна" })]),
  },
  {
    sessionIndex: 6,
    liftSlug: "bench_press",
    name: "Тренировка 6 — тест за нов максимум",
    isMaxTest: true,
    steps: ([
      ...s(0.36, 8, 1, { label: "загряване" }),
      ...s(0.54, 6, 1, { label: "загряване" }),
      ...s(0.68, 5, 1, { label: "подход" }),
      ...s(0.76, 4, 1, { label: "подход" }),
      ...s(0.84, 3, 1, { label: "подход" }),
      ...s(0.92, 2, 1, { label: "подход" }),
      ...s(1.0, 1, 1, { label: "проходка" }),
    ]),
  },
];

export const surovetskySystem2: ProgramTable = {
  slug: "surovetsky-2",
  name: "Суровецкий — Система №2",
  onCycleComplete: "advance_to_next_table",
  nextTableSlug: "surovetsky-1",
  sessions: sys2Sessions,
};

export const SUROVETSKY_REST_GUIDELINES = {
  note: "Оригиналните снимки не посочват почивки — това е препоръка на приложението, не правило на автора.",
  upTo70Percent: { minSeconds: 60, maxSeconds: 90 },
  from80to88Percent: { minSeconds: 120, maxSeconds: 240 },
  from92to100Percent: { minSeconds: 240, maxSeconds: 360 },
  beforeMaxAttempt: { minSeconds: 360, maxSeconds: 480 },
  dozhim: { minSeconds: 180, maxSeconds: 300 },
};
