import type { Locale } from "@/lib/i18n-dictionary";

// Подредени от най-дългите/специфични фрази към най-късите, за да не се
// случи частично грешно заместване (напр. "седмица" вътре в друга дума).
const BG_TO_EN: [string, string][] = [
  ["Суровецкий — Система №1", "Surovetsky — System #1"],
  ["Суровецкий — Система №2", "Surovetsky — System #2"],
  ["Мъртва тяга", "Deadlift"],
  ["Военна преса", "Overhead Press"],
  ["Обемен ден", "Volume Day"],
  ["Възстановителен ден", "Recovery Day"],
  ["Интензивен ден", "Intensity Day"],
  ["Задно рамо", "Rear Delt"],
  ["Хиперекстензии", "Hyperextensions"],
  ["Набирания", "Pull-ups"],
  ["Обръщане", "Power Clean"],
  ["Гребане", "Rowing"],
  ["Проходка", "Test attempt"],
  ["Лежанка", "Bench Press"],
  ["Клек", "Squat"],
  ["Тренировка", "Workout"],
  ["Цикъл", "Cycle"],
  ["Вълна", "Wave"],
  ["седмица", "week"],
  ["загряване", "warm-up"],
];

/**
 * Превежда динамично генериран текст от базата (имена на тренировки,
 * упражнения) за показване на английски. Самите данни в базата остават
 * непроменени — превежда се само каквото виждаш на екрана.
 */
export function translateWorkoutText(text: string, locale: Locale): string {
  if (locale !== "en" || !text) return text;

  let result = text;
  for (const [bg, en] of BG_TO_EN) {
    result = result.split(bg).join(en);
  }
  return result;
}
