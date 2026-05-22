import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("muestra el mensaje de confirmación", () => {
    render(
      <ConfirmDialog
        message="¿Eliminás este elemento?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("¿Eliminás este elemento?")).toBeInTheDocument();
  });

  it("llama a onConfirm al confirmar", () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog message="Confirmar" onConfirm={onConfirm} onCancel={jest.fn()} />
    );
    fireEvent.click(screen.getByText("Eliminar"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("llama a onCancel al cancelar", () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDialog message="Confirmar" onConfirm={jest.fn()} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("deshabilita botones cuando loading=true", () => {
    render(
      <ConfirmDialog message="Eliminar" onConfirm={jest.fn()} onCancel={jest.fn()} loading />
    );
    expect(screen.getByText("Eliminando...")).toBeDisabled();
    expect(screen.getByText("Cancelar")).toBeDisabled();
  });
});
