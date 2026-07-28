import Link from "next/link";

export default function Home() {
  return (
    <main className="ink-gradient flex-1 px-6 py-8 md:px-12 md:py-12">
      <section className="paper-card mx-auto grid w-full max-w-6xl gap-10 px-7 py-10 md:grid-cols-2 md:px-12 md:py-14">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-[#e7cabf] bg-[#fff1ea] px-3 py-1 text-sm font-semibold text-[#a33527]">
            Editor visual en tiempo real
          </p>
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">
            Crea invitaciones unicas con arrastrar, dibujar y previsualizar al instante.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[color:var(--ink-soft)]">
            Huaman Studio te permite disenar tarjetas para bodas, cumpleanos y cualquier evento con total libertad: sube imagenes, mueve elementos y comparte un link publico.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/editor"
              className="rounded-full bg-[color:var(--brand)] px-6 py-3 text-center font-semibold text-white transition hover:bg-[color:var(--brand-deep)]"
            >
              Crear mi invitacion
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-center font-semibold"
            >
              Ver dashboard
            </Link>
            <Link
              href="/registro"
              className="rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-center font-semibold"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
        <div className="paper-card p-4">
          <div className="h-full min-h-[340px] rounded-2xl border border-dashed border-[#d4b8aa] bg-gradient-to-br from-[#fff6ef] to-[#f8edd8] p-5">
            <h2 className="font-serif text-2xl">Tu diseno, tu estilo</h2>
            <ul className="mt-5 space-y-3 text-[color:var(--ink-soft)]">
              <li>- Inserta imagenes personalizadas por URL</li>
              <li>- Arrastra cada elemento en un lienzo libre</li>
              <li>- Dibuja trazos encima para detalles artisticos</li>
              <li>- Previsualiza exactamente como lo vera tu invitado</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
