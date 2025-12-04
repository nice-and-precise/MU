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
  title: {
    default: "HDD Nexus | Midwest Underground",
    template: "%s | HDD Nexus"
  },
  description: "The premier operations platform for Horizontal Directional Drilling. Manage projects, crews, and assets with precision.",
  keywords: ["HDD", "Drilling", "Construction", "Project Management", "Midwest Underground"],
  authors: [{ name: "Midwest Underground" }],
  creator: "Midwest Underground",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hddnexus.com",
    title: "HDD Nexus | Midwest Underground",
    description: "The premier operations platform for Horizontal Directional Drilling.",
    siteName: "HDD Nexus",
  },
  twitter: {
    card: "summary_large_image",
    title: "HDD Nexus | Midwest Underground",
    description: "The premier operations platform for Horizontal Directional Drilling.",
    creator: "@midwestunderground",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // userScalable: false, // Removed for accessibility
  // maximumScale: 1, // Removed for accessibility
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
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
