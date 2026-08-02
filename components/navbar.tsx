"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/programs", label: "Програми" },
  { href: "/1rm-calculator", label: "1RM Калкулатор" },
  { href: "/quiz", label: "Въпросник" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-graphite/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold uppercase tracking-wider text-chalk">
          Strength<span className="text-amber">Planner</span>
        </Link>

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
      </nav>
    </header>
  );
}
