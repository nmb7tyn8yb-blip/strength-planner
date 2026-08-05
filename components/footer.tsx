import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-chalkDim">
        <span>© {new Date().getFullYear()} StrengthPlanner</span>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-chalk">
            Поверителност
          </Link>
          <Link href="/terms" className="hover:text-chalk">
            Общи условия
          </Link>
        </div>
      </div>
    </footer>
  );
}
