import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-surface">
      <p className="font-serif text-8xl sm:text-9xl font-black text-primary">
        404
      </p>
      <h1 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface mt-4 mb-2">
        Page Not Found
      </h1>
      <p className="text-on-surface-variant text-center max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block rounded-full bg-primary px-8 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-on-primary transition-colors hover:bg-primary-hover"
      >
        Back to Home
      </Link>
    </main>
  );
}
