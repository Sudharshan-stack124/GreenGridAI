# ── GreenGrid Data Service — Dockerfile ──────────────────────────────────────
# Multi-stage, LinuxONE s390x-compatible build.
# Base image: python:3.11-slim (multi-arch, runs on s390x via QEMU or natively).
# ---------------------------------------------------------------------------

FROM python:3.11-slim AS base

LABEL maintainer="Kruthin Reddy — GreenGrid Data Service"
LABEL version="2.1.1"
LABEL description="GreenGrid IBM Z Datathon 2026 — Data Service Microservice"

# Ensure non-root runtime for LinuxONE security best practices
RUN groupadd -r greengrid && useradd -r -g greengrid greengrid

WORKDIR /app

# ── Install dependencies (separate layer for caching) ──────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# ── Copy application code ──────────────────────────────────────────────────
COPY main.py loader.py schemas.py osm_service.py ./
COPY data/ ./data/

# ── Runtime user ──────────────────────────────────────────────────────────
RUN chown -R greengrid:greengrid /app
USER greengrid

# ── Health check ──────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')" || exit 1

# ── Startup ───────────────────────────────────────────────────────────────
EXPOSE 8001
ENV PORT=8001
ENV GREENGRID_DATA_DIR=/app/data

CMD ["uvicorn", "main:app", \
     "--host", "0.0.0.0", \
     "--port", "8001", \
     "--workers", "2", \
     "--log-level", "info"]
