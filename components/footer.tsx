"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/10 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-chalkDim">
        <span>© {new Date().getFullYear()} {t.footer.rights}</span>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-chalk">
            {t.footer.privacy}
          </Link>
          <Link href="/terms" className="hover:text-chalk">
            {t.footer.terms}
          </Link>
        </div>
      </div>
    </footer>
  );
}
