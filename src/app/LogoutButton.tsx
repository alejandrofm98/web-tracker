"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="btn-ghost"
      style={{ marginLeft: "auto", padding: "6px 12px", fontSize: 12.5 }}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}
