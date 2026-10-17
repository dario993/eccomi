import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const schibsted = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eccomi · Dare",
  description: "Presenze dei volontari dell'associazione Dare",
};

export const viewport: Viewport = { themeColor: "#f3f6fb" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${schibsted.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
