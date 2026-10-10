"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputDateValue } from "@/lib/format";

export type WebInitial = {
  id?: string;
  name?: string;
  url?: string;
  clientName?: string;
  clientContact?: string;
  status?: string;
  domainProvider?: string;
  domainExpiresAt?: string | null;
  domainCost?: number | null;
  domainAutoRenew?: boolean;
  hostingProvider?: string;
  hostingPlan?: string;
  ownCost?: number | null;
  clientPrice?: number | null;
  billingPeriod?: string;
  nextChargeAt?: string | null;
  chargeStatus?: string;
  stack?: string;
  repoUrl?: string;
  credentialsHint?: string;
  envHint?: string;
  notes?: string;
};

export default function WebForm({ initial }: { initial?: WebInitial }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(initial?.id);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => {
      payload[k] = typeof v === "string" ? v : "";
    });
    payload.domainAutoRenew = fd.get("domainAutoRenew") === "on";
    try {
      const res = await fetch(isEdit ? `/api/webs/${initial!.id}` : "/api/webs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Error al guardar");
        return;
      }
      router.push(isEdit ? `/webs/${initial!.id}` : "/");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const v = (k: keyof WebInitial, fallback = "") =>
    (initial?.[k] as string | undefined) ?? fallback;

  return (
    <form onSubmit={onSubmit} className="form-shell">
      <section className="panel">
        <h2 className="panel-title">Básicos</h2>
        <div className="form-grid">
          <label className="field">
            <span>Nombre *</span>
            <input name="name" required defaultValue={v("name")} className="input" />
          </label>
          <label className="field">
            <span>URL *</span>
            <input name="url" required defaultValue={v("url")} placeholder="https://…" className="input" />
          </label>
          <label className="field">
            <span>Estado</span>
            <select name="status" defaultValue={v("status", "activa")} className="input">
              <option value="activa">activa</option>
              <option value="pendiente">pendiente</option>
              <option value="baja">baja</option>
            </select>
          </label>
          <label className="field">
            <span>Cliente</span>
            <input name="clientName" defaultValue={v("clientName")} className="input" />
          </label>
          <label className="field">
            <span>Contacto cliente</span>
            <input name="clientContact" defaultValue={v("clientContact")} className="input" />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Dominio (opcional)</h2>
        <p className="cell-sub">Puedes dejarlo vacío si no gestionas el dominio. Si añades la caducidad, recibirás avisos.</p>
        <div className="form-grid">
          <label className="field">
            <span>Proveedor</span>
            <input name="domainProvider" defaultValue={v("domainProvider")} className="input" />
          </label>
          <label className="field">
            <span>Caduca</span>
            <input
              type="date"
              name="domainExpiresAt"
              defaultValue={inputDateValue(initial?.domainExpiresAt ?? null)}
              className="input"
            />
          </label>
          <label className="field">
            <span>Coste del dominio para ti (€ por renovación)</span>
            <input
              type="number"
              step="0.01"
              name="domainCost"
              defaultValue={initial?.domainCost ?? ""}
              className="input"
            />
          </label>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 12 }}>
          <input type="checkbox" name="domainAutoRenew" defaultChecked={initial?.domainAutoRenew ?? false} />
          Auto-renovación activada
        </label>
      </section>

      <section className="panel">
        <h2 className="panel-title">Hosting</h2>
        <p className="cell-sub">Proveedor, plan y coste para ti. Si el hosting es gratis, indica 0 €.</p>
        <div className="form-grid">
          <label className="field">
            <span>Proveedor hosting</span>
            <input name="hostingProvider" defaultValue={v("hostingProvider")} className="input" />
          </label>
          <label className="field">
            <span>Plan</span>
            <input name="hostingPlan" defaultValue={v("hostingPlan")} className="input" />
          </label>
          <label className="field">
            <span>Coste de hosting para ti (€)</span>
            <input type="number" step="0.01" name="ownCost" defaultValue={initial?.ownCost ?? (isEdit ? "" : 0)} className="input" />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Cobros al cliente</h2>
        <p className="cell-sub">Cuota por dominio y hosting. La fecha de cobro es independiente de la renovación del dominio.</p>
        <div className="form-grid">
          <label className="field">
            <span>Cuota al cliente (€)</span>
            <input
              type="number"
              step="0.01"
              name="clientPrice"
              defaultValue={initial?.clientPrice ?? (isEdit ? "" : 50)}
              className="input"
            />
          </label>
          <label className="field">
            <span>Periodicidad</span>
            <select name="billingPeriod" defaultValue={v("billingPeriod", "anual")} className="input">
              <option value="mensual">mensual</option>
              <option value="anual">anual</option>
            </select>
          </label>
          <label className="field">
            <span>Próximo cobro</span>
            <input
              type="date"
              name="nextChargeAt"
              defaultValue={inputDateValue(initial?.nextChargeAt ?? null)}
              className="input"
            />
          </label>
          <label className="field">
            <span>Estado cobro</span>
            <select name="chargeStatus" defaultValue={v("chargeStatus", "pendiente")} className="input">
              <option value="pendiente">pendiente</option>
              <option value="cobrado">cobrado</option>
              <option value="sin-cobro">No se cobra</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Técnico y notas</h2>
        <div className="form-grid">
          <label className="field">
            <span>Stack</span>
            <input name="stack" defaultValue={v("stack")} className="input" />
          </label>
        </div>
        <label className="field technical-field">
          <span>Repositorios</span>
          <textarea name="repoUrl" defaultValue={v("repoUrl")} rows={3} placeholder={"https://github.com/organizacion/frontend\nhttps://github.com/organizacion/backend"} aria-describedby="repos-help" className="input" />
          <small id="repos-help" className="cell-sub">Una URL por línea. Puedes añadir frontend, backend y otros repositorios.</small>
        </label>
        <label className="field technical-field">
          <span>Credenciales en Bitwarden</span>
          <textarea name="credentialsHint" defaultValue={v("credentialsHint")} rows={3} placeholder={"Colección o carpeta: …\nEntrada: …\nAcceso: panel, base de datos, correo…"} aria-describedby="credentials-help" className="input" />
          <small id="credentials-help" className="cell-sub">Indica la colección o carpeta y el nombre exacto de cada entrada. Para enlazarla, abre el elemento en la bóveda web de Bitwarden y pega aquí la URL completa: será clicable en la ficha. Sin contraseñas ni tokens.</small>
        </label>
        <label className="field technical-field">
          <span>Dónde está el .env y la configuración</span>
          <textarea name="envHint" defaultValue={v("envHint")} rows={3} placeholder={"Local: /ruta/al/proyecto/.env.local\nProducción: servicio → Environment\nCopia en Bitwarden: nombre de la nota o adjunto"} aria-describedby="env-help" className="input" />
          <small id="env-help" className="cell-sub">Indica la ruta por entorno y la carpeta o colección, entrada y adjunto del .env en Bitwarden. Puedes pegar el enlace de la entrada. No pegues el contenido del archivo.</small>
        </label>
        <label className="field" style={{ display: "block", marginTop: 12 }}>
          <span>Notas</span>
          <textarea name="notes" defaultValue={v("notes")} rows={4} className="input" />
        </label>
      </section>

      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear web"}
        </button>
        <a href={isEdit ? `/webs/${initial!.id}` : "/"} className="cancel">
          Cancelar
        </a>
      </div>
    </form>
  );
}
