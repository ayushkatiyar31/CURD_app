"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Pencil, Trash2, X } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { useToast } from "@/components/toast-provider";
import { useUsersStore } from "@/components/users-store-provider";
import { useUsersApi } from "@/hooks/use-users-api";
import type { User, UserUpdateInput } from "@/types/user";

function getErrorMessage(defaultMessage: string) {
  return defaultMessage;
}

export function UserDetails() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notify } = useToast();
  const { findUser, upsertUser, removeUser, restoreUser } = useUsersStore();
  const { getUser, updateUser, deleteUser } = useUsersApi();

  const userId = useMemo(() => Number(params.id), [params.id]);
  const isValidUserId = Number.isFinite(userId);
  const cachedUser = isValidUserId ? findUser(userId) : null;

  const [user, setUser] = useState<User | null>(cachedUser);
  const [draft, setDraft] = useState<UserUpdateInput>({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(isValidUserId && !cachedUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleError = isValidUserId ? error : "Invalid user id.";

  useEffect(() => {
    if (!isValidUserId) {
      return;
    }

    let isMounted = true;

    getUser(userId)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        const nextUser = cachedUser ? { ...data, ...cachedUser } : data;
        setUser(nextUser);
        setDraft({ name: nextUser.name, email: nextUser.email });
        upsertUser(nextUser);
        setError(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setError(getErrorMessage("Unable to load this user."));
        notify("Unable to load this user.", "error");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [cachedUser, getUser, isValidUserId, notify, upsertUser, userId]);

  useEffect(() => {
    if (searchParams.get("deleteError") === "1") {
      notify("Delete failed. The user was restored.", "error");
    }
  }, [notify, searchParams]);

  const beginEdit = () => {
    if (!user) {
      return;
    }

    setDraft({ name: user.name, email: user.email });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (user) {
      setDraft({ name: user.name, email: user.email });
    }
    setIsEditing(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const previousUser = user;
    const optimisticUser = { ...user, ...draft };

    setUser(optimisticUser);
    upsertUser(optimisticUser);
    setIsEditing(false);
    setIsSaving(true);
    setError(null);
    notify("User updated optimistically.");

    try {
      await updateUser(user.id, draft);
      notify("Update confirmed by API.");
    } catch {
      setUser(previousUser);
      upsertUser(previousUser);
      setDraft({ name: previousUser.name, email: previousUser.email });
      setError("Update failed. Previous user data was restored.");
      notify("Update failed. Rolled back changes.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(`Delete ${user.name}?`);
    if (!confirmed) {
      return;
    }

    const removedUser = removeUser(user.id) ?? user;
    setIsDeleting(true);
    notify("User deleted optimistically.");
    router.push("/users");

    try {
      await deleteUser(user.id);
      notify("Delete confirmed by API.");
    } catch {
      restoreUser(removedUser);
      notify("Delete failed. User restored.", "error");
      router.push(`/users/${user.id}?deleteError=1`);
    }
  };

  return (
    <PageShell>
      <section className="flex flex-col gap-4">
        <Link
          href="/users"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back to users
        </Link>

        {isLoading ? (
          <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading user...
          </div>
        ) : null}

        {visibleError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            {visibleError}
          </div>
        ) : null}

        {!isLoading && user ? (
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
                  User #{user.id}
                </p>
                <h2 className="mt-2 break-words text-2xl font-bold text-slate-950">{user.name}</h2>
                <p className="mt-1 break-words text-slate-600">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={beginEdit}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSaving || isDeleting}
                >
                  <Pencil aria-hidden className="size-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSaving || isDeleting}
                >
                  <Trash2 aria-hidden className="size-4" />
                  Delete
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="mt-6 grid gap-4 border-t border-slate-200 pt-5">
                <label className="grid gap-2 text-sm font-semibold text-slate-800">
                  Name
                  <input
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    className="h-11 rounded-md border border-slate-300 px-3 text-base font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-800">
                  Email
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                    className="h-11 rounded-md border border-slate-300 px-3 text-base font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    required
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSaving}
                  >
                    <Check aria-hidden className="size-4" />
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    <X aria-hidden className="size-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Username</dt>
                  <dd className="mt-1 text-slate-950">{user.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Phone</dt>
                  <dd className="mt-1 text-slate-950">{user.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Website</dt>
                  <dd className="mt-1 text-slate-950">{user.website}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Company</dt>
                  <dd className="mt-1 text-slate-950">{user.company.name}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-semibold text-slate-500">Address</dt>
                  <dd className="mt-1 text-slate-950">
                    {user.address.suite}, {user.address.street}, {user.address.city}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
