"""
tests/test_osm_service.py — OSM Logistics Facility Module Tests
GreenGrid Data Service (IBM Z Datathon 2026)

These tests are fully isolated from the official GreenGrid V2.1.1 dataset.
They verify the OSMLoader and OSM API endpoints independently.
"""
import json
import pytest
import os
import sys

# Ensure service root is importable
SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SERVICE_DIR not in sys.path:
    sys.path.insert(0, SERVICE_DIR)

from fastapi.testclient import TestClient
from main import app
from osm_service import OSMLoader, OSMFacility, OSMSummary

client = TestClient(app)

# Path to bundled OSM sample data for use in unit tests
SAMPLE_OSM_DIR = os.path.join(SERVICE_DIR, "data", "osm")


# ---------------------------------------------------------------------------
# 1. OSMLoader Unit Tests
# ---------------------------------------------------------------------------

class TestOSMLoader:
    def test_load_returns_list(self):
        """OSMLoader.load() must always return a list (even for empty dir)."""
        loader = OSMLoader(osm_data_dir=SAMPLE_OSM_DIR)
        result = loader.load()
        assert isinstance(result, list)

    def test_loaded_facilities_count(self):
        """The bundled OSM CSV contains 15 facilities."""
        loader = OSMLoader(osm_data_dir=SAMPLE_OSM_DIR)
        facilities = loader.load()
        assert len(facilities) == 15, f"Expected 15 OSM facilities, got {len(facilities)}"

    def test_facility_schema_fields(self):
        """Each loaded facility must have all required OSMFacility fields."""
        loader = OSMLoader(osm_data_dir=SAMPLE_OSM_DIR)
        facilities = loader.load()
        for f in facilities:
            assert isinstance(f, OSMFacility)
            assert f.osm_id
            assert f.name
            assert f.facility_type
            assert isinstance(f.lat, float)
            assert isinstance(f.lon, float)
            assert f.data_source == "OpenStreetMap"

    def test_tags_parsed_correctly(self):
        """Facilities with valid tags_json must have a parsed dict, not a string."""
        loader = OSMLoader(osm_data_dir=SAMPLE_OSM_DIR)
        facilities = loader.load()
        # n1001 has tags_json
        bahrain = next((f for f in facilities if f.osm_id == "n1001"), None)
        assert bahrain is not None
        assert isinstance(bahrain.tags, dict)
        assert bahrain.tags.get("operator") == "BIC"

    def test_null_tags_allowed(self):
        """Facilities with no tags_json must have tags=None (not an error)."""
        loader = OSMLoader(osm_data_dir=SAMPLE_OSM_DIR)
        facilities = loader.load()
        # n1004 (Suzuka) has empty tags_json
        suzuka = next((f for f in facilities if f.osm_id == "n1004"), None)
        assert suzuka is not None
        assert suzuka.tags is None

    def test_source_file_set(self):
        """Every facility must have source_file populated from the CSV filename."""
        loader = OSMLoader(osm_data_dir=SAMPLE_OSM_DIR)
        facilities = loader.load()
        assert all(f.source_file is not None for f in facilities)

    def test_idempotent_load(self):
        """Calling load() twice must return the same count (cached)."""
        loader = OSMLoader(osm_data_dir=SAMPLE_OSM_DIR)
        first = loader.load()
        second = loader.load()
        assert len(first) == len(second)

    def test_force_reload(self):
        """force_reload=True must re-read files and return the same count."""
        loader = OSMLoader(osm_data_dir=SAMPLE_OSM_DIR)
        loader.load()
        reloaded = loader.load(force_reload=True)
        assert len(reloaded) == 15

    def test_missing_directory_returns_empty(self, tmp_path):
        """Non-existent osm_data_dir must return [] instead of raising."""
        loader = OSMLoader(osm_data_dir=str(tmp_path / "nonexistent"))
        result = loader.load()
        assert result == []

    def test_incompatible_csv_skipped(self, tmp_path):
        """CSV missing required columns must be silently skipped."""
        bad_csv = tmp_path / "bad.csv"
        bad_csv.write_text("foo,bar\n1,2\n")
        loader = OSMLoader(osm_data_dir=str(tmp_path))
        result = loader.load()
        assert result == []

    def test_rows_missing_mandatory_fields_skipped(self, tmp_path):
        """Rows where lat/lon/name are blank must be skipped without error."""
        csv = tmp_path / "partial.csv"
        csv.write_text(
            "osm_id,name,facility_type,lat,lon\n"
            "n-ok,GoodFacility,warehouse,10.0,20.0\n"
            "n-bad,,warehouse,10.0,20.0\n"         # missing name
            "n-bad2,AnotherGood,warehouse,,20.0\n"  # missing lat
        )
        loader = OSMLoader(osm_data_dir=str(tmp_path))
        result = loader.load()
        assert len(result) == 1
        assert result[0].osm_id == "n-ok"


class TestOSMLoaderFilter:
    def setup_method(self):
        self.loader = OSMLoader(osm_data_dir=SAMPLE_OSM_DIR)
        self.loader.load()

    def test_filter_by_facility_type(self):
        ports = self.loader.filter(facility_type="port")
        assert len(ports) >= 1
        assert all(f.facility_type == "port" for f in ports)

    def test_filter_by_country(self):
        jp = self.loader.filter(country="Japan")
        assert len(jp) >= 1
        assert all(f.country == "Japan" for f in jp)

    def test_filter_by_name_contains(self):
        results = self.loader.filter(name_contains="cargo")
        assert len(results) >= 1
        assert all("cargo" in f.name.lower() for f in results)

    def test_combined_filters(self):
        results = self.loader.filter(facility_type="airport", country="Singapore")
        assert len(results) == 1
        assert results[0].osm_id == "n1007"

    def test_filter_no_match_returns_empty(self):
        results = self.loader.filter(country="Narnia")
        assert results == []

    def test_filter_case_insensitive(self):
        lower = self.loader.filter(facility_type="warehouse")
        upper = self.loader.filter(facility_type="WAREHOUSE")
        assert len(lower) == len(upper)


class TestOSMSummary:
    def test_summary_structure(self):
        loader = OSMLoader(osm_data_dir=SAMPLE_OSM_DIR)
        summary = loader.get_summary()
        assert isinstance(summary, OSMSummary)
        assert summary.total_facilities == 15
        assert "warehouse" in summary.facility_types
        assert "port" in summary.facility_types
        assert "airport" in summary.facility_types
        assert isinstance(summary.countries, list)
        assert len(summary.countries) > 0
        assert "OpenStreetMap" in summary.data_source


# ---------------------------------------------------------------------------
# 2. OSM API Endpoint Tests
# ---------------------------------------------------------------------------

class TestOSMEndpoints:
    def test_osm_health(self):
        response = client.get("/osm/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["module"] == "osm-facilities"
        assert "facility_count" in data
        assert "note" in data

    def test_osm_summary_endpoint(self):
        response = client.get("/osm/summary")
        assert response.status_code == 200
        data = response.json()
        assert "total_facilities" in data
        assert "facility_types" in data
        assert "countries" in data
        assert data["data_source"] == "OpenStreetMap"

    def test_osm_facilities_list(self):
        response = client.get("/osm/facilities")
        assert response.status_code == 200
        facilities = response.json()
        assert isinstance(facilities, list)
        # Default limit=100, we have 15 facilities
        assert len(facilities) <= 100

    def test_osm_facilities_pagination(self):
        response_all = client.get("/osm/facilities?limit=1000")
        total = len(response_all.json())

        response_page = client.get("/osm/facilities?limit=5&offset=0")
        assert response_page.status_code == 200
        page1 = response_page.json()
        assert len(page1) <= 5

        if total > 5:
            response_page2 = client.get("/osm/facilities?limit=5&offset=5")
            assert response_page2.status_code == 200
            page2 = response_page2.json()
            # No overlap between pages
            ids1 = {f["osm_id"] for f in page1}
            ids2 = {f["osm_id"] for f in page2}
            assert ids1.isdisjoint(ids2)

    def test_osm_facilities_filter_by_type(self):
        response = client.get("/osm/facilities?facility_type=port")
        assert response.status_code == 200
        data = response.json()
        assert all(f["facility_type"] == "port" for f in data)

    def test_osm_facilities_filter_by_country(self):
        response = client.get("/osm/facilities?country=Japan")
        assert response.status_code == 200
        data = response.json()
        assert all(f["country"] == "Japan" for f in data)

    def test_osm_facilities_filter_name_contains(self):
        response = client.get("/osm/facilities?name_contains=Cargo")
        assert response.status_code == 200
        data = response.json()
        assert all("cargo" in f["name"].lower() for f in data)

    def test_osm_facilities_empty_filter_returns_empty_not_error(self):
        response = client.get("/osm/facilities?country=Narnia")
        assert response.status_code == 200
        assert response.json() == []

    def test_osm_facility_by_id(self):
        response = client.get("/osm/facilities/n1001")
        assert response.status_code == 200
        data = response.json()
        assert data["osm_id"] == "n1001"
        assert data["name"] == "Bahrain Logistics Gate"
        assert data["facility_type"] == "warehouse"
        assert data["country"] == "Bahrain"
        assert data["lat"] == pytest.approx(26.031)
        assert data["lon"] == pytest.approx(50.512)
        assert data["data_source"] == "OpenStreetMap"

    def test_osm_facility_by_id_tags_present(self):
        """Facility n1001 has tags; verify they are returned as a parsed dict."""
        response = client.get("/osm/facilities/n1001")
        assert response.status_code == 200
        data = response.json()
        assert data["tags"] is not None
        assert data["tags"]["operator"] == "BIC"

    def test_osm_facility_not_found_404(self):
        response = client.get("/osm/facilities/NONEXISTENT-9999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_osm_does_not_affect_v211_health(self):
        """
        Accessing OSM endpoints must NOT alter the official V2.1.1 health status.
        The official dataset integrity check must remain unaffected.
        """
        client.get("/osm/facilities")
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["integrity_verified"] is True
        assert data["loaded_records"]["shipments"] == 27
        assert data["loaded_records"]["transport_options"] == 108
        assert data["loaded_records"]["disruptions"] == 5
