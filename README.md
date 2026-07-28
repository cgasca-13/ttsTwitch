## Bot de Twitch para generar un TTS (Text to speech) para canales de Twitch

- En la app de escritorio con Electron, el TTS usa un backend local del propio proyecto basado en Edge TTS para mostrar más voces e idiomas.
- Su versión web funciona mejor en Edge o Chrome, puede que en otros navegadores no tengas voces disponibles o tengas menos, lo ideal es el navegador mencionado.

## Desktop

La app también puede ejecutarse como escritorio con Electron.

```bash
npm run dev:desktop
```

Para probar la versión exportada localmente:

```bash
npm run build
npm run start:desktop
```

Para generar el instalador de Windows:

```bash
npm run dist:desktop
```

El instalador se genera en `release/`.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
