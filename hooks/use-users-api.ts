"use client";

import { useCallback } from "react";
import { api } from "@/lib/axios";
import type { User, UserUpdateInput } from "@/types/user";

export function useUsersApi() {
  const getUsers = useCallback(async () => {
    const response = await api.get<User[]>("/users");
    return response.data;
  }, []);

  const getUser = useCallback(async (id: number) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  }, []);

  const updateUser = useCallback(async (id: number, input: UserUpdateInput) => {
    const response = await api.put<User>(`/users/${id}`, input);
    return response.data;
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    await api.delete(`/users/${id}`);
  }, []);

  return { getUsers, getUser, updateUser, deleteUser };
}
