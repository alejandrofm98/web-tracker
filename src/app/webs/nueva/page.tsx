import Link from "next/link";
import Shell from "../../Shell";
import WebForm from "../WebForm";

export default function NuevaPage() {
  return (
    <Shell>
      <Link href="/" className="backlink">
        ← Volver
      </Link>
      <h1 className="page-title">Nueva web</h1>
      <p className="page-sub">Rellena los datos que tengas, el resto lo completas luego.</p>
      <WebForm />
    </Shell>
  );
}
