"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="btn-danger-ghost"
      onClick={async () => {
        if (!confirm("¿Eliminar esta web?")) return;
        setLoading(true);
        await fetch(`/api/webs/${id}`, { method: "DELETE" });
        router.push("/");
        router.refresh();
      }}
      disabled={loading}
    >
      {loading ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
