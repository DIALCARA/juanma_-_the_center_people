"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { post } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";
import PasswordInput from "@/components/ui/PasswordInput";

export default function PerfilPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    if (newPassword.length < 12) {
      setError("La nueva contraseña debe tener al menos 12 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await post("/api/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess("Contraseña actualizada. Serás redirigido al login...");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // El backend ya borró la cookie. Redirigimos al login en 2s.
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return null;

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Mi perfil"
        description="Datos de tu cuenta y cambio de contraseña."
      />

      <section className="mb-8 p-4 border border-neutral-800 bg-neutral-900/40">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">
          Datos
        </h2>
        <dl className="grid grid-cols-3 gap-y-2 text-sm">
          <dt className="text-neutral-500">Email</dt>
          <dd className="col-span-2 text-neutral-200">{user?.email ?? "—"}</dd>
          <dt className="text-neutral-500">Nombre</dt>
          <dd className="col-span-2 text-neutral-200">{user?.name ?? "—"}</dd>
          <dt className="text-neutral-500">Rol</dt>
          <dd className="col-span-2 text-neutral-200">{user?.role ?? "—"}</dd>
        </dl>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">
          Cambiar contraseña
        </h2>

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Contraseña actual" htmlFor="current-password" required>
            <PasswordInput
              id="current-password"
              value={currentPassword}
              onChange={setCurrentPassword}
              required
              autoComplete="current-password"
            />
          </FormField>

          <FormField label="Nueva contraseña" htmlFor="new-password" required>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={setNewPassword}
              required
              minLength={12}
              autoComplete="new-password"
              placeholder="Mínimo 12 caracteres"
            />
          </FormField>

          <FormField label="Confirmar nueva contraseña" htmlFor="confirm-password" required>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              autoComplete="new-password"
            />
          </FormField>

          <p className="text-xs text-neutral-500 mb-4">
            Al cambiar la contraseña se cerrará la sesión actual y tendrás que volver a iniciar sesión.
          </p>

          <button
            type="submit"
            disabled={submitting || !currentPassword || !newPassword || !confirmPassword}
            className="btn-primary"
          >
            {submitting ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </section>
    </div>
  );
}
