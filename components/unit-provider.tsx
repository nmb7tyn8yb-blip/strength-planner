"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { WeightUnit } from "@/lib/units";

interface UnitContextValue {
  unit: WeightUnit;
  setUnit: (u: WeightUnit) => void;
}

const UnitContext = createContext<UnitContextValue | null>(null);

export function UnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<WeightUnit>("kg");

  useEffect(() => {
    const stored = window.localStorage.getItem("weightUnit") as WeightUnit | null;
    if (stored === "kg" || stored === "lb") setUnitState(stored);
  }, []);

  function setUnit(u: WeightUnit) {
    setUnitState(u);
    window.localStorage.setItem("weightUnit", u);
  }

  return <UnitContext.Provider value={{ unit, setUnit }}>{children}</UnitContext.Provider>;
}

export function useUnit() {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error("useUnit трябва да се ползва вътре в UnitProvider");
  return ctx;
}
