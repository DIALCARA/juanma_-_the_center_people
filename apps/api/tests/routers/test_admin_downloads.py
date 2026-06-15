"""Tests de endpoints admin de descargas."""

from app.models.download import DownloadAsset, DownloadRequest


def test_approve_download_request_accepts_frontend_status_alias(auth_client, db, monkeypatch):
    async def fake_send_download_approved(download_request):
        return True

    monkeypatch.setattr("app.services.email.send_download_approved", fake_send_download_approved)

    asset = DownloadAsset(
        title="Rider tecnico",
        file_url="https://example.com/rider.pdf",
        access_type="request_required",
        expires_in_days=7,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    download_request = DownloadRequest(
        download_asset_id=asset.id,
        name="Juan Test",
        email="juan@test.com",
        reason="prensa",
        status="pending",
    )
    db.add(download_request)
    db.commit()
    db.refresh(download_request)

    resp = auth_client.put(
        f"/api/admin/download-requests/{download_request.id}",
        json={"action": "approved"},
    )

    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["token"]
    assert data["expires_at"]

    db.refresh(download_request)
    assert download_request.status == "approved"
    assert download_request.approval_token == data["token"]

