import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="ink-gradient flex-1 px-6 py-10 md:px-12">
      <section className="paper-card mx-auto w-full max-w-md p-6">
        <h1 className="font-serif text-4xl">Iniciar sesion</h1>
        <LoginForm />
        <p className="mt-4 text-sm text-[color:var(--ink-soft)]">
          No tienes cuenta? <Link href="/registro" className="font-semibold">Crear cuenta</Link>
        </p>
      </section>
    </main>
  );
}
