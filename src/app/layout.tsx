import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ESOL Trainer",
  description: "Practice for the LanguageCert International ESOL written and spoken exams.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-stone-900">
        <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center gap-8 px-5 py-3.5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 font-display text-lg font-semibold text-white shadow-sm">
                E
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">ESOL Trainer</span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium text-stone-600">
              <Link href="/#levels" className="hover:text-stone-900">
                Levels
              </Link>
              <Link href="/progress" className="hover:text-stone-900">
                Progress
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">{children}</main>
        <footer className="border-t border-stone-200/70">
          <div className="mx-auto max-w-6xl px-5 py-6 text-xs text-stone-500">
            Independent practice tool. Not affiliated with or endorsed by LanguageCert. Scores are estimates.
          </div>
        </footer>
      </body>
    </html>
  );
}
