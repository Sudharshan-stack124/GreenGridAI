# GreenGrid Version 2.1.1 — Final Dataset Audit Report
**Date:** October 14, 2026  
**Status:** Frozen & Fully Validated  
**Datathon Track:** IBM Z Datathon 2026 — Carbon-Conscious Logistics Decision Support  

---

## 1. Executive Summary

This report documents the consolidated read-only audit of the GreenGrid Version 2.1.1 logistics dataset. The dataset supports multi-modal logistics planning across 23 Formula 1 world championship global transport legs and 4 general commercial freight stress benchmarks.

All numerical calculations (transit times, physical route distances, operational freight costs, greenhouse gas emissions, and multi-criteria composite scores) were independently re-computed from first principles and compared against the stored values across all 108 transport options and 8 disruption test scenarios.

| Audit Domain | Scope Checked | Result | Status |
|---|---|---|---|
| **1. Dataset Integrity** | 27 shipments, 108 options, 5 disruptions, 8 test cases | 0 duplicate IDs; 0 broken foreign keys | **PASS (100%)** |
| **2. Cost Calculations** | All 108 transport options (Fixed + Distance) | Stored vs Recalculated = 0 mismatches | **PASS (100%)** |
| **3. Transit Time Calculations** | All 108 transport options (Buffer + Speed/Hours) | Stored vs Recalculated = 0 mismatches | **PASS (100%)** |
| **4. Disruption Simulation** | All 8 scenario test cases (TC-01 through TC-08) | Baseline & disrupted metrics match 100% | **PASS (100%)** |
| **5. Feasibility & Recommendation** | Deadline filtering, Min-Max Normalization, Scoring | 27/27 shipments have valid optimal choices | **PASS (100%)** |
| **6. Prototype Readiness** | Schema edge cases, type coercion, nullability | 5 critical frontend/backend alerts documented | **CLEARED FOR BUILD** |

---

## 2. Dataset Integrity & Relational Verification

- **Shipments (`shipments.csv`):** Exactly 27 records (23 F1 demonstration legs + 4 commercial stress benchmarks). Duplicate IDs: 0.
- **Transport Options (`transport_options.csv`):** Exactly 108 records ($27 \times 4$ candidate modes: Air, Road, Rail, Sea). Duplicate IDs: 0.
- **Disruptions (`disruptions.csv`):** Exactly 5 global simulated disruption scenarios (`DIS-01` to `DIS-05`). Duplicate IDs: 0.
- **Scenario Tests (`scenario_tests.csv`):** Exactly 8 end-to-end evaluation cases (`TC-01` to `TC-08`). Duplicate IDs: 0.
- **Data Dictionary (`data_dictionary.csv`):** Exactly 79 definitions comprehensively covering 100% of the columns across all 4 operational tables.
- **Foreign Key Consistency:** Every option links to a valid `shipment_id`. Every scenario test links to a valid `shipment_id` and either a valid `disruption_id` or sentinel `'NONE'` (for baseline SLA compliance checks in TC-06 and TC-07).

---

## 3. Cost & Transit Time Formula Verification

### A. Grounded Freight Cost (USD)
$$\text{Fixed Cost} = \text{round}(\text{Fixed Rate per Tonne} \times \text{Weight})$$
$$\text{Distance Cost} = \text{round}(\text{Rate per Tonne-km} \times \text{Weight} \times \text{Route Distance})$$
$$\text{Total Cost} = \text{Fixed Cost} + \text{Distance Cost}$$

- **Air:** Fixed = $160.0/t, Distance Rate = $0.220 / t-km
- **Road:** Fixed = $50.0/t, Distance Rate = $0.120 / t-km
- **Rail:** Fixed = $40.0/t, Distance Rate = $0.045 / t-km
- **Sea:** Fixed = $75.0/t, Distance Rate = $0.015 / t-km
- **Result:** 108 / 108 transport options match exact formula (0 mismatches). Infeasible options correctly assigned $0.

### B. Operational Transit Time (Days)
$$\text{Transit Days} = \text{round}\left(\text{Handling Buffer Days} + \frac{\text{Route Distance km}}{\text{Speed km/h} \times \text{Daily Operating Hours}}, 1\right)$$

- **Air:** Buffer = 1.5d, Speed = 800 km/h, Operating = 24 h/day (19,200 km/day)
- **Road:** Buffer = 0.5d, Speed = 60 km/h, Operating = 16 h/day (960 km/day)
- **Rail:** Buffer = 2.0d, Speed = 40 km/h, Operating = 18 h/day (720 km/day)
- **Sea:** Buffer = 5.0d, Speed = 33.3 km/h, Operating = 24 h/day (800 km/day)
- **Result:** 108 / 108 transport options match exact formula (0 mismatches). Infeasible options correctly assigned 0.0 days.

---

## 4. Disruption Simulation & Scenario Tests (TC-01 through TC-08)

Deterministic adjustments applied by `apply_disruption()`:
1. $\text{Transit Days}_{\text{disrupted}} = \text{round}(\text{Base Transit} + \text{delay\_impact\_days}, 1)$
2. $\text{Total Cost}_{\text{disrupted}} = \text{round}(\text{Base Cost} + \text{cost\_surcharge\_usd})$
3. $\text{Emissions}_{\text{disrupted}} = \text{round}(\text{Base Emissions} \times (1 + \text{emissions\_increase\_pct} / 100), 1)$

### Scenario Verification Matrix:

| Test Case | Shipment | Tested Mode | Disruption | Baseline (Days / Cost / CO₂) | Disrupted (Days / Cost / CO₂) | Status |
|---|---|---|---|---|---|---|
| **TC-01** | SHP-02 | Sea | DIS-01 | 31.5d / $294.4k / 294.4t | 45.0d / $439.4k / 388.6t | **PASS** |
| **TC-02** | SHP-10 | Road | DIS-03 | 2.2d / $294.7k / 225.5t | 4.2d / $342.7k / 259.3t | **PASS** |
| **TC-03** | SHP-07 | Air | DIS-02 | 1.8d / $1.94M / 4,919.3t | 4.3d / $2.16M / 5,509.6t | **PASS** |
| **TC-04** | SHP-04 | Sea | DIS-05 | 8.0d / $123.6k / 33.9t | 12.5d / $183.6k / 36.6t | **PASS** |
| **TC-05** | COMM-01 | Sea | DIS-01 | 24.8d / $17.6k / 8.3t | 38.3d / $162.6k / 11.0t | **PASS** |
| **TC-06** | COMM-02 | Road | NONE | 1.8d / $4.4k / 3.1t | 1.8d / $4.4k / 3.1t | **PASS** |
| **TC-07** | COMM-03 | Air | NONE | 1.9d / $13.6k / 37.3t | 1.9d / $13.6k / 37.3t | **PASS** |
| **TC-08** | SHP-05 | Sea | DIS-04 | 30.7d / $371.3k / 285.8t | 38.7d / $466.3k / 337.2t | **PASS** |

All narrative explanations strictly match the dynamically generated CSV metrics.

---

## 5. Feasibility & Recommendation Algorithm

- **Eligibility Filter:** Only physically feasible options with $\text{transit\_time\_days} \le \text{available\_window\_days}$ qualify.
- **Normalization:** $\text{norm\_metric} = 1.0 - \frac{\text{val} - \text{min}}{\text{max} - \text{min}}$ (if $\text{max} > \text{min}$, else 1.0).
- **Composite Score:** $0.35 \times \text{norm\_cost} + 0.40 \times \text{norm\_co2} + 0.25 \times \text{norm\_time} \times 100$.
- **Result:** Exactly 1 recommended mode per shipment with eligible options. Air is recommended for tight transoceanic F1 legs; Rail is recommended for COMM-01 (Score: 77.1 vs Sea: 75.0); Road is recommended for COMM-02 (Score: 75.0); Air is recommended for COMM-03 cold-chain; Sea is recommended for COMM-04 bulk machinery.

---

## 6. Implementation Notes for Prototype Development

1. **Boolean Coercion:** Parse `meets_deadline` and `is_recommended` as string checks (`=== 'True'`).
2. **Nullable Round Numbers:** Handle empty string `""` in `origin_round`, `destination_round`, and `leg_number` for commercial shipments (`COMM-01` to `COMM-04`).
3. **Disruption Joins:** Use `LEFT JOIN` on `disruption_id` to accommodate `'NONE'` in TC-06 and TC-07.
4. **Distinction between Candidate and Winner:** In `scenario_tests.csv`, `baseline_mode` is the mode of the evaluated candidate (`tested_mode`). The recommended winner is detailed in `explanation` and `recommended_action`.
5. **Infeasible Placeholders:** Infeasible options have 0 values and `-999.0` margin; display with dedicated inactive styling in UI.
