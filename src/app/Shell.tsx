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
        <nav className="topnav" aria-label="Navegación principal">
          <Link href="/" className={`navlink${activeFilter !== "charges" && (pathname === "/" || inDetail) ? " active" : ""}`} aria-current={activeFilter !== "charges" && (pathname === "/" || inDetail) ? "page" : undefined}>Webs</Link>
          <Link href="/?f=charges" className={`navlink${activeFilter === "charges" ? " active" : ""}`} aria-current={activeFilter === "charges" ? "page" : undefined}>Cobros</Link>
          <Link href="/estadisticas" className={`navlink${pathname === "/estadisticas" ? " active" : ""}`} aria-current={pathname === "/estadisticas" ? "page" : undefined}>Estadísticas</Link>
          <Link href="/ajustes" className={`navlink${pathname === "/ajustes" ? " active" : ""}`} aria-current={pathname === "/ajustes" ? "page" : undefined}>Ajustes</Link>
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
