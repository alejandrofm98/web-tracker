"use client";

import { useState } from "react";

export default function TestNotifyButton() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={async () => {
          setLoading(true);
          setMsg("");
          try {
            const res = await fetch("/api/cron");
            const data = await res.json().catch(() => ({}));
            setMsg(res.ok ? `Revisadas ${data.checked}, avisos ${data.notified}` : "Error");
          } catch {
            setMsg("Error de conexión");
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        style={{
          background: "transparent",
          color: "oklch(0.70 0.008 260)",
          border: "1px solid oklch(0.34 0.008 260)",
          borderRadius: 8,
          padding: "8px 14px",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Comprobando…" : "Probar aviso"}
      </button>
      {msg && <span style={{ fontSize: 12, color: "oklch(0.70 0.008 260)" }}>{msg}</span>}
    </span>
  );
}
