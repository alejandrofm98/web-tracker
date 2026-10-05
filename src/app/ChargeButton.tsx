"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export default function ChargeButton({ id, compact }: { id: string; compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function mark() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/webs/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chargeStatus: "cobrado" }),
      });
      if (!res.ok) throw new Error("No se pudo guardar");
      router.refresh();
    } catch {
      setError("No se pudo guardar el cobro. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <span className="charge-action"><button
        className="icon-btn accent"
        title="Marcar cobrado"
        aria-label="Marcar cobrado"
        disabled={loading}
        onClick={mark}
      >
        <Check size={15} />
      </button>{error && <span role="alert" className="form-error">{error}</span>}</span>
    );
  }

  return (
    <span className="charge-action"><button className="btn-primary" disabled={loading} onClick={mark}>
      <Check size={15} />
      {loading ? "Marcando…" : "Marcar cobrado"}
    </button>{error && <span role="alert" className="form-error">{error}</span>}</span>
  );
}
