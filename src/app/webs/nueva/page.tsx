import Link from "next/link";
import WebForm from "../WebForm";

export default function NuevaPage() {
  return (
    <main
      style={{
        background: "oklch(0.21 0.008 260)",
        color: "oklch(0.93 0.005 260)",
        minHeight: "100vh",
        padding: "20px 24px",
        fontSize: 14,
      }}
    >
      <p style={{ margin: "0 0 12px" }}>
        <Link href="/" style={{ color: "oklch(0.72 0.14 230)" }}>
          ← Volver
        </Link>
      </p>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>Nueva web</h1>
      <WebForm />
    </main>
  );
}
