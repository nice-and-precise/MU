import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

import { Providers } from "./providers";
import { FeedbackWidget } from "@/components/FeedbackWidget";

export const metadata: Metadata = {
  title: "HDD Nexus",
  description: "Horizontal Directional Drilling Operations Platform",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zooming in field app
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${oswald.variable} antialiased relative`}
      >
        <Providers>
          {children}
          {(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_FEEDBACK === 'true') && <FeedbackWidget />}
        </Providers>
      </body>
    </html>
  );
}
