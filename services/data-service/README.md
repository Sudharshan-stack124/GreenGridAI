# GreenGrid Data Service Microservice

Backend Data Service microservice for **GreenGrid**, an AI-assisted logistics decision-support platform for the **IBM Z Datathon 2026**.

## 1. Module Responsibility & Boundaries
- **Owner:** Kruthin (Data Service)
- **Role:** Pure data loading, schema validation, and REST API access for shipments, disruptions, and multi-modal transport options.
- **Out of Scope:** This service does *not* compute route recommendations, carbon rankings, or AI scenario explanations (which belong to Revanth's Decision Engine and Punith's AI Service).

## 2. Dataset Status & Limitation Notice
> **Important Notice on Data Mode:**
> GreenGrid Version 2.1.1 official dataset was not pre-populated in the repository or downloads at build time.
> In accordance with hackathon protocol, this service generates and uses **clearly labelled synthetic demo records** (`data_mode: "synthetic_demo"`). All endpoints return this metadata tag. When the official Version 2.1.1 CSV files are provided, place them inside `services/data-service/data/` or set the `GREENGRID_DATA_DIR` environment variable to point to their directory.

### Key Data Normalization Rules Implemented:
- **Placeholder Values:** Infeasible options with placeholder 0s or empty entries for transit time, cost, or emissions are automatically converted to `null` (None), preventing algorithms from treating infeasible routes as "zero cost" or "instantaneous".
- **Disruption IDs:** Fields containing `NONE`, empty strings, or semicolon-delimited values (e.g. `DIS-001;DIS-003`) are parsed into clean lists of valid disruption IDs.
- **Standard Units:**
  - `total_weight_tons`: Metric tons
  - `deadline_hours` / `transit_time_hours`: Hours
  - `cost_usd`: USD ($)
  - `emissions_kg_co2e`: Kilograms CO₂ equivalent

---

## 3. API Contract & Integration Specifications

This documentation serves as the contract for **Revanth (Decision Engine)** and **Bharath (User Dashboard)**.

### Base URL
Default local port: `http://localhost:8001` (Configurable via `PORT` environment variable).

### `GET /health`
Returns service status, loaded record metrics, and dataset mode.

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "data-service",
  "version": "1.0.0",
  "data_mode": "synthetic_demo",
  "dataset_version": "synthetic-demo-v1 (GreenGrid v2.1.1 fallback)",
  "loaded_records": {
    "shipments_count": 5,
    "disruptions_count": 5,
    "shipments_with_options_count": 5
  }
}
```

### `GET /shipments`
Returns a list of all shipments with optional filtering.

**Query Parameters:**
- `priority` (optional): `critical`, `high`, `standard`
- `status` (optional): `scheduled`, `in_transit`, `delivered`, `delayed`

**Response (200 OK):**
```json
[
  {
    "shipment_id": "SHP-F1-001",
    "origin": "Silverstone UK",
    "destination": "Monza Italy",
    "cargo_category": "Critical Racing Equipment",
    "total_weight_tons": 45.0,
    "deadline_hours": 96.0,
    "priority": "critical",
    "status": "in_transit",
    "data_mode": "synthetic_demo"
  }
]
```

### `GET /shipments/{shipment_id}`
Returns details for a single shipment.

**Response (200 OK):**
```json
{
  "shipment_id": "SHP-F1-001",
  "origin": "Silverstone UK",
  "destination": "Monza Italy",
  "cargo_category": "Critical Racing Equipment",
  "total_weight_tons": 45.0,
  "deadline_hours": 96.0,
  "priority": "critical",
  "status": "in_transit",
  "data_mode": "synthetic_demo"
}
```
**Errors:** Returns `404 Not Found` if `shipment_id` does not exist:
```json
{
  "detail": "Shipment with ID 'NON_EXISTENT' not found."
}
```

### `GET /disruptions`
Returns active or all logistical disruptions across global corridors.

**Query Parameters:**
- `active_only` (optional, boolean): `true` / `false` (default: `false`)
- `severity` (optional): `low`, `medium`, `high`, `critical`

**Response (200 OK):**
```json
[
  {
    "disruption_id": "DIS-001",
    "title": "Suez Canal Vessel Congestion",
    "type": "chokepoint_delay",
    "affected_modes": ["sea"],
    "severity": "high",
    "location_name": "Suez Canal Egypt",
    "delay_hours_impact": 48.0,
    "cost_multiplier_impact": 1.25,
    "description": "Severe container backlog causing critical sea transit delays",
    "active": true,
    "data_mode": "synthetic_demo"
  }
]
```

### `GET /shipments/{shipment_id}/options`
Returns transport options for the specified shipment.

**Query Parameters:**
- `feasible_only` (optional, boolean): `true` / `false` (default: `false`)

**Response (200 OK):**
```json
[
  {
    "option_id": "OPT-001",
    "shipment_id": "SHP-F1-001",
    "mode": "air",
    "provider_name": "DHL Global Forwarding",
    "transit_time_hours": 18.0,
    "cost_usd": 42500.0,
    "emissions_kg_co2e": 14200.0,
    "is_feasible": true,
    "infeasibility_reason": null,
    "disruption_ids": [],
    "data_mode": "synthetic_demo"
  },
  {
    "option_id": "OPT-015",
    "shipment_id": "SHP-F1-005",
    "mode": "sea",
    "provider_name": "Rotterdam Short Sea Barge",
    "transit_time_hours": null,
    "cost_usd": null,
    "emissions_kg_co2e": null,
    "is_feasible": false,
    "infeasibility_reason": "No viable direct inland waterway connecting Spa and Zandvoort",
    "disruption_ids": ["DIS-004"],
    "data_mode": "synthetic_demo"
  }
]
```
**Errors:** Returns `404 Not Found` if `shipment_id` does not exist.

---

## 4. Setup and Local Execution Instructions

### Prerequisites
- Python 3.10+ (tested and verified on Python 3.14)

### 1. Create and Activate Virtual Environment
```bash
cd services/data-service
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Tests
```bash
pytest tests/ -v
```
All 12 unit tests verify:
- Health endpoint schema and data mode
- Shipment listing & query filtering
- 404 error handling for non-existent shipment queries
- Disruption listing, active status filtering, and severity filtering
- Transport option queries and feasibility filtering
- Strict handling of placeholder 0 values on infeasible routes
- Handling of missing CSV files and empty values

### 4. Run the Service
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```
Interactive API documentation will be available at `http://localhost:8001/docs`.

### Environment Variables
- `PORT`: HTTP port to bind (default: `8001`)
- `GREENGRID_DATA_DIR`: Custom path to folder containing CSV files (default: `./data`)
