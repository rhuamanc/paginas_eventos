# Invita Studio

Plataforma web para crear paginas de invitaciones muy personalizables (bodas, cumpleanos, baby shower, graduacion, etc.) con editor visual en tiempo real.

## Lo que ya incluye

- Landing moderna y responsive.
- Dashboard para ver invitaciones creadas.
- Dashboard privado por usuario autenticado.
- Editor visual con:
  - Insercion de imagenes por URL.
  - Insercion de imagenes por archivo local.
  - Arrastrar elementos libremente en el lienzo.
  - Capas avanzadas: bloquear, duplicar, enviar al frente/atras.
  - Textos editables y rotables.
  - Modo dibujo para trazar a mano encima de la tarjeta.
  - Preview en vivo del resultado.
- Vista publica por slug para compartir invitaciones.
- Cuenta regresiva del evento.
- Formulario RSVP publico.
- Vista privada de respuestas RSVP desde dashboard.
- API routes para auth, invitaciones y RSVP.

## Stack

- Next.js 16 + App Router
- TypeScript
- Tailwind CSS v4
- MongoDB Atlas + Mongoose
- NextAuth (credenciales)

## Ejecutar en local

1. Instala dependencias:

```bash
npm install
```

2. Copia variables de entorno:

```bash
copy .env.example .env.local
```

3. Configura en `.env.local`:

- `MONGO_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

4. Inicia el proyecto:

```bash
npm run dev
```

5. Abre:

http://localhost:3000

## Scripts

- `npm run dev`: entorno de desarrollo.
- `npm run build`: build de produccion.
- `npm run start`: correr build localmente.
- `npm run lint`: validacion de codigo.

## Despliegue en Vercel

1. Sube este repositorio a GitHub.
2. En Vercel, crea un proyecto importando el repo.
3. Configura variables en Vercel Project Settings > Environment Variables:
  - `MONGO_URI`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (tu dominio final)
   - `NEXT_PUBLIC_BASE_URL` con tu dominio final.
4. Ejecuta deploy.

## Flujo sugerido de uso

1. Crea cuenta en `/registro` e inicia sesion.
2. Ve a `/editor`.
3. Crea tu tarjeta con imagenes, drag, capas y dibujo.
4. Guarda la invitacion.
5. Copia el link publico generado (`/i/tu-slug`).
6. Revisa confirmaciones en tu dashboard privado.
