import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    ShipmentModel,
    DisruptionModel,
    TransportOptionModel,
    HealthStatus,
)
from loader import DataLoader

from contextlib import asynccontextmanager

data_loader = DataLoader()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        data_loader.load_all()
    except Exception as e:
        print(f"[DataService Startup Warning] Failed to load data: {e}")
    yield

app = FastAPI(
    title="GreenGrid Data Service",
    description="Microservice providing shipment, transport option, and disruption records for GreenGridAI (IBM Z Datathon 2026).",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for cross-service collaboration and local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthStatus, tags=["Health"])
def get_health():
    """Service health status and metadata on loaded dataset."""
    return HealthStatus(
        status="ok",
        service="data-service",
        version="1.0.0",
        data_mode=data_loader.data_mode,
        dataset_version="synthetic-demo-v1 (GreenGrid v2.1.1 fallback)",
        loaded_records={
            "shipments_count": len(data_loader.shipments),
            "disruptions_count": len(data_loader.disruptions),
            "shipments_with_options_count": len(data_loader.transport_options),
        }
    )

@app.get("/shipments", response_model=List[ShipmentModel], tags=["Shipments"])
def list_shipments(
    priority: Optional[str] = Query(None, description="Filter by priority (critical, high, standard)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (scheduled, in_transit, delivered, delayed)")
):
    """Retrieve all available shipments with optional priority and status filtering."""
    results = list(data_loader.shipments.values())
    if priority:
        results = [s for s in results if s.priority.lower() == priority.lower()]
    if status_filter:
        results = [s for s in results if s.status.lower() == status_filter.lower()]
    return results

@app.get("/shipments/{shipment_id}", response_model=ShipmentModel, tags=["Shipments"])
def get_shipment(shipment_id: str):
    """Retrieve a single shipment by its unique identifier."""
    shipment = data_loader.shipments.get(shipment_id)
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shipment with ID '{shipment_id}' not found."
        )
    return shipment

@app.get("/disruptions", response_model=List[DisruptionModel], tags=["Disruptions"])
def list_disruptions(
    active_only: bool = Query(False, description="Filter to only active disruptions"),
    severity: Optional[str] = Query(None, description="Filter by severity (low, medium, high, critical)")
):
    """Retrieve all available disruption scenarios."""
    results = list(data_loader.disruptions.values())
    if active_only:
        results = [d for d in results if d.active]
    if severity:
        results = [d for d in results if d.severity.lower() == severity.lower()]
    return results

@app.get("/shipments/{shipment_id}/options", response_model=List[TransportOptionModel], tags=["Transport Options"])
def get_shipment_options(
    shipment_id: str,
    feasible_only: bool = Query(False, description="Filter to return only feasible transport options")
):
    """
    Retrieve transport options for a given shipment.
    Returns 404 if the shipment itself does not exist.
    """
    if shipment_id not in data_loader.shipments:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shipment with ID '{shipment_id}' not found."
        )
    
    options = data_loader.transport_options.get(shipment_id, [])
    if feasible_only:
        options = [opt for opt in options if opt.is_feasible]
    return options

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
