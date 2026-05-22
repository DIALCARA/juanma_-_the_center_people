import { ApiError, get, post, put, del } from "@/lib/api";

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(status: number, data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    statusText: status === 200 ? "OK" : "Error",
  });
}

describe("api helpers", () => {
  beforeEach(() => mockFetch.mockClear());

  it("get realiza una petición GET correctamente", async () => {
    mockResponse(200, { success: true, data: { id: 1 } });
    const result = await get<{ success: boolean; data: { id: number } }>("/api/test");
    expect(mockFetch).toHaveBeenCalledWith("/api/test", expect.objectContaining({ credentials: "include" }));
    expect(result.data.id).toBe(1);
  });

  it("post realiza una petición POST con body JSON", async () => {
    mockResponse(200, { success: true });
    await post("/api/test", { name: "Test" });
    const call = mockFetch.mock.calls[0];
    expect(call[1].method).toBe("POST");
    expect(call[1].body).toBe(JSON.stringify({ name: "Test" }));
  });

  it("put realiza una petición PUT con body JSON", async () => {
    mockResponse(200, { success: true });
    await put("/api/test/1", { name: "Updated" });
    expect(mockFetch.mock.calls[0][1].method).toBe("PUT");
  });

  it("del realiza una petición DELETE", async () => {
    mockResponse(200, { success: true });
    await del("/api/test/1");
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
  });

  it("lanza ApiError con status 401 en respuesta no exitosa", async () => {
    mockResponse(401, { message: "No autorizado" });
    await expect(get("/api/protected")).rejects.toBeInstanceOf(ApiError);
  });

  it("ApiError tiene el status HTTP correcto", async () => {
    mockResponse(404, { message: "No encontrado" });
    try {
      await get("/api/not-found");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
    }
  });

  it("ApiError tiene el mensaje de la respuesta", async () => {
    mockResponse(422, { message: "Datos inválidos" });
    try {
      await get("/api/bad");
    } catch (err) {
      expect((err as ApiError).message).toBe("Datos inválidos");
    }
  });
});
