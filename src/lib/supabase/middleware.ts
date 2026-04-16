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

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLogin = request.nextUrl.pathname === "/admin/login";

  // Admin routes (except /admin/login) require an authenticated admin user
  if (isAdminRoute && !isAdminLogin) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
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
