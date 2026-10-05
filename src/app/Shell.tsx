"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function Shell({ children, activeFilter = "" }: { children: React.ReactNode; activeFilter?: string }) {
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
          <Link href="/" className={`navlink${activeFilter !== "charges" && (pathname === "/" || inDetail) ? " active" : ""}`}>Webs</Link>
          <Link href="/?f=charges" className={`navlink${activeFilter === "charges" ? " active" : ""}`}>Cobros</Link>
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
