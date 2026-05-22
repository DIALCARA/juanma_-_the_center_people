"""Tests de endpoints públicos."""
import pytest
from datetime import date


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_site_settings_vacio(client):
    resp = client.get("/api/public/site-settings")
    assert resp.status_code == 404


def test_site_settings_con_datos(client, seed_settings):
    resp = client.get("/api/public/site-settings")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["band_name"] == "Juanma & The Center People"


def test_sections_vacio(client):
    resp = client.get("/api/public/sections")
    assert resp.status_code == 200
    assert resp.json()["data"] == []


def test_sections_con_datos(client, seed_sections):
    resp = client.get("/api/public/sections")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data) == 2
    slugs = [s["slug"] for s in data]
    assert "inicio" in slugs


def test_home_responde(client, seed_settings):
    resp = client.get("/api/public/home")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "site" in data
    assert data["site"]["band_name"] == "Juanma & The Center People"


def test_media_paginacion(client, db):
    resp = client.get("/api/public/media?page=1&page_size=10")
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert "page" in body


def test_events_empty_state(client, seed_sections):
    resp = client.get("/api/public/events")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["events"] == []
    assert "Sin fechas por ahora" in (data["empty_state_message"] or "")


def test_contact_submit(client):
    resp = client.post("/api/public/contact", json={
        "name": "Juan Test",
        "email": "juan@test.com",
        "contact_type": "booking",
        "message": "Quiero contratar a la banda para mi evento.",
    })
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_contact_tipo_invalido(client):
    resp = client.post("/api/public/contact", json={
        "name": "Juan",
        "email": "juan@test.com",
        "contact_type": "tipo_que_no_existe",
        "message": "Hola",
    })
    assert resp.status_code == 400


def test_download_token_inexistente(client):
    resp = client.get("/api/public/downloads/token-que-no-existe")
    assert resp.status_code == 404
