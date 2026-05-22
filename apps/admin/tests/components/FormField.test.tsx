import { render, screen } from "@testing-library/react";
import FormField from "@/components/ui/FormField";

describe("FormField", () => {
  it("muestra el label correctamente", () => {
    render(
      <FormField label="Email" htmlFor="email">
        <input id="email" />
      </FormField>
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("muestra el indicador de requerido cuando required=true", () => {
    render(
      <FormField label="Nombre" htmlFor="name" required>
        <input id="name" />
      </FormField>
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("muestra el mensaje de error cuando se provee", () => {
    render(
      <FormField label="Campo" htmlFor="field" error="El campo es requerido.">
        <input id="field" />
      </FormField>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("El campo es requerido.");
  });

  it("renderiza los children correctamente", () => {
    render(
      <FormField label="Test" htmlFor="test">
        <input id="test" placeholder="Escribí acá" />
      </FormField>
    );
    expect(screen.getByPlaceholderText("Escribí acá")).toBeInTheDocument();
  });
});
