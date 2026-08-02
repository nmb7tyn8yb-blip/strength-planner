import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Strength Planner",
  description: "Персонален генератор и дневник за силови тренировки",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
