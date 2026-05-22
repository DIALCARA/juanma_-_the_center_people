"use client";

import useSWR from "swr";
import { get } from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface MeResponse {
  success: boolean;
  data: User;
}

export function useAuth() {
  const { data, error, isLoading } = useSWR<MeResponse>(
    "/api/auth/me",
    get,
    { shouldRetryOnError: false },
  );

  return {
    user: data?.data ?? null,
    isLoading,
    isAuthenticated: !error && !!data?.data,
  };
}
