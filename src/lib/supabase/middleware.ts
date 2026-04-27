import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Copy cookies from the Supabase response (which may contain refreshed auth
 * tokens) onto a new response (e.g. a redirect). Without this, the browser
 * keeps the old refresh token and subsequent requests fail with
 * "Invalid Refresh Token: Already Used".
 *
 * This is the single most important detail of the Supabase SSR middleware
 * pattern.
 */
function propagateAuthCookies(
  from: NextResponse,
  to: NextResponse,
): NextResponse {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
  return to;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: call getUser() on every request so the session is refreshed
  // uniformly and tokens rotate exactly once per request. Do NOT run other
  // supabase calls between createServerClient and this line.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  // /api/admin/signout is intentionally exempt: we want sign-out to succeed
  // even when the session is already invalid.
  const isAdminApi =
    pathname.startsWith("/api/admin") && pathname !== "/api/admin/signout";

  // Admin pages (except /admin/login) require an authenticated admin user
  if (isAdminPage && !isAdminLogin) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return propagateAuthCookies(supabaseResponse, NextResponse.redirect(url));
    }

    const { data: isAdmin } = await supabase.rpc("is_admin");

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "not_admin");
      return propagateAuthCookies(supabaseResponse, NextResponse.redirect(url));
    }
  }

  // Admin API routes: same auth, but return JSON 401 instead of redirecting
  // so future routes can rely on the gate without re-implementing the check.
  if (isAdminApi) {
    if (!user) {
      return propagateAuthCookies(
        supabaseResponse,
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      );
    }
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin) {
      return propagateAuthCookies(
        supabaseResponse,
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      );
    }
  }

  // If authenticated admin visits /admin/login, bounce to dashboard
  if (isAdminLogin && user) {
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin) {
      const redirectTo = request.nextUrl.searchParams.get("redirect");
      const url = request.nextUrl.clone();
      url.pathname = redirectTo ?? "/admin/bookings";
      url.search = "";
      return propagateAuthCookies(supabaseResponse, NextResponse.redirect(url));
    }
  }

  return supabaseResponse;
}
