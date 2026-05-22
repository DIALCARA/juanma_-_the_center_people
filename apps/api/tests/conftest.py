"""Fixtures compartidas para todos los tests de la API."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app

# Base de datos en memoria para tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine_test = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def admin_user(db):
    from app.models.user import User
    user = User(
        email="test@admin.com",
        password_hash=hash_password("test1234"),
        name="Admin Test",
        role="admin_editor",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_client(client, admin_user):
    """Cliente con cookie de sesión autenticada."""
    resp = client.post("/api/auth/login", json={
        "email": "test@admin.com",
        "password": "test1234",
    })
    assert resp.status_code == 200
    return client


@pytest.fixture
def seed_settings(db):
    from app.models.site_settings import SiteSettings
    s = SiteSettings(
        band_name="Juanma & The Center People",
        tagline="Rock alternativo peruano.",
    )
    db.add(s)
    db.commit()
    return s


@pytest.fixture
def seed_sections(db):
    from app.models.section import Section
    sections = [
        Section(slug="inicio", title="Inicio", sort_order=1, is_enabled=True),
        Section(slug="fechas", title="Fechas", sort_order=8, is_enabled=True,
                show_empty_state=True, empty_state_message="Sin fechas por ahora."),
    ]
    db.add_all(sections)
    db.commit()
    return sections
