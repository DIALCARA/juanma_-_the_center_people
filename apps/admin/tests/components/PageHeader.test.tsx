import { render, screen } from "@testing-library/react";
import PageHeader from "@/components/ui/PageHeader";

describe("PageHeader", () => {
  it("muestra el título", () => {
    render(<PageHeader title="Configuración del sitio" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Configuración del sitio");
  });

  it("muestra la descripción cuando se provee", () => {
    render(<PageHeader title="Título" description="Descripción del módulo." />);
    expect(screen.getByText("Descripción del módulo.")).toBeInTheDocument();
  });

  it("no muestra descripción si no se provee", () => {
    render(<PageHeader title="Solo título" />);
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("renderiza el action cuando se provee", () => {
    render(
      <PageHeader
        title="Módulo"
        action={<button>+ Nuevo</button>}
      />
    );
    expect(screen.getByText("+ Nuevo")).toBeInTheDocument();
  });
});
