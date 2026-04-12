import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLogin = request.nextUrl.pathname === "/admin/login";

  // Admin routes (except /admin/login) require authenticated admin
  if (isAdminRoute && !isAdminLogin) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Check admin role via RPC
    const { data: isAdmin } = await supabase.rpc("is_admin");

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "not_admin");
      return NextResponse.redirect(url);
    }
  }

  // If already authenticated admin visiting /admin/login, redirect to dashboard
  if (isAdminLogin) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (isAdmin) {
        const redirect = request.nextUrl.searchParams.get("redirect");
        const url = request.nextUrl.clone();
        url.pathname = redirect ?? "/admin/bookings";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
