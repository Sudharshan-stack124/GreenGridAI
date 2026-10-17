import pytest
from fastapi.testclient import TestClient
import os
import sys

# Ensure current service path is importable
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from main import app, data_loader
from loader import DataLoader

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_dataset():
    data_loader.load_all()

# ---------------------------------------------------------------------------
# 1. DATASET RECORD COUNTS & REFERENTIAL INTEGRITY VERIFICATION
# ---------------------------------------------------------------------------
def test_manifest_record_counts():
    """Verify that actual loaded counts match the Version 2.1.1 MANIFEST.md exactly."""
    counts = data_loader.get_record_counts()
    assert counts["shipments"] == 27, f"Expected 27 shipments, got {counts['shipments']}"
    assert counts["transport_options"] == 108, f"Expected 108 transport options, got {counts['transport_options']}"
    assert counts["disruptions"] == 5, f"Expected 5 disruptions, got {counts['disruptions']}"
    assert counts["scenario_tests"] == 8, f"Expected 8 scenario tests, got {counts['scenario_tests']}"
    assert counts["data_dictionary"] == 79, f"Expected 79 data dictionary entries, got {counts['data_dictionary']}"

def test_referential_integrity():
    """Verify that every transport option links to a valid shipment."""
    assert data_loader.verify_integrity() is True

# ---------------------------------------------------------------------------
# 2. ENDPOINT TESTS
# ---------------------------------------------------------------------------
def test_get_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "data-service"
    assert data["version"] == "2.1.1"
    assert data["dataset_version"] == "Version 2.1.1 (Official Frozen Dataset)"
    assert data["dataset_status"] == "verified"
    assert data["integrity_verified"] is True
    assert data["loaded_records"]["shipments"] == 27
    assert data["loaded_records"]["transport_options"] == 108
    assert data["loaded_records"]["disruptions"] == 5

def test_get_all_shipments():
    response = client.get("/shipments")
    assert response.status_code == 200
    shipments = response.json()
    assert len(shipments) == 27
    f1_shipments = [s for s in shipments if s["use_case_type"] == "F1_Demonstration"]
    comm_shipments = [s for s in shipments if s["use_case_type"] == "Commercial_General"]
    assert len(f1_shipments) == 23
    assert len(comm_shipments) == 4
    # Ensure all shipments carry dataset_version metadata
    assert all(s["dataset_version"] == "2.1.1" for s in shipments)

def test_shipment_filters():
    # Filter by domain
    resp_f1 = client.get("/shipments?use_case=F1_Demonstration")
    assert resp_f1.status_code == 200
    assert len(resp_f1.json()) == 23

    resp_comm = client.get("/shipments?use_case=Commercial_General")
    assert resp_comm.status_code == 200
    assert len(resp_comm.json()) == 4

    # Filter by destination country
    resp_country = client.get("/shipments?destination_country=Saudi%20Arabia")
    assert resp_country.status_code == 200
    assert len(resp_country.json()) >= 1

    # Filter by min_weight_tonnes
    resp_weight = client.get("/shipments?min_weight_tonnes=1000")
    assert resp_weight.status_code == 200
    assert all(s["cargo_weight_tonnes"] >= 1000 for s in resp_weight.json())

def test_get_valid_shipment_shp01():
    response = client.get("/shipments/SHP-01")
    assert response.status_code == 200
    data = response.json()
    assert data["shipment_id"] == "SHP-01"
    assert data["origin_name"] == "Sakhir"
    assert data["destination_name"] == "Jeddah"
    assert data["origin_country"] == "Bahrain"
    assert data["destination_country"] == "Saudi Arabia"
    assert data["cargo_weight_tonnes"] == 1200.0
    assert data["departure_date"] == "2027-03-15"
    assert data["delivery_deadline"] == "2027-03-18"
    assert data["available_window_days"] == 3.0
    assert data["dataset_version"] == "2.1.1"

def test_get_unknown_shipment_404():
    response = client.get("/shipments/NON_EXISTENT_ID")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "not found" in data["detail"].lower()

def test_get_all_disruptions():
    response = client.get("/disruptions")
    assert response.status_code == 200
    disruptions = response.json()
    assert len(disruptions) == 5
    d_ids = [d["disruption_id"] for d in disruptions]
    assert d_ids == ["DIS-01", "DIS-02", "DIS-03", "DIS-04", "DIS-05"]

    # Filter by affected mode
    resp_sea = client.get("/disruptions?affected_mode=Sea")
    assert resp_sea.status_code == 200
    assert len(resp_sea.json()) >= 2
    assert all(d["affected_mode"] == "Sea" for d in resp_sea.json())

def test_get_shipment_options_shp01():
    response = client.get("/shipments/SHP-01/options")
    assert response.status_code == 200
    options = response.json()
    assert len(options) == 4
    modes = [opt["mode"] for opt in options]
    assert set(modes) == {"Air", "Road", "Rail", "Sea"}
    assert all(opt["dataset_version"] == "2.1.1" for opt in options)

def test_get_shipment_options_feasible_filter():
    response_all = client.get("/shipments/SHP-01/options")
    assert response_all.status_code == 200
    all_opts = response_all.json()

    response_feasible = client.get("/shipments/SHP-01/options?feasible_only=true")
    assert response_feasible.status_code == 200
    feasible_opts = response_feasible.json()
    assert len(feasible_opts) <= len(all_opts)
    assert all(o["feasibility_status"] == "Feasible" for o in feasible_opts)

def test_get_options_unknown_shipment_404():
    response = client.get("/shipments/NON_EXISTENT_ID/options")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

# ---------------------------------------------------------------------------
# 3. SPECIAL HANDLING: PLACEHOLDERS, BOOLEANS, EMPTY VALUES
# ---------------------------------------------------------------------------
def test_infeasible_option_placeholder_normalization():
    """
    On infeasible routes (e.g. OPT-SHP-01-RAIL where there is no rail track),
    placeholder 0s must be converted to None/null in the API response,
    NOT genuine 0 transit days or $0 cost.
    """
    response = client.get("/shipments/SHP-01/options")
    assert response.status_code == 200
    options = response.json()
    rail_opt = next(opt for opt in options if opt["mode"] == "Rail")
    assert rail_opt["feasibility_status"] == "Infeasible"
    assert rail_opt["transit_time_days"] is None
    assert rail_opt["total_cost_usd"] is None
    assert rail_opt["total_emissions_tco2e"] is None
    assert rail_opt["route_distance_km"] is None
    assert rail_opt["meets_deadline"] is False
    assert rail_opt["is_recommended"] is False
    assert rail_opt["feasibility_reason"] is not None

def test_feasible_zero_margin_preserved():
    """
    Feasible options with genuine values must retain exact numbers and booleans.
    """
    response = client.get("/shipments/SHP-01/options")
    assert response.status_code == 200
    options = response.json()
    air_opt = next(opt for opt in options if opt["mode"] == "Air")
    assert air_opt["feasibility_status"] == "Feasible"
    assert air_opt["transit_time_days"] == 1.6
    assert air_opt["total_cost_usd"] == 551040.0
    assert air_opt["total_emissions_tco2e"] == 1011.8
    assert air_opt["meets_deadline"] is True
    assert air_opt["is_recommended"] is False

# ---------------------------------------------------------------------------
# 4. ERROR HANDLING: MISSING FILES & CORRUPTED INPUT
# ---------------------------------------------------------------------------
def test_missing_files_error_handling(tmp_path):
    loader = DataLoader(data_dir=str(tmp_path))
    with pytest.raises(FileNotFoundError):
        loader.load_shipments()

def test_empty_disruption_id_handling(tmp_path):
    """Verify that rows with empty or NONE disruption IDs are ignored safely."""
    csv_file = tmp_path / "disruptions.csv"
    csv_file.write_text("disruption_id,title,type,affected_mode,geographic_corridor,delay_impact_days,cost_surcharge_usd,emissions_increase_pct,description,status,mitigation_mode\n"
                        "NONE,Dummy,weather,Air,Corridor,1.0,100,5.0,desc,Simulated,Road\n"
                        ",EmptyID,weather,Air,Corridor,1.0,100,5.0,desc,Simulated,Road\n"
                        "DIS-99,Valid,weather,Air,Corridor,1.0,100,5.0,desc,Simulated,Road\n")
    loader = DataLoader(data_dir=str(tmp_path))
    loader.load_disruptions()
    assert len(loader.disruptions) == 1
    assert "DIS-99" in loader.disruptions

def test_missing_transport_options_file_error(tmp_path):
    loader = DataLoader(data_dir=str(tmp_path))
    with pytest.raises(FileNotFoundError):
        loader.load_transport_options()

def test_missing_disruptions_file_error(tmp_path):
    loader = DataLoader(data_dir=str(tmp_path))
    with pytest.raises(FileNotFoundError):
        loader.load_disruptions()
