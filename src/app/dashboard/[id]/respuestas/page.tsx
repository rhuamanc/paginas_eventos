import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { getInvitationByIdForOwner, listRsvps } from "@/lib/storage";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RespuestasPage({ params }: Props) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const invitation = await getInvitationByIdForOwner(id, session.user.id);

  if (!invitation) {
    notFound();
  }

  const rsvps = await listRsvps(id);

  return (
    <main className="px-6 py-8 md:px-12">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl">RSVP de {invitation.title}</h1>
            <p className="text-[color:var(--ink-soft)]">Total respuestas: {rsvps.length}</p>
          </div>
          <Link href="/dashboard" className="rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold">
            Volver
          </Link>
        </div>

        <div className="space-y-3">
          {rsvps.length === 0 ? <p className="paper-card p-4">Aun no hay confirmaciones.</p> : null}
          {rsvps.map((item) => (
            <article key={item.id} className="paper-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{item.name}</h2>
                <span className="text-sm text-[color:var(--ink-soft)]">{item.attendees} asistentes</span>
              </div>
              {item.message ? <p className="mt-2 text-[color:var(--ink-soft)]">{item.message}</p> : null}
              <p className="mt-2 text-xs text-[color:var(--ink-soft)]">{new Date(item.createdAt).toLocaleString()}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
