import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
