import type { Metadata } from "next";
import { Figtree, Fragment_Mono } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  variable: "--font-fragment-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cyprus Tech Jobs — Tech careers on the island",
  description:
    "Find the best tech jobs in Cyprus. Product, engineering, design, and data roles at Revolut, Wargaming, XM, Exness, and Cyprus startups.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fragmentMono.variable}`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
