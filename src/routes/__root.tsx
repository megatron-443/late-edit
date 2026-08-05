import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SettingsProvider } from "@/lib/settings-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CartProvider } from "@/lib/cart-context";

function NotFoundComponent() {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <meta name="robots" content="noindex, nofollow" />
      <title>Page not found — LATE EDIT</title>
      <img
        src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1800&h=1200&q=80"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <div className="text-[0.7rem] tracking-[0.32em] uppercase text-white/70">Error 404</div>
        <h1 className="mt-6 font-display text-4xl md:text-6xl leading-[1.05] text-white text-balance max-w-[22ch]">
          This page has left the rail.
        </h1>
        <p className="mt-6 max-w-[46ch] text-sm md:text-base leading-relaxed text-white/75 text-balance">
          Every LATE EDIT piece is one-of-one — occasionally an address retires
          with the garment it held. The page you were looking for no longer
          exists, or was never cut.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="/shop"
            className="inline-flex items-center justify-center gap-3 min-w-[15rem] px-8 py-4 text-[0.7rem] tracking-[0.22em] uppercase text-black bg-white hover:bg-white/85 transition-colors"
          >
            Return to Selection →
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-3 min-w-[15rem] px-8 py-4 text-[0.7rem] tracking-[0.22em] uppercase text-white border border-white/40 hover:border-white transition-colors"
          >
            Back to Homepage
          </a>
        </div>
        <div className="mt-10 flex items-center gap-6 text-[0.65rem] tracking-[0.2em] uppercase text-white/55">
          <a href="/women" className="hover:text-white transition-colors">Women</a>
          <span aria-hidden className="opacity-40">·</span>
          <a href="/men" className="hover:text-white transition-colors">Men</a>
          <span aria-hidden className="opacity-40">·</span>
          <a href="/services" className="hover:text-white transition-colors">Client Services</a>
        </div>
      </div>
    </div>
  );
}


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="label-eyebrow">Signal Lost</div>
        <h1 className="mt-4 font-display text-4xl">This page didn't load.</h1>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="label-eyebrow border border-border px-6 py-3 hover:!text-foreground"
          >
            Try again
          </button>
          <a href="/" className="label-eyebrow border border-border px-6 py-3 hover:!text-foreground">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LATE EDIT" },
      { name: "description", content: "One-of-one avant-garde garments reconstructed from archive fabric. Explore the current LATE EDIT drop." },
      { property: "og:title", content: "LATE EDIT" },
      { property: "og:description", content: "One-of-one avant-garde garments reconstructed from archive fabric. Explore the current LATE EDIT drop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "LATE EDIT" },
      { name: "twitter:description", content: "One-of-one avant-garde garments reconstructed from archive fabric. Explore the current LATE EDIT drop." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/2d091742-49ac-4bb7-91ce-1e370ffdf178" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/2d091742-49ac-4bb7-91ce-1e370ffdf178" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 64x64" },
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "512x512" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem('late-edit-settings')||'{}');if(s.theme==='dark')document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <WishlistProvider>
          <CartProvider>
            <SiteHeader />
            <main className="min-h-screen">
              <Outlet />
            </main>
            <SiteFooter />
          </CartProvider>
        </WishlistProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
