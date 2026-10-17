import os
from typing import List, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from schemas import (
    ShipmentModel,
    TransportOptionModel,
    DisruptionModel,
    HealthStatus,
)
from loader import DataLoader
from osm_service import OSMLoader, OSMFacility, OSMSummary

data_loader = DataLoader()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Reliable startup dataset loading
    try:
        data_loader.load_all()
        is_valid = data_loader.verify_integrity()
        counts = data_loader.get_record_counts()
        print(f"[DataService Startup] Version 2.1.1 Dataset loaded successfully: {counts} (Integrity: {is_valid})")
    except Exception as e:
        print(f"[DataService Startup ERROR] Failed to load dataset: {str(e)}")
    yield

app = FastAPI(
    title="GreenGrid Data Service",
    description="Official Data Service microservice for GreenGrid (IBM Z Datathon 2026), providing verified logistics datasets, transport options, and disruption scenarios.",
    version="2.1.1",
    lifespan=lifespan
)

# CORS middleware for team collaboration and dashboard integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _ensure_data_loaded():
    if not data_loader.shipments or not data_loader.transport_options:
        try:
            data_loader.load_all()
        except FileNotFoundError as fnf:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Dataset files unavailable: {str(fnf)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading dataset files: {str(e)}"
            )

@app.get("/health", response_model=HealthStatus, tags=["Health"])
def get_health():
    """
    Health check endpoint returning service operational status, dataset verification,
    and actual record counts against the Version 2.1.1 manifest.
    """
    _ensure_data_loaded()
    counts = data_loader.get_record_counts()
    integrity = data_loader.verify_integrity()
    return HealthStatus(
        status="ok",
        service="data-service",
        version="2.1.1",
        dataset_version="Version 2.1.1 (Official Frozen Dataset)",
        dataset_status="verified" if integrity else "warning_count_mismatch",
        data_directory=data_loader.data_dir,
        loaded_records=counts,
        expected_records=data_loader.EXPECTED_COUNTS,
        integrity_verified=integrity
    )

@app.get("/shipments", response_model=List[ShipmentModel], tags=["Shipments"])
def list_shipments(
    use_case: Optional[str] = Query(None, description="Filter by domain: F1_Demonstration or Commercial_General"),
    destination_country: Optional[str] = Query(None, description="Filter by destination country"),
    min_weight_tonnes: Optional[float] = Query(None, description="Filter by minimum cargo weight in tonnes")
):
    """
    List all available shipments from the official Version 2.1.1 dataset (27 total),
    with optional domain and location filters.
    """
    _ensure_data_loaded()
    results = list(data_loader.shipments.values())

    if use_case:
        results = [s for s in results if s.use_case_type.lower() == use_case.lower()]
    if destination_country:
        results = [s for s in results if s.destination_country.lower() == destination_country.lower()]
    if min_weight_tonnes is not None:
        results = [s for s in results if s.cargo_weight_tonnes >= min_weight_tonnes]

    return results

@app.get("/shipments/{shipment_id}", response_model=ShipmentModel, tags=["Shipments"])
def get_shipment(shipment_id: str):
    """
    Retrieve one specific shipment by its unique identifier (e.g. SHP-01 to SHP-23, COMM-01 to COMM-04).
    Returns HTTP 404 if not found.
    """
    _ensure_data_loaded()
    shipment = data_loader.shipments.get(shipment_id)
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shipment with ID '{shipment_id}' not found in Version 2.1.1 dataset."
        )
    return shipment

@app.get("/disruptions", response_model=List[DisruptionModel], tags=["Disruptions"])
def list_disruptions(
    affected_mode: Optional[str] = Query(None, description="Filter by affected mode: Air, Sea, Road, Rail")
):
    """
    List all global disruption scenarios (5 active simulated scenarios: DIS-01 through DIS-05).
    """
    _ensure_data_loaded()
    results = list(data_loader.disruptions.values())
    if affected_mode:
        results = [d for d in results if d.affected_mode.lower() == affected_mode.lower()]
    return results

@app.get("/shipments/{shipment_id}/options", response_model=List[TransportOptionModel], tags=["Transport Options"])
def get_shipment_options(
    shipment_id: str,
    feasible_only: bool = Query(False, description="Filter to return only operational feasible options")
):
    """
    Retrieve candidate transport options (Air, Road, Rail, Sea) for a given shipment.
    Returns HTTP 404 if the shipment_id does not exist.
    """
    _ensure_data_loaded()
    if shipment_id not in data_loader.shipments:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shipment with ID '{shipment_id}' not found in Version 2.1.1 dataset."
        )

    options = data_loader.transport_options.get(shipment_id, [])
    if feasible_only:
        options = [opt for opt in options if opt.feasibility_status.lower() != "infeasible"]
    return options

# ---------------------------------------------------------------------------
# OSM — Supplementary Logistics Facility Endpoints
# These endpoints expose OpenStreetMap facility data and are entirely separate
# from the official GreenGrid V2.1.1 dataset and its integrity checks.
# ---------------------------------------------------------------------------

osm_loader = OSMLoader()


@app.get("/osm/health", tags=["OSM Facilities"])
def osm_health():
    """
    OSM module health check.
    Returns facility count and data directory without affecting V2.1.1 integrity.
    """
    osm_loader.load()
    return {
        "status": "ok",
        "module": "osm-facilities",
        "data_directory": osm_loader.osm_data_dir,
        "facility_count": len(osm_loader.facilities),
        "note": "OSM data is supplementary only. Not part of GreenGrid V2.1.1 dataset.",
    }


@app.get("/osm/summary", response_model=OSMSummary, tags=["OSM Facilities"])
def osm_summary():
    """
    Aggregate statistics for all loaded OSM logistics facilities:
    facility type breakdown, countries, and source files.
    """
    return osm_loader.get_summary()


@app.get("/osm/facilities", response_model=List[OSMFacility], tags=["OSM Facilities"])
def list_osm_facilities(
    facility_type: Optional[str] = Query(None, description="Filter by facility type, e.g. warehouse, port, airport"),
    country: Optional[str] = Query(None, description="Filter by country name (case-insensitive)"),
    name_contains: Optional[str] = Query(None, description="Substring match on facility name (case-insensitive)"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return (1–1000)"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
):
    """
    List OSM logistics facilities with optional filters and pagination.
    Returns an empty list (not an error) when no OSM data files are present.
    """
    results = osm_loader.filter(
        facility_type=facility_type,
        country=country,
        name_contains=name_contains,
    )
    return results[offset: offset + limit]


@app.get("/osm/facilities/{osm_id}", response_model=OSMFacility, tags=["OSM Facilities"])
def get_osm_facility(osm_id: str):
    """
    Retrieve a single OSM facility by its OSM ID.
    Returns HTTP 404 if not found.
    """
    osm_loader.load()
    for facility in osm_loader.facilities:
        if facility.osm_id == osm_id:
            return facility
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"OSM facility with ID '{osm_id}' not found.",
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
