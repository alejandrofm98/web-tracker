"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const NAV = [
  { href: "/", label: "Webs", match: (p: string) => p === "/" },
  { href: "/webs/nueva", label: "Nueva web", match: (p: string) => p === "/webs/nueva" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">W</span>
          <span>
            <span className="brand-name">Web Tracker</span>
            <br />
            <span className="brand-sub">Dominios y cobros</span>
          </span>
        </div>
        <nav style={{ display: "contents" }}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`navlink${n.match(pathname) ? " active" : ""}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span style={{ color: "var(--text-muted)" }}>admin</span>
          <LogoutButton />
        </div>
      </aside>
      <div className="content">{children}</div>
    </div>
  );
}
