"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, RefreshCw } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { useToast } from "@/components/toast-provider";
import { useUsersStore } from "@/components/users-store-provider";
import { useUsersApi } from "@/hooks/use-users-api";

export function UsersList() {
  const { users, setUsers } = useUsersStore();
  const { getUsers } = useUsersApi();
  const { notify } = useToast();
  const [isLoading, setIsLoading] = useState(users === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (users !== null) {
      return;
    }

    let isMounted = true;

    getUsers()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setUsers(data);
        setError(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setError("Unable to load users. Please try again.");
        notify("Unable to load users.", "error");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getUsers, notify, setUsers, users]);

  const refreshUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
      setError(null);
      notify("Users refreshed.");
    } catch {
      setError("Unable to refresh users. Please try again.");
      notify("Unable to refresh users.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">All Users</h2>
            <p className="mt-1 text-sm text-slate-600">Fetched from GET /users.</p>
          </div>
          <button
            type="button"
            onClick={refreshUsers}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            <RefreshCw aria-hidden className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading users...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && users ? (
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <ul className="divide-y divide-slate-200">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">{user.name}</p>
                    <p className="truncate text-sm text-slate-600">{user.email}</p>
                  </div>
                  <Link
                    href={`/users/${user.id}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    <Eye aria-hidden className="size-4" />
                    View
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
