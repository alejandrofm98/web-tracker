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
  const inDetail = pathname.startsWith("/webs/") && pathname !== "/webs/nueva";
  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/" className="brand" style={{ color: "var(--text)" }}>
          <span className="brand-mark">W</span>
          <span className="brand-name">Web Tracker</span>
        </Link>
        <nav className="topnav">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`navlink${n.match(pathname) || (n.href === "/" && inDetail) ? " active" : ""}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="topbar-user">
          <span>admin</span>
          <LogoutButton icon />
        </div>
      </header>
      <div className="content">{children}</div>
    </div>
  );
}
