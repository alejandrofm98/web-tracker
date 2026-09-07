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
    <main className="login-wrap">
      <form onSubmit={onSubmit} className="login-card">
        <span className="brand-mark" style={{ width: 36, height: 36, fontSize: 17 }}>
          W
        </span>
        <h1>Web Tracker</h1>
        <p>Acceso privado. Introduce tus credenciales.</p>
        <label className="field">
          <span>Usuario</span>
          <input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" className="input" />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            className="input"
          />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
