"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

const NAV_LINKS = [
  { href: "/programs", label: "Програми" },
  { href: "/1rm-calculator", label: "1RM Калкулатор" },
  { href: "/quiz", label: "Въпросник" },
  { href: "/dashboard", label: "Табло" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setEmail(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-white/10 bg-graphite/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold uppercase tracking-wider text-chalk">
          Strength<span className="text-amber">Planner</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="flex items-center gap-1 sm:gap-2">
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
                <span className="hidden text-xs text-chalkDim sm:inline">{email}</span>
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
      </nav>
    </header>
  );
}
