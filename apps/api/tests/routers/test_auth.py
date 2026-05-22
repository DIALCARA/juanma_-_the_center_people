"""Tests del sistema de autenticación."""
import pytest


def test_login_exitoso(auth_client):
    resp = auth_client.get("/api/auth/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["email"] == "test@admin.com"


def test_login_credenciales_incorrectas(client, admin_user):
    resp = client.post("/api/auth/login", json={
        "email": "test@admin.com",
        "password": "password_incorrecta",
    })
    assert resp.status_code == 401


def test_login_usuario_inexistente(client):
    resp = client.post("/api/auth/login", json={
        "email": "noexiste@test.com",
        "password": "cualquiera",
    })
    assert resp.status_code == 401


def test_me_sin_autenticar(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_logout(auth_client):
    resp = auth_client.post("/api/auth/logout")
    assert resp.status_code == 200
    # Después del logout, /me debe fallar
    resp2 = auth_client.get("/api/auth/me")
    assert resp2.status_code == 401
