"""
GreenGridAI — Analytics API (Port 8003)
Exposes aggregate analytics and shipment-level reporting endpoints.
"""
import csv
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict

app = FastAPI(title="GreenGridAI Analytics API", version="2.1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent.parent / "data" / "GreenGrid_V2.1.1_Final_Dataset" / "GreenGrid_V2.1.1_Final_Dataset"

def read_csv(filename: str) -> list[dict]:
    path = DATA_DIR / filename
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def safe_float(val, default=0.0):
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics-api", "version": "2.1.1"}

@app.get("/analytics/summary")
def get_summary():
    shipments = read_csv("shipments.csv")
    options = read_csv("transport_options.csv")
    disruptions = read_csv("disruptions.csv")

    recommended = [o for o in options if o.get("is_recommended", "False") == "True"]
    feasible = [o for o in options if o.get("feasibility_status") == "Feasible"]

    mode_counts = defaultdict(int)
    mode_emissions = defaultdict(float)
    mode_cost = defaultdict(float)
    for o in recommended:
        mode = o.get("mode", "Unknown")
        mode_counts[mode] += 1
        mode_emissions[mode] += safe_float(o.get("total_emissions_tco2e", 0))
        mode_cost[mode] += safe_float(o.get("total_cost_usd", 0))

    total_recommended_emissions = sum(safe_float(o.get("total_emissions_tco2e", 0)) for o in recommended)
    total_feasible_emissions = sum(safe_float(o.get("total_emissions_tco2e", 0)) for o in feasible)
    savings_pct = 0.0
    if total_feasible_emissions > 0:
        savings_pct = round((1 - total_recommended_emissions / total_feasible_emissions) * 100, 1)

    f1_shipments = [s for s in shipments if s.get("use_case_type") == "F1_Demonstration"]
    comm_shipments = [s for s in shipments if s.get("use_case_type") == "Commercial_General"]

    return {
        "total_shipments": len(shipments),
        "f1_shipments": len(f1_shipments),
        "commercial_shipments": len(comm_shipments),
        "total_transport_options": len(options),
        "feasible_options": len(feasible),
        "infeasible_options": len(options) - len(feasible),
        "recommendations_made": len(recommended),
        "active_disruptions": len(disruptions),
        "mode_distribution": dict(mode_counts),
        "mode_emissions_tco2e": {k: round(v, 1) for k, v in mode_emissions.items()},
        "mode_cost_usd": {k: round(v, 0) for k, v in mode_cost.items()},
        "total_recommended_emissions_tco2e": round(total_recommended_emissions, 1),
        "estimated_emissions_savings_pct_vs_all_feasible": savings_pct,
    }

@app.get("/analytics/shipments")
def get_shipment_analytics():
    shipments = read_csv("shipments.csv")
    options = read_csv("transport_options.csv")

    opts_by_shipment = defaultdict(list)
    for o in options:
        opts_by_shipment[o["shipment_id"]].append(o)

    results = []
    for s in shipments:
        sid = s["shipment_id"]
        sopts = opts_by_shipment.get(sid, [])
        recommended = next((o for o in sopts if o.get("is_recommended") == "True"), None)
        feasible = [o for o in sopts if o.get("feasibility_status") == "Feasible"]

        results.append({
            "shipment_id": sid,
            "use_case_type": s.get("use_case_type"),
            "origin": s.get("origin_name"),
            "destination": s.get("destination_name"),
            "cargo_weight_tonnes": safe_float(s.get("cargo_weight_tonnes", 0)),
            "available_window_days": safe_float(s.get("available_window_days", 0)),
            "recommended_mode": recommended.get("mode") if recommended else None,
            "recommended_cost_usd": safe_float(recommended.get("total_cost_usd", 0)) if recommended else None,
            "recommended_emissions_tco2e": safe_float(recommended.get("total_emissions_tco2e", 0)) if recommended else None,
            "recommended_transit_days": safe_float(recommended.get("transit_time_days", 0)) if recommended else None,
            "feasible_options_count": len(feasible),
            "composite_score": safe_float(recommended.get("composite_score", 0)) if recommended else None,
        })
    return {"shipments": results, "count": len(results)}

@app.get("/analytics/shipments/{shipment_id}")
def get_shipment_analytics_detail(shipment_id: str):
    shipments = read_csv("shipments.csv")
    options = read_csv("transport_options.csv")
    shipment = next((s for s in shipments if s.get("shipment_id", "").lower() == shipment_id.lower()), None)
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment {shipment_id} not found")
    sopts = [o for o in options if o.get("shipment_id", "").lower() == shipment_id.lower()]
    return {"shipment": shipment, "options": sopts}

@app.get("/analytics/emissions_by_mode")
def emissions_by_mode():
    options = read_csv("transport_options.csv")
    recommended = [o for o in options if o.get("is_recommended") == "True"]
    by_mode = defaultdict(lambda: {"count": 0, "total_emissions": 0.0, "total_cost": 0.0, "avg_transit_days": []})
    for o in recommended:
        mode = o.get("mode", "Unknown")
        by_mode[mode]["count"] += 1
        by_mode[mode]["total_emissions"] += safe_float(o.get("total_emissions_tco2e", 0))
        by_mode[mode]["total_cost"] += safe_float(o.get("total_cost_usd", 0))
        by_mode[mode]["avg_transit_days"].append(safe_float(o.get("transit_time_days", 0)))

    result = {}
    for mode, data in by_mode.items():
        days = data["avg_transit_days"]
        result[mode] = {
            "count": data["count"],
            "total_emissions_tco2e": round(data["total_emissions"], 1),
            "total_cost_usd": round(data["total_cost"], 0),
            "avg_transit_days": round(sum(days) / len(days), 1) if days else 0,
        }
    return {"emissions_by_mode": result}

@app.get("/analytics/disruptions")
def get_disruption_analytics():
    disruptions = read_csv("disruptions.csv")
    scenarios = read_csv("scenario_tests.csv")
    result = []
    for d in disruptions:
        did = d["disruption_id"]
        related = [s for s in scenarios if s.get("disruption_id") == did]
        result.append({
            "disruption_id": did,
            "title": d.get("title"),
            "type": d.get("type"),
            "affected_mode": d.get("affected_mode"),
            "delay_impact_days": safe_float(d.get("delay_impact_days", 0)),
            "cost_surcharge_usd": safe_float(d.get("cost_surcharge_usd", 0)),
            "emissions_increase_pct": safe_float(d.get("emissions_increase_pct", 0)),
            "status": d.get("status"),
            "related_scenarios": [s["test_case_id"] for s in related],
        })
    return {"disruptions": result, "count": len(result)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
