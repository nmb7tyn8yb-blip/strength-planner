import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strength Planner",
  description: "Персонален генератор и дневник за силови тренировки",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
