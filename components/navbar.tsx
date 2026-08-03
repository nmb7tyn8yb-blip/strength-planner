"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

const NAV_LINKS = [
  { href: "/programs", label: "Програми" },
  { href: "/create-program", label: "Създай програма" },
  { href: "/1rm-calculator", label: "1RM Калкулатор" },
  { href: "/quiz", label: "Въпросник" },
  { href: "/dashboard", label: "Табло" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // затваря менюто автоматично при смяна на страница
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

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-graphite/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold uppercase tracking-wider text-chalk">
          Strength<span className="text-amber">Planner</span>
        </Link>

        {/* Десктоп навигация */}
        <div className="hidden items-center gap-1 md:flex">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
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

          <div className="ml-2 flex items-center gap-3 border-l border-white/10 pl-3">
            {email ? (
              <>
                <span className="text-xs text-chalkDim">{email}</span>
                <button
                  onClick={handleLogout}
                  className="border-2 border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-chalkDim transition hover:border-rust hover:text-rust"
                >
                  Изход
                </button>
              </>
            ) : (
              <Link
                href="/start"
                className="border-2 border-amber px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber transition hover:bg-amber hover:text-graphite"
              >
                Вход
              </Link>
            )}
          </div>
        </div>

        {/* Мобилен бутон-хамбургер */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Отвори менюто"
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
              const active = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
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

          <div className="mt-3 border-t border-white/10 pt-3">
            {email ? (
              <div className="flex items-center justify-between px-3">
                <span className="text-xs text-chalkDim">{email}</span>
                <button
                  onClick={handleLogout}
                  className="border-2 border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-chalkDim transition hover:border-rust hover:text-rust"
                >
                  Изход
                </button>
              </div>
            ) : (
              <Link
                href="/start"
                className="mx-3 flex items-center justify-center border-2 border-amber px-4 py-3 text-sm font-semibold uppercase tracking-wide text-amber transition hover:bg-amber hover:text-graphite"
              >
                Вход
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
