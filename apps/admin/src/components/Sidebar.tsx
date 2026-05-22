"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    label: "General",
    items: [
      { href: "/dashboard", label: "Inicio" },
      { href: "/dashboard/configuracion", label: "Configuración" },
      { href: "/dashboard/secciones", label: "Secciones" },
    ],
  },
  {
    label: "Contenido",
    items: [
      { href: "/dashboard/banda", label: "La Banda" },
      { href: "/dashboard/musica", label: "Música" },
      { href: "/dashboard/fechas", label: "Fechas" },
    ],
  },
  {
    label: "Multimedia",
    items: [
      { href: "/dashboard/media", label: "Fotos / Videos / Reels" },
      { href: "/dashboard/descargas", label: "Descargas" },
    ],
  },
  {
    label: "Prensa",
    items: [
      { href: "/dashboard/prensa", label: "Citas de prensa" },
      { href: "/dashboard/rider", label: "Rider técnico" },
    ],
  },
  {
    label: "Comunicación",
    items: [
      { href: "/dashboard/mensajes", label: "Mensajes" },
      { href: "/dashboard/solicitudes", label: "Solicitudes" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-neutral-900 border-r border-neutral-800 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-neutral-800">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">CMS Admin</p>
      </div>

      <nav className="flex-1 py-4 px-2" aria-label="Navegación principal">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 px-2 mb-1">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-2 py-1.5 text-sm rounded-sm transition-colors ${
                    isActive
                      ? "bg-red-900/30 text-red-400"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-xs block"
        >
          Ver sitio →
        </a>
      </div>
    </aside>
  );
}
