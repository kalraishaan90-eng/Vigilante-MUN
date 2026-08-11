import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

// Fix #2 — heading font: Fraunces (display serif, optical-size aware)
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],          // optical size axis: 9..144
  weight: ["600", "700", "800", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

// Fix #2 — body font: Inter
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vigilante MUN — October 10–11",
  description:
    "A youth-led Model United Nations conference where deliberation meets discipline. Gather in the chamber, sharpen your argument, and be heard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        {/* Preconnect for Google Fonts (next/font handles this, belt-and-suspenders) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
