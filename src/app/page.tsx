import { prisma } from "@/lib/db";
import { daysUntil } from "@/lib/dates";
import { fmtDate, fmtMoney } from "@/lib/format";
import Shell from "./Shell";
import TestNotifyButton from "./TestNotifyButton";
import ChargeButton from "./ChargeButton";

export const revalidate = 0;

const DAY = 86400000;
const URGENT_DAYS = 30;

const FILTERS: Array<[string, string]> = [
  ["", "Todas"],
  ["expiring", "Caducan <30d"],
  ["charges", "Cobros pendientes"],
  ["bajas", "Bajas"],
  ["todas", "Incluir bajas"],
];

type Urgent = {
  id: string;
  webId: string;
  name: string;
  url: string;
  clientName: string;
  provider: string;
  kind: "dominio" | "cobro";
  days: number;
  date: Date;
  price: number | null;
};

function buildUrgent(webs: Awaited<ReturnType<typeof prisma.website.findMany>>): Urgent[] {
  const out: Urgent[] = [];
  for (const w of webs) {
    const dDom = daysUntil(w.domainExpiresAt);
    if (dDom !== null && dDom < URGENT_DAYS && w.domainExpiresAt) {
      out.push({
        id: `${w.id}-dom`,
        webId: w.id,
        name: w.name,
        url: w.url,
        clientName: w.clientName,
        provider: w.domainProvider,
        kind: "dominio",
        days: dDom,
        date: w.domainExpiresAt,
        price: w.domainCost,
      });
    }
    if (w.chargeStatus === "pendiente" && w.nextChargeAt) {
      const dCob = daysUntil(w.nextChargeAt);
      if (dCob !== null && dCob < URGENT_DAYS) {
        out.push({
          id: `${w.id}-cob`,
          webId: w.id,
          name: w.name,
          url: w.url,
          clientName: w.clientName,
          provider: w.hostingProvider,
          kind: "cobro",
          days: dCob,
          date: w.nextChargeAt,
          price: w.clientPrice,
        });
      }
    }
  }
  out.sort((a, b) => a.days - b.days);
  return out;
}

function pillClass(days: number): "crit" | "warn" {
  return days < 7 ? "crit" : "warn";
}

function dueLabel(days: number): string {
  if (days < 0) return `${-days}d tarde`;
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

  const showDigest = !f || f === "expiring" || f === "charges";
  const urgent = showDigest ? buildUrgent(webs) : [];
  const urgentWebIds = new Set(urgent.map((u) => u.webId));
  const calm = webs.filter((w) => !urgentWebIds.has(w.id));

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

      {webs.length === 0 ? (
        <div className="empty" style={{ marginTop: 16 }}>
          <p>No hay webs aquí todavía.</p>
          <a href="/webs/nueva" className="btn-primary">
            Añade tu primera web
          </a>
        </div>
      ) : (
        <>
          {urgent.length > 0 && (
            <div className="digest">
              <div className="digest-h">
                <span className="dot d-crit" /> Requiere atención
              </div>
              {urgent.map((u) => (
                <div key={u.id} className="digest-item">
                  <span className={`pill pill-${pillClass(u.days)}`}>{dueLabel(u.days)}</span>
                  <span style={{ minWidth: 0 }}>
                    <a href={`/webs/${u.webId}`} className="name">
                      {u.name}
                    </a>{" "}
                    <span className="sub">
                      {u.kind === "cobro"
                        ? `cobro hosting · ${fmtMoney(u.price)} · ${fmtDate(u.date)}`
                        : `caduca dominio · ${fmtDate(u.date)}${u.provider ? ` · ${u.provider}` : ""}`}
                    </span>
                  </span>
                  <span className="sub" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>
                    {u.kind === "cobro" ? u.clientName || "" : ""}
                  </span>
                  {u.kind === "cobro" && <ChargeButton id={u.webId} compact />}
                </div>
              ))}
            </div>
          )}

          {calm.length > 0 ? (
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
                  {calm.map((w) => {
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
                          <span className={`dot d-${dDom !== null && dDom < 30 ? "warn" : "ok"}`} />
                          {dueLabel2(dDom)} <span className="cell-sub">· {fmtDate(w.domainExpiresAt)}</span>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span className={`dot d-${w.chargeStatus === "pendiente" && dCob !== null && dCob < 30 ? "warn" : "ok"}`} />
                          {w.chargeStatus === "cobrado"
                            ? "cobrado"
                            : w.chargeStatus === "sin-cobro"
                              ? "no se cobra"
                              : `${dueLabel2(dCob)} `}
                          {w.chargeStatus === "pendiente" && (
                            <span className="cell-sub">· {fmtDate(w.nextChargeAt)}</span>
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
          ) : (
            <p className="statusline" style={{ marginTop: 4 }}>
              El resto, al día.
            </p>
          )}
        </>
      )}

      <nav className="chips" style={{ marginTop: 20 }}>
        {FILTERS.map(([v, label]) => {
          const active = (v === "" && !f) || v === f;
          return (
            <a key={label} href={hrefFor(v)} className={`chip${active ? " active" : ""}`}>
              {label}
            </a>
          );
        })}
      </nav>
    </Shell>
  );
}

function dueLabel2(days: number | null): string {
  if (days === null) return "sin fecha";
  if (days < 0) return `caducó hace ${-days}d`;
  if (days === 0) return "hoy";
  return `${days}d`;
}
