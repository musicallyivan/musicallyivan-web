# Musically Ivan Web

Web de Musically Ivan construida con Astro.

## Desarrollo local

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Variables de entorno

Copia `.env.example` a `.env` en local y configura:

```env
YOUTUBE_API_KEY=
PUBLIC_SITE_URL=https://musicallyivan-web.vercel.app
YOUTUBE_CHANNEL_ID=
PUBLIC_ADMIN_EMAIL=admin@musicallyivan.local
```

En Vercel hay que añadir esas mismas variables en Project Settings > Environment Variables.

## Supabase

1. Abre Supabase > SQL Editor.
2. Pega y ejecuta el contenido de `supabase/schema.sql`.
3. En Authentication > Providers activa Email.
4. Para Twitch, crea la app OAuth en Twitch y activa Twitch en Supabase Auth Providers.
5. En Authentication > URL Configuration añade tu URL de Vercel como Site URL y Redirect URL.

## Despliegue en Vercel

1. Sube este repositorio a GitHub.
2. Entra en Vercel y selecciona `Add New... > Project`.
3. Importa el repositorio de GitHub.
4. Framework preset: `Astro`.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Añade las variables de entorno.
8. Deploy.

## Nota

La comunidad, login, followers, visitas y panel admin funcionan ahora en modo local con `localStorage`.
Para producción real habrá que conectar autenticación, base de datos y envío de correos.
