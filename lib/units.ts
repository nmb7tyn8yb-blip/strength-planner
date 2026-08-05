// =====================================================================
//  ЕДИНИЦИ ЗА ТЕГЛО — kg (вътрешно съхранение и цялата математика на
//  генераторите остават в kg) / lb (само за показване и въвеждане).
//  "Конвертиране на границата": потребителят въвежда/вижда в избраната
//  единица, но всичко останало в системата продължава да борави с kg.
// =====================================================================

export type WeightUnit = "kg" | "lb";

const KG_TO_LB = 2.20462262185;

export function kgToLb(kg: number): number {
  return kg * KG_TO_LB;
}

export function lbToKg(lb: number): number {
  return lb / KG_TO_LB;
}

/**
 * Закръгля до реалистична стъпка според наличните дискове —
 * kg дискове обичайно се редят на стъпка от 2.5кг, lb дискове на 5lb.
 */
export function roundToAvailablePlates(weightKg: number, unit: WeightUnit): number {
  if (unit === "kg") {
    return Math.round(weightKg / 2.5) * 2.5;
  }
  const lb = kgToLb(weightKg);
  return Math.round(lb / 5) * 5;
}

/**
 * Форматира тегло (съхранено вътрешно в kg) за показване в избраната
 * единица. Не пипа вътрешната стойност — само визуализацията.
 */
export function formatWeight(weightKg: number, unit: WeightUnit, decimals = 1): string {
  if (unit === "kg") {
    return `${round(weightKg, decimals)} kg`;
  }
  return `${round(kgToLb(weightKg), decimals)} lb`;
}

/** Само числото, без единицата — за случаи, където UI-то добавя "kg"/"lb" отделно. */
export function displayWeight(weightKg: number, unit: WeightUnit, decimals = 1): number {
  return unit === "kg" ? round(weightKg, decimals) : round(kgToLb(weightKg), decimals);
}

/** Обратно: потребителят въвежда число в своята единица → converts to kg за съхранение/изчисления. */
export function inputToKg(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value : lbToKg(value);
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
