import { createClient } from "@/lib/supabase/server";

export default async function AdminAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-2xl font-bold text-on-surface uppercase mb-6">
        Account
      </h1>

      <div className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4 space-y-3">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
            Email
          </span>
          <p className="text-on-surface text-sm">{user?.email ?? "Unknown"}</p>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
            Role
          </span>
          <p className="text-on-surface text-sm">Admin</p>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
            User ID
          </span>
          <p className="text-on-surface-variant text-xs font-mono">
            {user?.id ?? "Unknown"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-on-surface-variant">
        To change your password, use Supabase Dashboard or contact the developer.
      </p>
    </div>
  );
}
