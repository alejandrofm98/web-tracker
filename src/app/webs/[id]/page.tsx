import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { daysUntil } from "@/lib/dates";
import { fmtDate, fmtMoney } from "@/lib/format";
import Shell from "../../Shell";
import WebForm from "../WebForm";
import TechnicalLocation from "../TechnicalLocation";
import DeleteButton from "./DeleteButton";
import ChargeButton from "../../ChargeButton";

export const revalidate = 0;

function due(days: number | null): string {
  if (days === null) return "sin fecha";
  if (days < 0) return `hace ${-days}d`;
  if (days === 0) return "hoy";
  return `quedan ${days}d`;
}

export default async function DetailPage({ params }: { params: { id: string } }) {
  const web = await prisma.website.findUnique({ where: { id: params.id } });
  if (!web) notFound();

  const dDom = daysUntil(web.domainExpiresAt);
  const dCob = daysUntil(web.nextChargeAt);

  return (
    <Shell>
      <div className="form-shell">
        <Link href="/" className="backlink">
          ← Volver
        </Link>
        <div className="ficha">
          <div className="ficha-main">
            <p className="ed-kicker">Ficha</p>
            <h1 className="ed-title">{web.name}</h1>
            <p className="ed-lede">
              <a href={web.url} target="_blank" rel="noreferrer">
                {web.url}
              </a>
              {web.clientName ? ` · ${web.clientName}` : ""}
            </p>
            <dl>
              <dt>Dominio</dt>
              <dd>
                {web.domainExpiresAt ? (
                  <>
                    Caduca el {fmtDate(web.domainExpiresAt)} · {due(dDom)}
                    {web.domainProvider ? ` · ${web.domainProvider}` : ""}
                    {web.domainCost != null ? ` · renueva ${fmtMoney(web.domainCost)}` : ""}
                  </>
                ) : (
                  web.domainProvider ? `${web.domainProvider} · sin seguimiento de caducidad` : "Sin seguimiento de dominio (opcional)"
                )}
              </dd>
              <dt>Hosting</dt>
              <dd>
                {web.hostingProvider || "Proveedor sin indicar"}
                {web.hostingPlan ? ` · ${web.hostingPlan}` : ""}
                {web.ownCost != null ? ` · coste para ti: ${fmtMoney(web.ownCost)}` : ""}
              </dd>
              <dt>Cobro al cliente</dt>
              <dd>
                {web.chargeStatus === "sin-cobro" ? (
                  "No se cobra"
                ) : (
                  <>
                    {fmtMoney(web.clientPrice)} {web.billingPeriod === "mensual" ? "al mes" : "al año"} por dominio y hosting ·{" "}
                    {web.chargeStatus}
                    {web.nextChargeAt && web.chargeStatus === "pendiente" ? ` · próximo ${fmtDate(web.nextChargeAt)} (${due(dCob)})` : ""}
                  </>
                )}
              </dd>
              {web.stack && (
                <>
                  <dt>Stack</dt>
                  <dd>{web.stack}</dd>
                </>
              )}
              {web.notes && (
                <>
                  <dt>Notas</dt>
                  <dd>{web.notes}</dd>
                </>
              )}
              {web.repoUrl && (
                <>
                  <dt>Repositorios</dt>
                  <dd>
                    {web.repoUrl.split(/\r?\n/).map((repo) => repo.trim()).filter(Boolean).map((repo, index) => (
                      <div key={index} className="technical-location">
                        {/^https?:\/\//i.test(repo) ? <a href={repo} target="_blank" rel="noreferrer">{repo}</a> : repo}
                      </div>
                    ))}
                  </dd>
                </>
              )}
              <dt>Credenciales en Bitwarden</dt>
              <TechnicalLocation value={web.credentialsHint || "Pendiente de indicar la colección y las entradas de Bitwarden."} />
              <dt>.env y configuración</dt>
              <TechnicalLocation value={web.envHint || "Pendiente de indicar la ruta local, la configuración de producción y la copia en Bitwarden."} />
            </dl>
          </div>
          <div className="ficha-side">
            <p className="ed-kicker">Acciones</p>
            <div className="action-row">
              {web.chargeStatus === "pendiente" && <ChargeButton id={web.id} />}
              <a href="#editar" className="icon-btn" title="Editar abajo" aria-label="Editar abajo">
                <Pencil size={15} />
              </a>
              <DeleteButton id={web.id} />
            </div>
            <p className="ed-kicker" style={{ marginTop: 24 }}>
              Historial
            </p>
            <p className="cell-sub" style={{ margin: 0 }}>
              Creada el {fmtDate(web.createdAt)}
              <br />
              Actualizada el {fmtDate(web.updatedAt)}
              <br />
              {web.lastNotifiedAt
                ? `Último aviso el ${fmtDate(web.lastNotifiedAt)}`
                : "Sin avisos enviados aún"}
            </p>
          </div>
        </div>
      </div>
      <div id="editar">
        <WebForm
          initial={{
            ...web,
            domainExpiresAt: web.domainExpiresAt?.toISOString() ?? null,
            nextChargeAt: web.nextChargeAt?.toISOString() ?? null,
          }}
        />
      </div>
    </Shell>
  );
}
