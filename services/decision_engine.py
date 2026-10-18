"""
GreenGridAI — Decision Engine (Port 8002)
Evaluates transport options using configurable weighted scoring model.
Weights: Emissions 40%, Cost 35%, Time 25%
"""
import csv
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="GreenGridAI Decision Engine", version="2.1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent.parent / "data" / "GreenGrid_V2.1.1_Final_Dataset" / "GreenGrid_V2.1.1_Final_Dataset"

WEIGHTS = {"emissions": 0.40, "cost": 0.35, "time": 0.25}

def read_csv(filename: str) -> list[dict]:
    path = DATA_DIR / filename
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def safe_float(val, default=0.0):
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

def evaluate_options(options: list[dict]) -> list[dict]:
    """Score feasible options and pick the recommended one."""
    feasible = [o for o in options if o.get("feasibility_status") == "Feasible" and str(o.get("meets_deadline", "False")).strip().lower() == "true"]
    if not feasible:
        return []

    emissions_vals = [safe_float(o.get("total_emissions_tco2e", 0)) for o in feasible]
    cost_vals = [safe_float(o.get("total_cost_usd", 0)) for o in feasible]
    time_vals = [safe_float(o.get("transit_time_days", 0)) for o in feasible]

    def normalize(val, vals):
        mn, mx = min(vals), max(vals)
        if mx == mn:
            return 0.5
        return (val - mn) / (mx - mn)

    scored = []
    for o in feasible:
        e_norm = normalize(safe_float(o.get("total_emissions_tco2e", 0)), emissions_vals)
        c_norm = normalize(safe_float(o.get("total_cost_usd", 0)), cost_vals)
        t_norm = normalize(safe_float(o.get("transit_time_days", 0)), time_vals)
        # Lower is better → invert normalized scores
        score = (WEIGHTS["emissions"] * (1 - e_norm) +
                 WEIGHTS["cost"] * (1 - c_norm) +
                 WEIGHTS["time"] * (1 - t_norm)) * 100
        o2 = dict(o)
        o2["computed_score"] = round(score, 2)
        scored.append(o2)

    scored.sort(key=lambda x: x["computed_score"], reverse=True)
    for i, o in enumerate(scored):
        o["rank"] = i + 1
        o["computed_recommended"] = (i == 0)
    return scored

@app.get("/health")
def health():
    return {"status": "ok", "service": "decision-engine", "version": "2.1.1"}

@app.get("/api/v1/weights")
def get_weights():
    return {"weights": WEIGHTS, "description": "Emissions 40%, Cost 35%, Time 25%"}

@app.get("/api/v1/scenarios")
def get_scenarios():
    rows = read_csv("scenario_tests.csv")
    return {"scenarios": rows, "count": len(rows)}

@app.get("/api/v1/scenarios/{scenario_id}/evaluate")
def evaluate_scenario(scenario_id: str):
    rows = read_csv("scenario_tests.csv")
    scenario = next((r for r in rows if r.get("test_case_id", "").lower() == scenario_id.lower()), None)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")
    options = read_csv("transport_options.csv")
    shipment_options = [o for o in options if o.get("shipment_id", "").lower() == scenario.get("shipment_id", "").lower()]
    scored = evaluate_options(shipment_options)
    return {"scenario": scenario, "evaluated_options": scored}

class EvaluateRequest(BaseModel):
    shipment_id: str

@app.post("/api/v1/evaluate")
def evaluate(req: EvaluateRequest):
    options = read_csv("transport_options.csv")
    shipment_options = [o for o in options if o.get("shipment_id", "").lower() == req.shipment_id.lower()]
    if not shipment_options:
        raise HTTPException(status_code=404, detail=f"No options for {req.shipment_id}")
    scored = evaluate_options(shipment_options)
    all_scored = []
    for o in shipment_options:
        match = next((s for s in scored if s.get("option_id") == o.get("option_id")), None)
        if match:
            all_scored.append(match)
        else:
            o2 = dict(o)
            o2["computed_score"] = 0.0
            o2["rank"] = None
            o2["computed_recommended"] = False
            all_scored.append(o2)
    recommended = scored[0] if scored else None
    return {
        "shipment_id": req.shipment_id,
        "recommended": recommended,
        "all_options": all_scored,
        "feasible_count": len(scored),
        "weights_used": WEIGHTS,
    }

@app.get("/api/v1/evaluate/{shipment_id}")
def evaluate_get(shipment_id: str):
    return evaluate(EvaluateRequest(shipment_id=shipment_id))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
