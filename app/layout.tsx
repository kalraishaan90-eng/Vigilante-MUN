import "../src/react-polyfill";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "../src/index.css";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vigilante MUN 4.0 — October 10–11",
  description: "Where diplomacy meets conviction. Join 400+ delegates in redefining debate at Delhi University North Campus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-body bg-darkVanilla text-ink min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

