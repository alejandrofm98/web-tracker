import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import WebForm from "../WebForm";
import DeleteButton from "./DeleteButton";

export const revalidate = 0;

export default async function DetailPage({ params }: { params: { id: string } }) {
  const web = await prisma.website.findUnique({ where: { id: params.id } });
  if (!web) notFound();

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
      <p style={{ margin: "0 0 12px", display: "flex", gap: 16, alignItems: "center" }}>
        <Link href="/" style={{ color: "oklch(0.72 0.14 230)" }}>
          ← Volver
        </Link>
        <span style={{ marginLeft: "auto" }}>
          <DeleteButton id={web.id} />
        </span>
      </p>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{web.name}</h1>
      <p style={{ margin: "0 0 16px", color: "oklch(0.70 0.008 260)" }}>{web.url}</p>
      <WebForm
        initial={{
          ...web,
          domainExpiresAt: web.domainExpiresAt?.toISOString() ?? null,
          nextChargeAt: web.nextChargeAt?.toISOString() ?? null,
        }}
      />
    </main>
  );
}
