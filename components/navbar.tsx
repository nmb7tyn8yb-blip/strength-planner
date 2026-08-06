"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useLanguage } from "@/components/language-provider";
import { useUnit } from "@/components/unit-provider";
import { usePlanTier } from "@/lib/use-plan-tier";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t, localizedHref } = useLanguage();
  const { unit, setUnit } = useUnit();
  const { isPro } = usePlanTier();
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_LINKS = [
    { href: "/programs", label: t.nav.programs },
    { href: "/create-program", label: t.nav.createProgram },
    { href: "/1rm-calculator", label: t.nav.calculator },
    { href: "/quiz", label: t.nav.quiz },
    { href: "/dashboard", label: t.nav.dashboard },
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setEmail(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function LanguageSwitch({ className = "" }: { className?: string }) {
    return (
      <div className={`flex border border-white/15 text-xs font-semibold ${className}`}>
        <button
          onClick={() => setLocale("bg")}
          className={`px-2 py-1 transition ${locale === "bg" ? "bg-amber text-graphite" : "text-chalkDim hover:text-chalk"}`}
        >
          BG
        </button>
        <button
          onClick={() => setLocale("en")}
          className={`px-2 py-1 transition ${locale === "en" ? "bg-amber text-graphite" : "text-chalkDim hover:text-chalk"}`}
        >
          EN
        </button>
      </div>
    );
  }

  function UnitSwitch({ className = "" }: { className?: string }) {
    return (
      <div className={`flex border border-white/15 text-xs font-semibold ${className}`}>
        <button
          onClick={() => setUnit("kg")}
          className={`px-2 py-1 transition ${unit === "kg" ? "bg-steel text-graphite" : "text-chalkDim hover:text-chalk"}`}
        >
          KG
        </button>
        <button
          onClick={() => setUnit("lb")}
          className={`px-2 py-1 transition ${unit === "lb" ? "bg-steel text-graphite" : "text-chalkDim hover:text-chalk"}`}
        >
          LB
        </button>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-graphite/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={localizedHref("/")} className="font-display text-lg font-semibold uppercase tracking-wider text-chalk">
          Sila<span className="text-amber">Plan</span>
        </Link>

        {/* Десктоп навигация */}
        <div className="hidden items-center gap-1 md:flex">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const localizedTarget = localizedHref(link.href);
              const active = pathname === localizedTarget || pathname?.startsWith(localizedTarget + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={localizedHref(link.href)}
                    className={`px-3 py-2 text-sm font-medium transition ${
                      active ? "text-amber" : "text-chalkDim hover:text-chalk"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <LanguageSwitch className="ml-3" />
          <UnitSwitch className="ml-2" />

          <div className="ml-3 flex items-center gap-3 border-l border-white/10 pl-3">
            {email ? (
              <>
                <span className="text-xs text-chalkDim">{email}</span>
                {isPro && (
                  <span className="border border-amber/50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber">
                    Pro
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="border-2 border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-chalkDim transition hover:border-rust hover:text-rust"
                >
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <Link
                href={localizedHref("/start")}
                className="border-2 border-amber px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber transition hover:bg-amber hover:text-graphite"
              >
                {t.nav.login}
              </Link>
            )}
          </div>
        </div>

        {/* Мобилен бутон-хамбургер */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
          className="flex flex-col gap-1.5 p-2 md:hidden"
        >
          <span className={`h-0.5 w-6 bg-chalk transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-chalk transition ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-chalk transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Мобилно падащо меню */}
      {menuOpen && (
        <div className="border-t border-white/10 px-6 py-4 md:hidden">
          <ul className="grid gap-1">
            {NAV_LINKS.map((link) => {
              const localizedTarget = localizedHref(link.href);
              const active = pathname === localizedTarget || pathname?.startsWith(localizedTarget + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={localizedHref(link.href)}
                    className={`block px-3 py-3 text-base font-medium transition ${
                      active ? "text-amber" : "text-chalkDim hover:text-chalk"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex items-center justify-between border-t border-white/10 px-3 pt-3">
            <div className="flex gap-2">
              <LanguageSwitch />
              <UnitSwitch />
            </div>
            {email ? (
              <button
                onClick={handleLogout}
                className="border-2 border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-chalkDim transition hover:border-rust hover:text-rust"
              >
                {t.nav.logout}
              </button>
            ) : (
              <Link
                href={localizedHref("/start")}
                className="border-2 border-amber px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber transition hover:bg-amber hover:text-graphite"
              >
                {t.nav.login}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
