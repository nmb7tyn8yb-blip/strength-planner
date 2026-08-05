"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export type PlanTier = "free" | "pro" | "founding_member";

export function usePlanTier() {
  const [tier, setTier] = useState<PlanTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        if (!cancelled) {
          setTier("free");
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase.from("profiles").select("plan_tier").eq("id", userData.user.id).single();

      if (!cancelled) {
        setTier((data?.plan_tier as PlanTier) ?? "free");
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { tier, isPro: tier === "pro" || tier === "founding_member", loading };
}
