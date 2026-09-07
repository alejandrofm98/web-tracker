import { prisma } from "@/lib/db";
import { daysUntil, statusFor } from "@/lib/dates";
import { fmtDate, fmtMoney } from "@/lib/format";
import LogoutButton from "./LogoutButton";

export const revalidate = 0;

const C = {
  bg: "oklch(0.21 0.008 260)",
  raised: "oklch(0.25 0.009 260)",
  border: "oklch(0.34 0.008 260)",
  text: "oklch(0.93 0.005 260)",
  muted: "oklch(0.70 0.008 260)",
  accent: "oklch(0.72 0.14 230)",
  danger: "oklch(0.65 0.18 25)",
  warning: "oklch(0.78 0.14 80)",
  success: "oklch(0.75 0.15 150)",
};

function Badge({ days, label }: { days: number | null; label?: string }) {
  const s = statusFor(days);
  const color = s === "crit" ? C.danger : s === "warn" ? C.warning : C.success;
  const text = days === null ? "sin fecha" : days < 0 ? `caducó hace ${-days}d` : days === 0 ? "hoy" : `${days}d`;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 99, background: color }} />
      <span>
        {label ? `${label}: ` : ""}
        {text}
      </span>
    </span>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string; f?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const f = searchParams.f ?? "";
  const DAY = 86400000;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { url: { contains: q, mode: "insensitive" } },
      { clientName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (f === "expiring") where.domainExpiresAt = { lte: new Date(Date.now() + 30 * DAY) };
  else if (f === "charges") where.chargeStatus = "pendiente";
  else if (f === "bajas") where.status = "baja";
  else if (!f) where.NOT = { status: "baja" };

  const webs = await prisma.website.findMany({
    where,
    orderBy: [{ domainExpiresAt: "asc" }, { nextChargeAt: "asc" }],
  });

  const filters: Array<[string, string]> = [
    ["", "Todas"],
    ["expiring", "Caducan <30d"],
    ["charges", "Cobros pendientes"],
    ["bajas", "Bajas"],
    ["todas", "Incluir bajas"],
  ];

  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", padding: "20px 24px", fontSize: 14 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginRight: "auto" }}>Web Tracker</h1>
        <form action="/" style={{ display: "flex", gap: 8 }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar web, cliente…"
            style={searchStyle}
          />
          {f && <input type="hidden" name="f" value={f} />}
        </form>
        <a href="/webs/nueva" style={primaryBtn}>
          + Nueva web
        </a>
        <LogoutButton />
      </header>

      <nav style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {filters.map(([v, label]) => {
          const active = (v === "" && !f) || v === f;
          const href = v ? `/?f=${v}${q ? `&q=${encodeURIComponent(q)}` : ""}` : q ? `/?q=${encodeURIComponent(q)}` : "/";
          return (
            <a
              key={label}
              href={href}
              style={{
                ...chipStyle,
                background: active ? C.accent : "transparent",
                color: active ? C.bg : C.muted,
                fontWeight: active ? 700 : 400,
              }}
            >
              {label}
            </a>
          );
        })}
      </nav>

      {webs.length === 0 ? (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 32, textAlign: "center" }}>
          <p style={{ margin: "0 0 12px" }}>No hay webs aquí todavía.</p>
          <a href="/webs/nueva" style={primaryBtn}>
            Añade tu primera web
          </a>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: C.muted, fontSize: 12 }}>
                <th style={th}>Web</th>
                <th style={th}>Cliente</th>
                <th style={th}>Dominio</th>
                <th style={th}>Cobro</th>
                <th style={th}>Precio</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {webs.map((w) => {
                const dDom = daysUntil(w.domainExpiresAt);
                const dCob = daysUntil(w.nextChargeAt);
                return (
                  <tr key={w.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={td}>
                      <a href={`/webs/${w.id}`} style={{ color: C.text, fontWeight: 600 }}>
                        {w.name}
                      </a>
                      <div style={{ color: C.muted, fontSize: 12 }}>{w.url}</div>
                    </td>
                    <td style={td}>{w.clientName || "—"}</td>
                    <td style={td}>
                      <Badge days={dDom} />{" "}
                      <span style={{ color: C.muted }}>{fmtDate(w.domainExpiresAt)}</span>
                    </td>
                    <td style={td}>
                      <Badge days={dCob} label={w.chargeStatus} />{" "}
                      <span style={{ color: C.muted }}>{fmtDate(w.nextChargeAt)}</span>
                    </td>
                    <td style={td}>{fmtMoney(w.clientPrice)}</td>
                    <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                      <a href={`/webs/${w.id}`} style={{ color: C.accent }}>
                        Abrir
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const th: React.CSSProperties = { padding: "8px 10px", fontWeight: 600 };
const td: React.CSSProperties = { padding: "10px", verticalAlign: "top" };
const searchStyle: React.CSSProperties = {
  background: "oklch(0.25 0.009 260)",
  border: "1px solid oklch(0.34 0.008 260)",
  borderRadius: 8,
  padding: "8px 12px",
  color: "inherit",
  minWidth: 200,
};
const primaryBtn: React.CSSProperties = {
  background: "oklch(0.72 0.14 230)",
  color: "oklch(0.21 0.008 260)",
  borderRadius: 8,
  padding: "8px 14px",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-block",
};
const chipStyle: React.CSSProperties = {
  border: "1px solid oklch(0.34 0.008 260)",
  borderRadius: 99,
  padding: "6px 12px",
  fontSize: 13,
  textDecoration: "none",
  color: "oklch(0.70 0.008 260)",
};
