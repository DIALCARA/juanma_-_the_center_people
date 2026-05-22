import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

const modules = [
  { href: "/dashboard/configuracion", label: "Configuración del sitio", desc: "Nombre, redes, SEO" },
  { href: "/dashboard/secciones", label: "Secciones", desc: "Habilitar / deshabilitar secciones" },
  { href: "/dashboard/banda", label: "La Banda", desc: "Bio, integrantes, datos rápidos" },
  { href: "/dashboard/musica", label: "Música", desc: "Discografía y lanzamientos" },
  { href: "/dashboard/media", label: "Multimedia", desc: "Fotos, videos y reels" },
  { href: "/dashboard/fechas", label: "Fechas", desc: "Próximas presentaciones" },
  { href: "/dashboard/prensa", label: "Prensa / EPK", desc: "Citas y material de prensa" },
  { href: "/dashboard/rider", label: "Rider técnico", desc: "Requerimientos técnicos" },
  { href: "/dashboard/descargas", label: "Descargas", desc: "Archivos descargables" },
  { href: "/dashboard/mensajes", label: "Mensajes", desc: "Contactos recibidos" },
  { href: "/dashboard/solicitudes", label: "Solicitudes de descarga", desc: "Aprobar / rechazar" },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Panel de administración"
        description="Gestioná todo el contenido del sitio de Juanma & The Center People."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="card hover:border-neutral-600 transition-colors group block"
          >
            <h2 className="font-semibold text-white group-hover:text-red-400 transition-colors text-sm mb-1">
              {mod.label}
            </h2>
            <p className="text-xs text-neutral-500">{mod.desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
