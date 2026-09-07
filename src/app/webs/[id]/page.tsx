import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Shell from "../../Shell";
import WebForm from "../WebForm";
import DeleteButton from "./DeleteButton";
import ChargeButton from "../../ChargeButton";

export const revalidate = 0;

export default async function DetailPage({ params }: { params: { id: string } }) {
  const web = await prisma.website.findUnique({ where: { id: params.id } });
  if (!web) notFound();

  return (
    <Shell>
      <div className="row-between">
        <Link href="/" className="backlink" style={{ marginBottom: 0 }}>
          ← Volver
        </Link>
        <span style={{ display: "flex", gap: 10 }}>
          {web.chargeStatus === "pendiente" && <ChargeButton id={web.id} />}
          <DeleteButton id={web.id} />
        </span>
      </div>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        {web.name}
      </h1>
      <p className="page-sub">
        <a href={web.url} target="_blank" rel="noreferrer">
          {web.url}
        </a>
      </p>
      <WebForm
        initial={{
          ...web,
          domainExpiresAt: web.domainExpiresAt?.toISOString() ?? null,
          nextChargeAt: web.nextChargeAt?.toISOString() ?? null,
        }}
      />
    </Shell>
  );
}
