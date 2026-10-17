import pytest
from fastapi.testclient import TestClient
import os
import sys

# Ensure current service path is importable
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from main import app, data_loader

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_data():
    data_loader.load_all()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "data-service"
    assert data["data_mode"] == "synthetic_demo"
    assert "loaded_records" in data
    assert data["loaded_records"]["shipments_count"] > 0

def test_get_all_shipments():
    response = client.get("/shipments")
    assert response.status_code == 200
    shipments = response.json()
    assert isinstance(shipments, list)
    assert len(shipments) >= 5
    first = shipments[0]
    assert "shipment_id" in first
    assert "origin" in first
    assert "destination" in first
    assert "deadline_hours" in first
    assert first["data_mode"] == "synthetic_demo"

def test_filter_shipments():
    # Filter by priority
    response = client.get("/shipments?priority=critical")
    assert response.status_code == 200
    shipments = response.json()
    assert all(s["priority"] == "critical" for s in shipments)

    # Filter by status
    response = client.get("/shipments?status=in_transit")
    assert response.status_code == 200
    shipments = response.json()
    assert all(s["status"] == "in_transit" for s in shipments)

def test_get_valid_shipment():
    response = client.get("/shipments/SHP-F1-001")
    assert response.status_code == 200
    data = response.json()
    assert data["shipment_id"] == "SHP-F1-001"
    assert data["origin"] == "Silverstone UK"
    assert data["destination"] == "Monza Italy"
    assert data["total_weight_tons"] == 45.0
    assert data["deadline_hours"] == 96.0

def test_get_invalid_shipment():
    response = client.get("/shipments/NON_EXISTENT_999")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()

def test_get_all_disruptions():
    response = client.get("/disruptions")
    assert response.status_code == 200
    disruptions = response.json()
    assert isinstance(disruptions, list)
    assert len(disruptions) >= 5
    first = disruptions[0]
    assert "disruption_id" in first
    assert "type" in first
    assert "delay_hours_impact" in first
    assert isinstance(first["affected_modes"], list)

def test_filter_disruptions():
    # Filter active only
    response = client.get("/disruptions?active_only=true")
    assert response.status_code == 200
    disruptions = response.json()
    assert all(d["active"] is True for d in disruptions)

    # Filter by severity
    response = client.get("/disruptions?severity=critical")
    assert response.status_code == 200
    disruptions = response.json()
    assert all(d["severity"] == "critical" for d in disruptions)

def test_get_shipment_options():
    response = client.get("/shipments/SHP-F1-001/options")
    assert response.status_code == 200
    options = response.json()
    assert isinstance(options, list)
    assert len(options) == 4

    # Check feasible options filter
    response_feasible = client.get("/shipments/SHP-F1-001/options?feasible_only=true")
    assert response_feasible.status_code == 200
    feasible_options = response_feasible.json()
    assert all(opt["is_feasible"] is True for opt in feasible_options)
    assert len(feasible_options) < len(options)

def test_get_options_invalid_shipment():
    response = client.get("/shipments/NON_EXISTENT_XYZ/options")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_infeasible_option_placeholder_handling():
    """Verify that placeholder zeroes in infeasible options are treated as null/None, not genuine 0 cost or time."""
    response = client.get("/shipments/SHP-F1-005/options")
    assert response.status_code == 200
    options = response.json()
    # OPT-015 is an infeasible sea option with 0.0 placeholders in the CSV
    opt_015 = next(opt for opt in options if opt["option_id"] == "OPT-015")
    assert opt_015["is_feasible"] is False
    assert opt_015["transit_time_hours"] is None
    assert opt_015["cost_usd"] is None
    assert opt_015["emissions_kg_co2e"] is None
    assert opt_015["infeasibility_reason"] is not None

def test_disruption_none_handling():
    """Verify that 'NONE' or empty disruption IDs are cleanly parsed into empty lists."""
    response = client.get("/shipments/SHP-F1-001/options")
    assert response.status_code == 200
    options = response.json()
    opt_001 = next(opt for opt in options if opt["option_id"] == "OPT-001")
    assert opt_001["disruption_ids"] == []

    opt_003 = next(opt for opt in options if opt["option_id"] == "OPT-003")
    assert opt_003["disruption_ids"] == ["DIS-002"]

def test_missing_files_error_handling(tmp_path):
    from loader import DataLoader
    empty_loader = DataLoader(data_dir=str(tmp_path))
    with pytest.raises(FileNotFoundError):
        empty_loader.load_shipments()
