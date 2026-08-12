import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { LanguageProvider } from "@/components/language-provider";
import { UnitProvider } from "@/components/unit-provider";
import PageViewTracker from "@/components/page-view-tracker";
import MetaPixel from "@/components/meta-pixel";

export const metadata: Metadata = {
  title: "SilaPlan",
  description: "Персонален генератор и дневник за силови тренировки",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SilaPlan",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body className="flex min-h-screen flex-col">
        <MetaPixel />
        <LanguageProvider>
          <UnitProvider>
            <PageViewTracker />
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </UnitProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
