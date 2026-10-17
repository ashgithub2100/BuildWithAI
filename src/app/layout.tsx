import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReceiptSplit — Local-First Private Expense & Chat Agent",
  description:
    "Zero-friction WhatsApp chat ingestion, zero-penny Hare-Niemeyer math, on-device Min-Cash-Flow graph debt simplification, and NPCI UPI QR settlements with 100% client-side privacy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0B0F17" />
      </head>
      <body className="min-h-screen bg-[#0B0F17] text-[#F9FAFB] selection:bg-blue-600/30 selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
