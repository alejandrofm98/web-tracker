"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      if (!res.ok) {
        setError("Usuario o contraseña incorrectos");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "oklch(0.21 0.008 260)",
        color: "oklch(0.93 0.005 260)",
        padding: 16,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "oklch(0.25 0.009 260)",
          border: "1px solid oklch(0.34 0.008 260)",
          borderRadius: 10,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Web Tracker</h1>
        <p style={{ margin: 0, color: "oklch(0.70 0.008 260)", fontSize: 14 }}>
          Acceso privado. Introduce tus credenciales.
        </p>
        <label style={{ fontSize: 13 }}>
          Usuario
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            style={inputStyle}
          />
        </label>
        <label style={{ fontSize: 13 }}>
          Contraseña
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            style={inputStyle}
          />
        </label>
        {error && (
          <p role="alert" style={{ color: "oklch(0.65 0.18 25)", fontSize: 13, margin: 0 }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "oklch(0.72 0.14 230)",
            color: "oklch(0.21 0.008 260)",
            border: 0,
            borderRadius: 8,
            padding: "10px 14px",
            fontWeight: 700,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  background: "oklch(0.21 0.008 260)",
  border: "1px solid oklch(0.34 0.008 260)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "inherit",
  boxSizing: "border-box",
};
