"""Tests de CRUD de configuración general."""


def test_get_settings_sin_auth(client):
    resp = client.get("/api/admin/site-settings")
    assert resp.status_code == 401


def test_get_settings_vacio(auth_client):
    resp = auth_client.get("/api/admin/site-settings")
    assert resp.status_code == 404


def test_update_settings(auth_client, seed_settings):
    resp = auth_client.put("/api/admin/site-settings", json={
        "band_name": "Nombre actualizado",
        "tagline_custom": "Mi tagline personalizado",
    })
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["band_name"] == "Nombre actualizado"
    assert data["tagline_custom"] == "Mi tagline personalizado"


def test_update_limites_upload(auth_client, seed_settings):
    resp = auth_client.put("/api/admin/site-settings", json={
        "max_image_size_mb": 20,
        "max_video_size_mb": 300,
    })
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["max_image_size_mb"] == 20
