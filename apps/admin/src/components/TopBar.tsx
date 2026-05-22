"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { post } from "@/lib/api";

export default function TopBar() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await post("/api/auth/logout");
    } finally {
      router.push("/login");
    }
  }

  return (
    <header className="h-12 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-xs text-neutral-500">{user.email}</span>
        )}
        <button
          onClick={handleLogout}
          className="btn-ghost text-xs"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
