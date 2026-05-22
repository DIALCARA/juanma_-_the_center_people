import { render, screen, fireEvent } from "@testing-library/react";
import Alert from "@/components/ui/Alert";

describe("Alert", () => {
  it("muestra el mensaje de éxito", () => {
    render(<Alert type="success" message="Guardado correctamente." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Guardado correctamente.");
  });

  it("muestra el mensaje de error", () => {
    render(<Alert type="error" message="Ocurrió un error." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Ocurrió un error.");
  });

  it("llama a onClose al hacer click en ×", () => {
    const handleClose = jest.fn();
    render(<Alert type="info" message="Info" onClose={handleClose} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("no muestra botón de cierre si no se pasa onClose", () => {
    render(<Alert type="success" message="Sin botón" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
