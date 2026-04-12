/**
 * Admin user creation script
 *
 * Creates the first admin user in Supabase Auth and upserts a profile
 * row so the is_admin() SQL function returns true for that user.
 *
 * Idempotent: safe to run multiple times. If the user already exists,
 * it only ensures the profile row has role='admin'.
 *
 * Usage:
 *   ADMIN_EMAIL=x ADMIN_PASSWORD=y npx tsx scripts/create-admin.ts
 *
 * Required env (in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error(
    "ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

if (!email || !password) {
  console.error(
    "ERROR: Missing ADMIN_EMAIL or ADMIN_PASSWORD env vars. Pass them inline:\n" +
      "  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret npx tsx scripts/create-admin.ts",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Check if user already exists
  const { data: existingUsers, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Failed to list users:", listError);
    process.exit(1);
  }

  const existing = existingUsers?.users?.find((u) => u.email === email);

  let userId: string;

  if (existing) {
    console.log(`User ${email} already exists (${existing.id})`);
    userId = existing.id;
  } else {
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError || !newUser?.user) {
      console.error("Failed to create user:", createError);
      process.exit(1);
    }

    console.log(`Created user ${email} (${newUser.user.id})`);
    userId = newUser.user.id;
  }

  // Upsert profile with admin role
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id" });

  if (profileError) {
    console.error("Failed to upsert profile:", profileError);
    process.exit(1);
  }

  console.log(`Admin profile set for ${email}. Done.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
