"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        if (!confirm("¿Eliminar esta web?")) return;
        setLoading(true);
        await fetch(`/api/webs/${id}`, { method: "DELETE" });
        router.push("/");
        router.refresh();
      }}
      disabled={loading}
      style={{
        background: "transparent",
        color: "oklch(0.65 0.18 25)",
        border: "1px solid oklch(0.65 0.18 25)",
        borderRadius: 8,
        padding: "8px 14px",
        cursor: "pointer",
      }}
    >
      {loading ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
