# `@vallum/nextjs`

Next.js integration for Vallum's browser SDK and admission route. The default export path and the
explicit `@vallum/nextjs/client` path both resolve to a dedicated `"use client"`
boundary. They do not import admission handlers, secrets, or other Node-only
server code.

## Install

```sh
npm install @vallum/client @vallum/react @vallum/nextjs
```

Next.js 13.4+ and React 18+ are supported.

## App Router

Add the provider as deep in the tree as practical. A Server Component layout
can render this exported Client Component directly:

```tsx
// app/layout.tsx — Server Component
import { VallumProvider } from "@vallum/nextjs/client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <VallumProvider endpoint={process.env.NEXT_PUBLIC_APP_ORIGIN!}>
          {children}
        </VallumProvider>
      </body>
    </html>
  );
}
```

Only serializable props cross the Server-to-Client boundary. Set
`NEXT_PUBLIC_APP_ORIGIN` to the exact public origin serving this page, and
reverse-proxy Vallum's endpoints through it. The strict admission route rejects
a separate API origin. Never pass a secret, private admission key, or server
callback into the provider.

Use the hooks from a Client Component:

```tsx
"use client";

import { useVallum } from "@vallum/nextjs/client";

export function SecurePanel() {
  const { client, status, error, retry } = useVallum();

  if (status === "initializing") return <p>Connecting securely…</p>;
  if (status === "error") {
    return <button onClick={retry}>{error?.message ?? "Try again"}</button>;
  }

  return <button onClick={() => void client?.fetch("/api/protected")}>Load</button>;
}
```

`VallumRender`, `useVallumClient`, and `useVallumFetch` are also re-exported.
`NextVallumProvider` is an alias for teams that prefer a framework-specific
name.

## Pages Router

Wrap the application in `pages/_app.tsx`:

```tsx
import type { AppProps } from "next/app";
import { VallumProvider } from "@vallum/nextjs/client";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <VallumProvider endpoint={process.env.NEXT_PUBLIC_APP_ORIGIN!}>
      <Component {...pageProps} />
    </VallumProvider>
  );
}
```

See `@vallum/react` for lifecycle, retry, protected fetch, render-only value,
accessibility, and security-boundary details.

## Admission Route Handler

Keep the signing key in a Node.js Route Handler and import it only from the
explicit server entry. The two required callbacks deliberately stay owned by
the application: authenticate its normal session, then consume an atomic
issuance budget from shared storage.

```ts
// app/.well-known/vallum/admission/route.ts
import {
  admissionConfiguration,
  createVallumRouteHandler,
} from "@vallum/nextjs/server";
import { auth } from "@/lib/auth";
import { admissionBudgets } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createVallumRouteHandler({
  configuration: () => admissionConfiguration(),
  async authenticate(request) {
    const session = await auth(request);
    return session
      ? { subject: session.userId, scopes: session.vallumScopes }
      : null;
  },
  async rateLimit(_request, principal) {
    return admissionBudgets.consume(principal.subject, 20, "1m");
  },
});
```

`@vallum/nextjs/server` imports Next.js's `server-only` guard, so accidentally
pulling it into a Client Component fails the build. It requires the Node.js
runtime because Ed25519 signing keys must never enter an edge or browser
bundle. See `@vallum/admission` for configuration and security requirements.
