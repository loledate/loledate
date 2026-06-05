# Lol-edate

Matchmaking para jugadores de League of Legends.

## Setup

1. Instala [Node.js LTS](https://nodejs.org/)
2. Clona el repo e instala dependencias:

```bash
npm install
```

3. Copia `.env.example` a `.env` y pon tus claves de Supabase (Settings → API):

```
VITE_SUPABASE_URL=https://gwcuavpqvbrxpcclrovt.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

4. Ejecuta el SQL de `supabase/schema.sql` en el SQL Editor de Supabase
5. En Supabase → Authentication → Providers, activa **Email**
6. Arranca la app:

```bash
npm run dev
```

## Supabase

- Proyecto: `gwcuavpqvbrxpcclrovt`
- Auth: **solo usuario + contraseña** (sin correo)
- Ejecuta también `supabase/username-only-auth.sql`
- En Dashboard → Authentication → Email → **desactiva Confirm email**

## Flujo

1. Registro → `/register`
2. Login → `/login`
3. Completar perfil → `/profile`
4. Descubrir otros usuarios → `/discover`
