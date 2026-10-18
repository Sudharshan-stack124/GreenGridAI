"""
GreenGridAI — Data Service (Port 8001)
Serves shipments, transport options, and disruptions from CSV datasets.
"""
import csv
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="GreenGridAI Data Service", version="2.1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent.parent / "data" / "GreenGrid_V2.1.1_Final_Dataset" / "GreenGrid_V2.1.1_Final_Dataset"

def read_csv(filename: str) -> list[dict]:
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"{filename} not found at {path}")
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

@app.get("/health")
def health():
    return {"status": "ok", "service": "data-service", "version": "2.1.1"}

@app.get("/shipments")
def get_shipments():
    rows = read_csv("shipments.csv")
    return {"shipments": rows, "count": len(rows)}

@app.get("/shipments/{shipment_id}")
def get_shipment(shipment_id: str):
    rows = read_csv("shipments.csv")
    match = next((r for r in rows if r.get("shipment_id", "").lower() == shipment_id.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Shipment {shipment_id} not found")
    return match

@app.get("/shipments/{shipment_id}/options")
def get_shipment_options(shipment_id: str, feasible_only: bool = False):
    rows = read_csv("transport_options.csv")
    options = [r for r in rows if r.get("shipment_id", "").lower() == shipment_id.lower()]
    if feasible_only:
        options = [r for r in options if r.get("feasibility_status") == "Feasible"]
    return {"options": options, "count": len(options)}

@app.get("/disruptions")
def get_disruptions():
    rows = read_csv("disruptions.csv")
    return {"disruptions": rows, "count": len(rows)}

@app.get("/transport_options")
def get_all_options():
    rows = read_csv("transport_options.csv")
    return {"options": rows, "count": len(rows)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
