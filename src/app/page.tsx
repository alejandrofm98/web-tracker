import { prisma } from "@/lib/db";
import { daysUntil, statusFor } from "@/lib/dates";
import { fmtDate, fmtMoney } from "@/lib/format";
import Shell from "./Shell";
import TestNotifyButton from "./TestNotifyButton";

export const revalidate = 0;

const DAY = 86400000;

const FILTERS: Array<[string, string]> = [
  ["", "Todas"],
  ["expiring", "Caducan <30d"],
  ["charges", "Cobros pendientes"],
  ["bajas", "Bajas"],
  ["todas", "Incluir bajas"],
];

function Dot({ days }: { days: number | null }) {
  const s = statusFor(days);
  const color =
    s === "crit" ? "var(--danger)" : s === "warn" ? "var(--warning)" : "var(--success)";
  return <span className="dot" style={{ background: color }} />;
}

function dueText(days: number | null): string {
  if (days === null) return "sin fecha";
  if (days < 0) return `caducó hace ${-days}d`;
  if (days === 0) return "hoy";
  return `${days}d`;
}

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string; f?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const f = searchParams.f ?? "";

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

  const attention = webs.filter((w) => {
    const d = daysUntil(w.domainExpiresAt);
    const c = daysUntil(w.nextChargeAt);
    return (d !== null && d < 30) || (w.chargeStatus === "pendiente" && c !== null && c < 30);
  }).length;

  const hrefFor = (v: string) =>
    v ? `/?f=${v}${q ? `&q=${encodeURIComponent(q)}` : ""}` : q ? `/?q=${encodeURIComponent(q)}` : "/";

  return (
    <Shell>
      <div className="toolbar">
        <h1>Webs</h1>
        <form action="/">
          <input name="q" defaultValue={q} placeholder="Buscar web, cliente…" className="input search" />
          {f && <input type="hidden" name="f" value={f} />}
        </form>
        <a href="/webs/nueva" className="btn-primary">
          + Nueva web
        </a>
        <TestNotifyButton />
      </div>

      <p className="statusline">
        {webs.length === 0
          ? "Sin resultados para este filtro."
          : `${webs.length} ${webs.length === 1 ? "web" : "webs"}${
              attention > 0 ? ` · ${attention} ${attention === 1 ? "necesita" : "necesitan"} atención` : " · todo al día"
            }`}
      </p>

      <nav className="chips">
        {FILTERS.map(([v, label]) => {
          const active = (v === "" && !f) || v === f;
          return (
            <a key={label} href={hrefFor(v)} className={`chip${active ? " active" : ""}`}>
              {label}
            </a>
          );
        })}
      </nav>

      {webs.length === 0 ? (
        <div className="empty">
          <p>No hay webs aquí todavía.</p>
          <a href="/webs/nueva" className="btn-primary">
            Añade tu primera web
          </a>
        </div>
      ) : (
        <div className="tablewrap">
          <table className="grid">
            <thead>
              <tr>
                <th>Web</th>
                <th>Cliente</th>
                <th>Dominio</th>
                <th>Cobro</th>
                <th style={{ textAlign: "right" }}>Precio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {webs.map((w) => {
                const dDom = daysUntil(w.domainExpiresAt);
                const dCob = daysUntil(w.nextChargeAt);
                return (
                  <tr key={w.id}>
                    <td>
                      <a href={`/webs/${w.id}`} className="cell-main">
                        {w.name}
                      </a>
                      <div className="cell-sub">{w.url}</div>
                    </td>
                    <td>{w.clientName || <span className="cell-sub">—</span>}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <Dot days={dDom} />
                      {dueText(dDom)} <span className="cell-sub">· {fmtDate(w.domainExpiresAt)}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <Dot days={w.chargeStatus === "cobrado" ? null : dCob} />
                      {w.chargeStatus === "cobrado" ? (
                        "cobrado"
                      ) : (
                        <>
                          {dueText(dCob)} <span className="cell-sub">· {fmtDate(w.nextChargeAt)}</span>
                        </>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>{fmtMoney(w.clientPrice)}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <a href={`/webs/${w.id}`}>Abrir</a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
