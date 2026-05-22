"""Tests CRUD de eventos."""
from datetime import date


def test_crear_evento(auth_client):
    resp = auth_client.post("/api/admin/events", json={
        "title": "Concierto en el Anfiteatro",
        "event_date": "2026-07-15",
        "venue": "Anfiteatro del Parque",
        "city": "Lima",
        "country": "Perú",
    })
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["title"] == "Concierto en el Anfiteatro"
    assert data["event_date"] == "2026-07-15"
    return data["id"]


def test_listar_eventos(auth_client):
    auth_client.post("/api/admin/events", json={
        "title": "Show 1",
        "event_date": "2026-08-01",
    })
    resp = auth_client.get("/api/admin/events")
    assert resp.status_code == 200
    assert len(resp.json()["data"]) >= 1


def test_actualizar_evento(auth_client):
    create = auth_client.post("/api/admin/events", json={
        "title": "Show original",
        "event_date": "2026-09-01",
    })
    event_id = create.json()["data"]["id"]
    resp = auth_client.put(f"/api/admin/events/{event_id}", json={"title": "Show actualizado"})
    assert resp.status_code == 200
    assert resp.json()["data"]["title"] == "Show actualizado"


def test_eliminar_evento(auth_client):
    create = auth_client.post("/api/admin/events", json={
        "title": "Show a eliminar",
        "event_date": "2026-10-01",
    })
    event_id = create.json()["data"]["id"]
    resp = auth_client.delete(f"/api/admin/events/{event_id}")
    assert resp.status_code == 200
    resp2 = auth_client.put(f"/api/admin/events/{event_id}", json={"title": "X"})
    assert resp2.status_code == 404


def test_evento_sin_auth(client):
    resp = client.get("/api/admin/events")
    assert resp.status_code == 401
