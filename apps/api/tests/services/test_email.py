from types import SimpleNamespace

import pytest

from app.services import email


@pytest.mark.parametrize(
    ("contact_type", "subject_prefix"),
    [("booking", "[Booking]"), ("press", "[Prensa]")],
)
async def test_contact_requests_use_contact_mailbox_and_category_subject(
    monkeypatch, contact_type, subject_prefix
):
    captured = {}

    def fake_email_for_role(role):
        assert role == "contact"
        return "contacto@example.com"

    async def fake_send(**kwargs):
        captured.update(kwargs)
        return True

    monkeypatch.setattr(email, "_email_for_role", fake_email_for_role)
    monkeypatch.setattr(email, "_send", fake_send)

    result = await email.send_contact_notification(
        SimpleNamespace(
            contact_type=contact_type,
            name="Ana",
            email="ana@example.com",
            message="Hola",
        )
    )

    assert result is True
    assert captured["to"] == "contacto@example.com"
    assert captured["role"] == "contact"
    assert captured["subject"].startswith(subject_prefix)
    assert captured["reply_to"] == "ana@example.com"
