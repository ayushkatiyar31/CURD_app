import Link from "next/link";
import type { ReactNode } from "react";

type PageShellProps = Readonly<{
  children: ReactNode;
}>;

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            JSONPlaceholder
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Users CRUD</h1>
        </div>
        <Link
          href="/users"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Users
        </Link>
      </header>
      {children}
    </main>
  );
}
