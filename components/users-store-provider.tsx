"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types/user";

type UsersStoreContextValue = {
  users: User[] | null;
  setUsers: (users: User[]) => void;
  upsertUser: (user: User) => void;
  removeUser: (id: number) => User | null;
  restoreUser: (user: User) => void;
  findUser: (id: number) => User | null;
};

const UsersStoreContext = createContext<UsersStoreContextValue | null>(null);

type UsersStoreProviderProps = Readonly<{
  children: ReactNode;
}>;

export function UsersStoreProvider({ children }: UsersStoreProviderProps) {
  const [users, setUsersState] = useState<User[] | null>(null);

  const setUsers = useCallback((nextUsers: User[]) => {
    setUsersState(nextUsers);
  }, []);

  const upsertUser = useCallback((user: User) => {
    setUsersState((current) => {
      if (!current) {
        return current;
      }

      const exists = current.some((item) => item.id === user.id);
      return exists ? current.map((item) => (item.id === user.id ? user : item)) : [...current, user];
    });
  }, []);

  const removeUser = useCallback(
    (id: number) => {
      const existing = users?.find((user) => user.id === id) ?? null;
      setUsersState((current) => current?.filter((user) => user.id !== id) ?? current);
      return existing;
    },
    [users],
  );

  const restoreUser = useCallback((user: User) => {
    setUsersState((current) => {
      if (!current) {
        return [user];
      }

      if (current.some((item) => item.id === user.id)) {
        return current.map((item) => (item.id === user.id ? user : item));
      }

      return [...current, user].sort((a, b) => a.id - b.id);
    });
  }, []);

  const findUser = useCallback(
    (id: number) => users?.find((user) => user.id === id) ?? null,
    [users],
  );

  const value = useMemo(
    () => ({ users, setUsers, upsertUser, removeUser, restoreUser, findUser }),
    [findUser, removeUser, restoreUser, setUsers, upsertUser, users],
  );

  return <UsersStoreContext.Provider value={value}>{children}</UsersStoreContext.Provider>;
}

export function useUsersStore() {
  const context = useContext(UsersStoreContext);

  if (!context) {
    throw new Error("useUsersStore must be used inside UsersStoreProvider");
  }

  return context;
}
