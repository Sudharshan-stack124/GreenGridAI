# GreenGrid Data Service — Official Version 2.1.1 Integration

This document defines the architecture, verified dataset inventory, exact schema specifications, and integration contracts for the **GreenGrid Data Service microservice** (IBM Z Datathon 2026).

---

## 1. Module Ownership & System Boundaries
- **Workstream Owner:** Kruthin (Data Service)
- **Role:** Pure data ingestion, CSV parsing, strict schema validation, provenance tracking, and RESTful API access.
- **Boundaries:** The Data Service serves raw, validated transport options and disruptions. It **does not** compute route ranking scores, dynamic optimization trade-offs, or AI scenario explanations—those belong to **Revanth (Decision Engine)** and **Punith (AI & Analytics)**.

---

## 2. Verified Version 2.1.1 Dataset Inventory

The service is integrated with the official **Version 2.1.1 Frozen Dataset** from `GreenGrid_V2.1.1_Final_Dataset.zip`.

### Verified Record Counts
| Canonical File | Description | Expected Records | Verified Records | Status |
| :--- | :--- | :--- | :--- | :--- |
| `data/shipments.csv` | 23 F1 demonstration legs + 4 commercial stress benchmarks | 27 rows (27 cols) | **27 rows** | **Verified (100%)** |
| `data/transport_options.csv` | 4 candidate modes (Air, Road, Rail, Sea) per shipment | 108 rows (21 cols) | **108 rows** | **Verified (100%)** |
| `data/disruptions.csv` | Global simulated disruptions (DIS-01 through DIS-05) | 5 rows (11 cols) | **5 rows** | **Verified (100%)** |
| `data/scenario_tests.csv` | Baseline vs disrupted stress tests (TC-01 through TC-08) | 8 rows (20 cols) | **8 rows** | **Verified (100%)** |
| `data/data_dictionary.csv` | Complete definitions for all columns | 79 rows (7 cols) | **79 rows** | **Verified (100%)** |

### Official Validation Script Result
Executing `python3 scripts/generate_and_validate_dataset.py` verifies all mathematical invariants, distance circuities, DEFRA emission factors, and referential keys:
```
ALL VALIDATION & TARGETED AUDIT INTEGRITY CHECKS PASSED (0 Errors).
Total Shipments: 27 (F1 Demonstration: 23, Commercial General: 4)
Total Transport Options: 108 (Feasible: 71, Infeasible: 37)
Total Disruptions: 5
Total Scenario Test Cases: 8 (TC-01 through TC-08)
```

---

## 3. Data Normalization & Invariant Rules

To ensure downstream algorithms in the Decision Engine do not miscalculate:
1. **Infeasible Route Placeholder Conversion:**
   In `transport_options.csv`, infeasible routes (e.g. transoceanic road or rail where no track exists) contain `0.0` or placeholder zeros. The Data Service converts these fields to `null` (`None`) in API responses:
   - `transit_time_days: null` (prevents treating infeasible routes as 0 days)
   - `total_cost_usd: null` (prevents treating infeasible routes as free / $0)
   - `total_emissions_tco2e: null`
   - `route_distance_km: null`
   - `meets_deadline: false`
   - `is_recommended: false`
2. **Preservation of Genuine Zeroes:**
   On feasible routes, genuine zero values (e.g. `composite_score: 0.0` for severely delayed sea cargo) are preserved as valid numerical values.
3. **Boolean Parsing:**
   Fields like `meets_deadline` and `is_recommended` are strictly parsed from strings (`"True"` / `"False"`) into native boolean values.

---

## 4. API Integration Contracts (for Revanth & Bharath)

### Base URL
- Default local: `http://localhost:8001`
- Target LinuxONE: `http://<linuxone-ip>:8001` or via reverse proxy `http://<linuxone-ip>/api/data`

---

### `GET /health`
Returns service status, environment details, and dataset verification counts.

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "data-service",
  "version": "2.1.1",
  "dataset_version": "Version 2.1.1 (Official Frozen Dataset)",
  "dataset_status": "verified",
  "data_directory": "/path/to/services/data-service/data",
  "loaded_records": {
    "shipments": 27,
    "transport_options": 108,
    "disruptions": 5,
    "scenario_tests": 8,
    "data_dictionary": 79
  },
  "expected_records": {
    "shipments": 27,
    "transport_options": 108,
    "disruptions": 5,
    "scenario_tests": 8,
    "data_dictionary": 79
  },
  "integrity_verified": true
}
```

---

### `GET /shipments`
Retrieves all 27 shipments with optional filtering.

**Query Parameters:**
- `use_case` (optional): `F1_Demonstration` or `Commercial_General`
- `destination_country` (optional): e.g. `Saudi Arabia`, `Japan`, `USA`
- `min_weight_tonnes` (optional): float, e.g. `500.0`

**Response (200 OK):**
```json
[
  {
    "shipment_id": "SHP-01",
    "use_case_type": "F1_Demonstration",
    "leg_number": 1,
    "origin_round": 1,
    "origin_name": "Sakhir",
    "origin_circuit": "Bahrain International Circuit",
    "origin_facility": "BIC Paddock Logistics Gate",
    "origin_country": "Bahrain",
    "origin_lat": 26.031,
    "origin_lon": 50.512,
    "origin_region": "Middle East",
    "destination_round": 2,
    "destination_name": "Jeddah",
    "destination_circuit": "Jeddah Corniche Circuit",
    "destination_facility": "Jeddah Corniche Paddock",
    "destination_country": "Saudi Arabia",
    "destination_lat": 21.632,
    "destination_lon": 39.104,
    "destination_region": "Middle East",
    "great_circle_km": 1259,
    "cargo_weight_tonnes": 1200.0,
    "cargo_description": "Formula 1 Racing Cars, Spares & Paddock Infrastructure",
    "weight_provenance": "DHL public baseline benchmark (1,200 metric tonnes standard freight volume)",
    "departure_date": "2027-03-15",
    "delivery_deadline": "2027-03-18",
    "available_window_days": 3.0,
    "notes": "F1 Round 1 (Sakhir) -> Round 2 (Jeddah)",
    "dataset_version": "2.1.1"
  }
]
```

---

### `GET /shipments/{shipment_id}`
Retrieves a single shipment by ID.

**Response (200 OK):** Same schema as individual shipment item above.  
**Errors:** Returns `404 Not Found` if `shipment_id` is invalid.

---

### `GET /disruptions`
Retrieves the 5 simulated global logistics disruptions.

**Query Parameters:**
- `affected_mode` (optional): `Air`, `Sea`, `Road`, `Rail`

**Response (200 OK):**
```json
[
  {
    "disruption_id": "DIS-01",
    "title": "Red Sea & Bab-el-Mandeb Maritime Security Closure",
    "type": "Geopolitical / Chokepoint Closure",
    "affected_mode": "Sea",
    "geographic_corridor": "Asia / Middle East -> Europe Maritime Corridors",
    "delay_impact_days": 13.5,
    "cost_surcharge_usd": 145000.0,
    "emissions_increase_pct": 32.0,
    "description": "Container traffic rerouted via Cape of Good Hope, adding ~6,500 km maritime detour. Directly impacts Asia/Middle East to Europe/Oceania sea lanes.",
    "status": "Simulated Active Scenario",
    "mitigation_mode": "Eurasia Rail Express or Dedicated Air Charter",
    "dataset_version": "2.1.1"
  }
]
```

---

### `GET /shipments/{shipment_id}/options`
Retrieves candidate transport options (Air, Road, Rail, Sea) for the requested shipment.

**Query Parameters:**
- `feasible_only` (optional, boolean): `true` to filter out `Infeasible` routes.

**Response (200 OK):**
```json
[
  {
    "option_id": "OPT-SHP-01-AIR",
    "shipment_id": "SHP-01",
    "use_case_type": "F1_Demonstration",
    "mode": "Air",
    "feasibility_status": "Feasible",
    "feasibility_reason": "Direct cargo flight via international commercial airport network",
    "route_distance_km": 1360,
    "circuity_multiplier": 1.08,
    "transit_time_days": 1.6,
    "estimated_arrival_date": "2027-03-16",
    "meets_deadline": true,
    "deadline_margin_days": 1.4,
    "fixed_cost_usd": 192000.0,
    "distance_cost_usd": 359040.0,
    "total_cost_usd": 551040.0,
    "emission_factor_kg_per_tkm": 0.62,
    "total_emissions_tco2e": 1011.8,
    "composite_score": 25.0,
    "is_recommended": false,
    "data_confidence": "Benchmark Assumption (Documented Formula)",
    "cost_status": "Illustrative Estimate (Non-commercial Quotation)",
    "dataset_version": "2.1.1"
  },
  {
    "option_id": "OPT-SHP-01-RAIL",
    "shipment_id": "SHP-01",
    "use_case_type": "F1_Demonstration",
    "mode": "Rail",
    "feasibility_status": "Infeasible",
    "feasibility_reason": "No operational intercontinental freight rail corridor between Middle East and Middle East",
    "route_distance_km": null,
    "circuity_multiplier": null,
    "transit_time_days": null,
    "estimated_arrival_date": "N/A",
    "meets_deadline": false,
    "deadline_margin_days": -999.0,
    "fixed_cost_usd": null,
    "distance_cost_usd": null,
    "total_cost_usd": null,
    "emission_factor_kg_per_tkm": 0.0281,
    "total_emissions_tco2e": null,
    "composite_score": null,
    "is_recommended": false,
    "data_confidence": "Not Applicable",
    "cost_status": "Illustrative (Infeasible)",
    "dataset_version": "2.1.1"
  }
]
```

---

## 5. Local Setup & Testing

### Installation & Run
```bash
cd services/data-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Running Automated Test Suite
```bash
pytest tests/ -v
```
All 15 test cases pass (0 errors), covering manifest record counts, referential integrity, placeholder nullification, query filtering, and 404/500 error boundaries.
