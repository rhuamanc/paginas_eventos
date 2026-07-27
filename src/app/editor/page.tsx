import InvitationEditor from "@/components/InvitationEditor";
import { getAuthSession } from "@/lib/auth";
import { getInvitationByIdForOwner } from "@/lib/storage";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function EditorPage({ searchParams }: Props) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await searchParams;
  const initial = id ? await getInvitationByIdForOwner(id, session.user.id) : null;
  const safeInitial = initial ? JSON.parse(JSON.stringify(initial)) : null;

  return (
    <main className="px-6 py-8 md:px-12">
      <section className="mx-auto w-full max-w-7xl">
        <h1 className="mb-2 font-serif text-4xl">Crear pagina de invitacion</h1>
        <p className="mb-6 text-[color:var(--ink-soft)]">
          Personaliza cada seccion de tu pagina: portada, galeria, mapa, RSVP y mas. El preview se actualiza en tiempo real.
        </p>
        <InvitationEditor initial={safeInitial ?? undefined} />
      </section>
    </main>
  );
}
