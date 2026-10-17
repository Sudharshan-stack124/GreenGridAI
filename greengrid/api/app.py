"""
FastAPI REST Service for GreenGrid Decision Engine
Exposes Revanth's Decision Engine logic to upstream route generators, disruption agents, and dashboards.
"""

from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

from greengrid.data.f1_scenarios import (
    get_european_double_header_scenario,
    get_melbourne_to_shanghai_scenario,
    get_miami_to_imola_scenario,
)
from greengrid.engine.decision_engine import DecisionEngine
from greengrid.engine.scorer import DEFAULT_WEIGHTS, SENSITIVITY_SCENARIOS
from greengrid.models.cargo import Shipment
from greengrid.models.decision import DecisionResult
from greengrid.models.disruption import DisruptionEvent
from greengrid.models.transport import TransportOption

app = FastAPI(
    title="GreenGrid - Revanth: Decision Engine API",
    description="Core business logic service for sustainable logistics optimization & Formula 1 freight routing.",
    version="1.0.0",
)

engine = DecisionEngine()


class CustomEvaluationRequest(BaseModel):
    shipment: Shipment
    options: List[TransportOption]
    disruptions: Optional[List[DisruptionEvent]] = None
    weights: Optional[Dict[str, float]] = Field(
        default=None,
        description="Optional weights (defaults to 40% emissions, 35% cost, 25% time)"
    )


class ScenarioEvaluateRequest(BaseModel):
    include_disruptions: bool = True
    weights: Optional[Dict[str, float]] = None


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "GreenGrid Decision Engine",
        "author": "Revanth — Decision Engine",
        "default_weights": DEFAULT_WEIGHTS,
    }


@app.get("/api/v1/weights", tags=["Configuration"])
def get_weights():
    """Returns default 40/35/25 scoring weights and standard sensitivity profiles."""
    return {
        "default_weights": DEFAULT_WEIGHTS,
        "sensitivity_profiles": SENSITIVITY_SCENARIOS,
    }


@app.get("/api/v1/scenarios", tags=["Scenarios"])
def list_scenarios():
    """Returns catalog of Formula 1 demonstration scenarios."""
    return [
        {
            "id": "melbourne_to_shanghai",
            "title": "Melbourne to Shanghai (Hybrid Power Units & Chassis)",
            "deadline_hours": 96.0,
            "has_hazmat": True,
            "description": "Critical P1 turnaround for race engines with UN Class 9 Lithium Batteries.",
        },
        {
            "id": "miami_to_imola",
            "title": "Miami to Imola (Sea Kit & Hospitality + Red Sea Disruption)",
            "deadline_hours": 504.0,
            "has_hazmat": False,
            "description": "Heavy sea-kit consignment with active Red Sea naval corridor closure.",
        },
        {
            "id": "spa_to_zandvoort",
            "title": "Spa to Zandvoort (European Double-Header Convoy)",
            "deadline_hours": 72.0,
            "has_hazmat": False,
            "description": "Intra-European freight comparing HVO100 biofuel, fossil diesel, and electric rail.",
        },
    ]


@app.post("/api/v1/scenarios/{scenario_id}/evaluate", response_model=DecisionResult, tags=["Scenarios"])
def evaluate_scenario(scenario_id: str, request: ScenarioEvaluateRequest = ScenarioEvaluateRequest()):
    """Evaluates a specific pre-configured Formula 1 scenario."""
    if scenario_id == "melbourne_to_shanghai":
        shipment, options, disruptions = get_melbourne_to_shanghai_scenario()
    elif scenario_id == "miami_to_imola":
        shipment, options, disruptions = get_miami_to_imola_scenario()
    elif scenario_id == "spa_to_zandvoort":
        shipment, options, disruptions = get_european_double_header_scenario()
    else:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")

    active_disruptions = disruptions if request.include_disruptions else []
    return engine.evaluate(
        shipment=shipment,
        options=options,
        disruptions=active_disruptions,
        weights=request.weights,
    )


@app.post("/api/v1/evaluate", response_model=DecisionResult, tags=["Decision Engine"])
def evaluate_custom(request: CustomEvaluationRequest):
    """
    Evaluates arbitrary custom shipments and transport options.
    Executes:
    1. Feasibility filtering
    2. Metrics calculation & validation (GLEC emissions, freight costs, lead time)
    3. Deadline enforcement
    4. 40/35/25 multi-objective scoring
    5. Ranking and trade-off synthesis
    """
    return engine.evaluate(
        shipment=request.shipment,
        options=request.options,
        disruptions=request.disruptions,
        weights=request.weights,
    )
