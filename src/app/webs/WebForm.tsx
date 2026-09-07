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
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
      <Section title="Básicos">
        <Field label="Nombre *">
          <input name="name" required defaultValue={v("name")} style={input} />
        </Field>
        <Field label="URL *">
          <input name="url" required defaultValue={v("url")} placeholder="https://…" style={input} />
        </Field>
        <div style={row}>
          <Field label="Cliente">
            <input name="clientName" defaultValue={v("clientName")} style={input} />
          </Field>
          <Field label="Contacto cliente">
            <input name="clientContact" defaultValue={v("clientContact")} style={input} />
          </Field>
        </div>
        <Field label="Estado">
          <select name="status" defaultValue={v("status", "activa")} style={input}>
            <option value="activa">activa</option>
            <option value="pendiente">pendiente</option>
            <option value="baja">baja</option>
          </select>
        </Field>
      </Section>

      <Section title="Dominio">
        <div style={row}>
          <Field label="Proveedor">
            <input name="domainProvider" defaultValue={v("domainProvider")} style={input} />
          </Field>
          <Field label="Caduca">
            <input
              type="date"
              name="domainExpiresAt"
              defaultValue={inputDateValue(initial?.domainExpiresAt ?? null)}
              style={input}
            />
          </Field>
        </div>
        <div style={row}>
          <Field label="Coste renovación (€)">
            <input
              type="number"
              step="0.01"
              name="domainCost"
              defaultValue={initial?.domainCost ?? ""}
              style={input}
            />
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, paddingTop: 22 }}>
            <input type="checkbox" name="domainAutoRenew" defaultChecked={initial?.domainAutoRenew ?? false} />
            Auto-renovación
          </label>
        </div>
      </Section>

      <Section title="Hosting y cobros">
        <div style={row}>
          <Field label="Proveedor hosting">
            <input name="hostingProvider" defaultValue={v("hostingProvider")} style={input} />
          </Field>
          <Field label="Plan">
            <input name="hostingPlan" defaultValue={v("hostingPlan")} style={input} />
          </Field>
        </div>
        <div style={row}>
          <Field label="Me cuesta (€)">
            <input type="number" step="0.01" name="ownCost" defaultValue={initial?.ownCost ?? ""} style={input} />
          </Field>
          <Field label="Le cobro (€)">
            <input
              type="number"
              step="0.01"
              name="clientPrice"
              defaultValue={initial?.clientPrice ?? ""}
              style={input}
            />
          </Field>
        </div>
        <div style={row}>
          <Field label="Periodicidad">
            <select name="billingPeriod" defaultValue={v("billingPeriod", "anual")} style={input}>
              <option value="mensual">mensual</option>
              <option value="anual">anual</option>
            </select>
          </Field>
          <Field label="Próximo cobro">
            <input
              type="date"
              name="nextChargeAt"
              defaultValue={inputDateValue(initial?.nextChargeAt ?? null)}
              style={input}
            />
          </Field>
          <Field label="Estado cobro">
            <select name="chargeStatus" defaultValue={v("chargeStatus", "pendiente")} style={input}>
              <option value="pendiente">pendiente</option>
              <option value="cobrado">cobrado</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Técnico y notas">
        <div style={row}>
          <Field label="Stack">
            <input name="stack" defaultValue={v("stack")} style={input} />
          </Field>
          <Field label="Repo">
            <input name="repoUrl" defaultValue={v("repoUrl")} placeholder="https://…" style={input} />
          </Field>
        </div>
        <Field label="Dónde están las credenciales (pista, nunca passwords)">
          <input name="credentialsHint" defaultValue={v("credentialsHint")} style={input} />
        </Field>
        <Field label="Notas">
          <textarea name="notes" defaultValue={v("notes")} rows={4} style={input} />
        </Field>
      </Section>

      {error && (
        <p role="alert" style={{ color: "oklch(0.65 0.18 25)", fontSize: 13, margin: 0 }}>
          {error}
        </p>
      )}
      <div>
        <button type="submit" disabled={loading} style={primaryBtn}>
          {loading ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear web"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        border: "1px solid oklch(0.34 0.008 260)",
        borderRadius: 10,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "oklch(0.70 0.008 260)" }}>{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 13, flex: 1, minWidth: 0 }}>
      {label}
      <span style={{ display: "block", marginTop: 4 }}>{children}</span>
    </label>
  );
}

const row: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };
const input: React.CSSProperties = {
  width: "100%",
  background: "oklch(0.21 0.008 260)",
  border: "1px solid oklch(0.34 0.008 260)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "inherit",
  boxSizing: "border-box",
  fontSize: 14,
};
const primaryBtn: React.CSSProperties = {
  background: "oklch(0.72 0.14 230)",
  color: "oklch(0.21 0.008 260)",
  border: 0,
  borderRadius: 8,
  padding: "10px 18px",
  fontWeight: 700,
  cursor: "pointer",
};
