# ─── Stage 1: dependencias ───────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# libmagic para validación de MIME
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir ".[dev]"

# ─── Stage 2: producción ─────────────────────────────────────────────────────
FROM python:3.11-slim AS production

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Copiar solo dependencias instaladas (sin dev deps)
COPY pyproject.toml .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir "."

# Copiar código fuente
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .
COPY scripts/ ./scripts/

RUN mkdir -p /app/data

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
