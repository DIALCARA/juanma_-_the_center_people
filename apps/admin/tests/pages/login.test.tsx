import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

// Mock swr
jest.mock("swr", () => ({
  __esModule: true,
  default: () => ({ data: null, error: null, isLoading: false }),
}));

// Mock api
jest.mock("@/lib/api", () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

import LoginPage from "@/app/login/page";
import { post } from "@/lib/api";

const mockPost = post as jest.Mock;

describe("LoginPage", () => {
  beforeEach(() => mockPost.mockClear());

  it("renderiza el formulario de login", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ingresar/i })).toBeInTheDocument();
  });

  it("muestra el título del panel", () => {
    render(<LoginPage />);
    expect(screen.getByText(/Juanma & The Center People/i)).toBeInTheDocument();
    expect(screen.getByText(/Panel de administración/i)).toBeInTheDocument();
  });

  it("llama a la API con email y contraseña al enviar", async () => {
    mockPost.mockResolvedValueOnce({ success: true });
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "admin@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/auth/login", {
        email: "admin@test.com",
        password: "password123",
      });
    });
  });

  it("muestra error cuando las credenciales son incorrectas", async () => {
    mockPost.mockRejectedValueOnce(new Error("Credenciales incorrectas"));
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "wrong@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "bad" } });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Credenciales incorrectas");
    });
  });
});
