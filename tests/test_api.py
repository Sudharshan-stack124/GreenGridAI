"""
Tests for FastAPI REST endpoints
"""

import pytest
from starlette.testclient import TestClient
from greengrid.api.app import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["author"] == "Revanth — Decision Engine"


def test_get_weights_endpoint():
    response = client.get("/api/v1/weights")
    assert response.status_code == 200
    data = response.json()
    assert data["default_weights"]["emissions"] == 0.40
    assert data["default_weights"]["cost"] == 0.35
    assert data["default_weights"]["time"] == 0.25


def test_scenarios_list():
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) == 3
    ids = [s["id"] for s in scenarios]
    assert "melbourne_to_shanghai" in ids


def test_evaluate_scenario_melbourne():
    response = client.post("/api/v1/scenarios/melbourne_to_shanghai/evaluate", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates_evaluated"] == 5
    assert data["feasible_count"] == 2
    assert data["recommended_option"]["rank"] == 1
    assert data["recommended_option"]["option_id"] == "OPT-AIR-SAF-02"
