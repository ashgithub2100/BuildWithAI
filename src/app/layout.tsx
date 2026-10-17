import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anchor — Anti-Procrastination & Cognitive Paralysis Killer",
  description:
    "An anti-procrastination circuit-breaker app that kills cognitive freeze using the Rule of One, microscopic breakdown, and avoidance detection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas text-ink-primary min-h-screen bg-tech-grid antialiased selection:bg-amber-braun/30 selection:text-ink-primary">
        {children}
      </body>
    </html>
  );
}
