import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export default function RegistroPage() {
  return (
    <main className="ink-gradient flex-1 px-6 py-10 md:px-12">
      <section className="paper-card mx-auto w-full max-w-md p-6">
        <h1 className="font-serif text-4xl">Crear cuenta</h1>
        <RegisterForm />
        <p className="mt-4 text-sm text-[color:var(--ink-soft)]">
          Ya tienes cuenta? <Link href="/login" className="font-semibold">Iniciar sesion</Link>
        </p>
      </section>
    </main>
  );
}
