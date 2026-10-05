import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: "./fonts/fraunces-latin.woff2",
  variable: "--font-display",
  weight: "500 700",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  variable: "--font-mono",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Web Tracker",
  description: "Panel personal de webs, dominios y cobros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
