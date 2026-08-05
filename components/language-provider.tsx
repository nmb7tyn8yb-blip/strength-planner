"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { translations, type Locale, type TranslationShape } from "@/lib/i18n-dictionary";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TranslationShape;
  /** добавя /en префикс, ако сме в английския контекст — за вътрешни линкове */
  localizedHref: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // URL-ът е меродавен: ако сме под /en, езикът Е английски, независимо
  // от предишен избор в localStorage. Извън /en, следваме localStorage
  // избора (или bg по подразбиране).
  const isEnglishPath = pathname === "/en" || pathname?.startsWith("/en/");
  const [storedLocale, setStoredLocale] = useState<Locale>("bg");

  useEffect(() => {
    if (isEnglishPath) return; // /en винаги е английски, няма нужда от localStorage
    const stored = window.localStorage.getItem("locale") as Locale | null;
    if (stored === "bg" || stored === "en") setStoredLocale(stored);
  }, [isEnglishPath]);

  const locale: Locale = isEnglishPath ? "en" : storedLocale;

  function stripEnPrefix(path: string): string {
    if (path === "/en") return "/";
    if (path.startsWith("/en/")) return path.slice(3);
    return path;
  }

  function localizedHref(path: string): string {
    if (locale !== "en") return path;
    if (path === "/") return "/en";
    return `/en${path}`;
  }

  function setLocale(l: Locale) {
    if (l === locale) return;

    if (l === "en") {
      // навигира към /en версията на текущия път — реална смяна на URL-а
      const target = pathname === "/" ? "/en" : `/en${pathname}`;
      router.push(target);
    } else {
      window.localStorage.setItem("locale", "bg");
      setStoredLocale("bg");
      router.push(stripEnPrefix(pathname ?? "/"));
    }
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale], localizedHref }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage трябва да се ползва вътре в LanguageProvider");
  return ctx;
}
