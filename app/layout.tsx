import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { LanguageProvider } from "@/components/language-provider";
import { UnitProvider } from "@/components/unit-provider";

export const metadata: Metadata = {
  title: "SilaPlan",
  description: "Персонален генератор и дневник за силови тренировки",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body className="flex min-h-screen flex-col">
        <LanguageProvider>
          <UnitProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </UnitProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
