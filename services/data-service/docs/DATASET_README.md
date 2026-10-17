# GreenGrid Version 2.1.1 Dataset Package
**IBM Z Datathon 2026**
*Disruption-Aware, Deadline-Constrained, Carbon-Conscious Logistics Decision Support*

---

## 1. Overview & Contents
This archive contains the corrected, frozen Version 2.1.1 dataset for the GreenGrid decision-support platform.
It combines a primary operational demonstration dataset (23 consecutive Formula 1 global logistics legs) alongside four synthetic commercial freight benchmarks, evaluated under a shared, domain-agnostic physical and economic routing engine.

### Included Files
1. **`shipments.csv`** (27 data records)
   - Primary data for 23 race-to-race F1 legs and 4 commercial general freight test shipments.
   - Contains origin/destination coordinates (lat/long), facilities, regions, great-circle distances, cargo weights, departure dates, delivery deadlines, and available planning windows.
2. **`transport_options.csv`** (108 data records)
   - 4 candidate transport modes (Air, Road, Rail, Sea) evaluated for each of the 27 shipments (27 * 4 = 108).
   - Contains physical routing feasibility status, justification reasons, operational route distances (with modal circuity), transit days, arrival dates, deadline compliance status, fixed and distance costs, carbon emissions (tCO2e), composite decision scores (0-100), and recommended alternative flags.
3. **`disruptions.csv`** (5 data records)
   - 5 global simulated disruption scenarios representing distinct failure modes:
     - `DIS-01`: Red Sea & Bab-el-Mandeb Maritime Security Closure (Sea chokepoint detour via Cape of Good Hope)
     - `DIS-02`: North Atlantic Airspace Severe Jetstream & ATC Strike (Aviation delay & holding burn)
     - `DIS-03`: Eurotunnel & Dover Channel Port Industrial Action (Trucking cross-border bottleneck)
     - `DIS-04`: Panama Canal Freshwater Draft Restrictions (Maritime waterway capacity bottleneck)
     - `DIS-05`: Typhoon Malakas East China Sea Port Operations Halt (Extreme weather port crane shutdown)
4. **`scenario_tests.csv`** (8 data records)
   - 8 end-to-end evaluation cases (TC-01 through TC-08) testing baseline vs. disrupted performance, deadline breaches, and explainable recommendations.
   - Version 2.1.1 strictly aligns all narrative explanation figures with the dynamically generated CSV metrics.
5. **`data_dictionary.csv`** (79 data records)
   - Comprehensive documentation of every table, column, data type, unit, provenance label (Source-based, Calculated, Benchmark Assumption, Simulated), description, and validation rule across all four operational tables.
6. **`generate_and_validate_dataset.py`**
   - The standalone, self-validating Python engine that executes all mathematical calculations, disruption simulation (`apply_disruption()`), and 11 automated integrity/regression checks.
7. **`README.md`**
   - This documentation file.
8. **`EMISSIONS_SOURCE_VERIFICATION_REPORT.md`**
   - Authoritative source verification audit report mapping every emission factor to official UK DESNZ/DEFRA greenhouse gas conversion workbooks.
9. **`FINAL_DATASET_AUDIT_REPORT.md`**
   - Consolidated 100% mathematical, relational, and algorithmic readiness audit report verifying all 108 transport options and 8 disruption test scenarios.
10. **`MANIFEST.md`**
   - Package contents, record counts, and file-level verification manifest.

---

## 2. Version 2.1.1 Targeted Corrections Log
- **TC-01 Narrative:** Synchronized baseline Sea transit days (corrected from 33.9d to 31.5d) and disrupted Sea transit days (corrected from 47.4d to 45.0d) to exactly match `scenario_tests.csv`.
- **TC-02 Narrative:** Synchronized baseline Road freight cost (corrected from $280.4k to $294,720) and emissions (corrected from 216.5 tCO2e to 225.5 tCO2e) reflecting the operational 1.30x UK cross-channel circuity route.
- **TC-03 Narrative:** Synchronized baseline Air freight emissions (corrected from 4,919.1 tCO2e to 4,919.3 tCO2e) matching exact calculation.
- **Validation Suite:** Added Targeted Test 5 directly into `generate_and_validate_dataset.py` asserting that narrative strings strictly match generated numerical data.

---

## 3. Core Operational Formulas & Units

### A. Distance & Physical Feasibility
- **Great-Circle Distance (D_GC):** Kilometers (km), Haversine formula (R = 6,371 km).
- **Route Distance (D_Route):** D_Route = round(D_GC * Circuity Multiplier).
  - Air: 1.08x (International flight path airways)
  - Road: 1.20x - 1.30x (Highway networks; infeasible across oceans or Darien Gap)
  - Rail: 1.25x - 1.35x (Freight corridors: TEN-T Europe, China-Europe Railway Express, BTK)
  - Sea: 1.45x - 1.70x (Nautical lanes via Suez, Malacca, Panama; infeasible on inland hops)

### B. Transit Time (Days)
Transit Time (days) = Handling Buffer (days) + (D_Route / (Speed_kmh * Daily_Operating_Hours))
- **Air:** Buffer = 1.5d, Speed = 800 km/h, Operating = 24 h/day (19,200 km/day)
- **Road:** Buffer = 0.5d, Speed = 60 km/h, Operating = 16 h/day (relay drivers, 960 km/day)
- **Rail:** Buffer = 2.0d, Speed = 40 km/h, Operating = 18 h/day (720 km/day)
- **Sea:** Buffer = 5.0d, Speed = 33.3 km/h (18 knots), Operating = 24 h/day (800 km/day)

### C. Greenhouse Gas Emissions (Metric Tonnes CO2e)
Total Emissions (tCO2e) = (Cargo Weight [tonnes] * D_Route [km] * Factor [kg CO2e / t-km]) / 1,000
- **Emission Factors (UK DESNZ / DEFRA 2023/2024 Published Conversion Factors):**
  - **Air Freight:** 0.6200 kg CO2e / tonne-km (Freight flights, dedicated freighter average, Scope 3)
  - **Road Freight:** 0.1153 kg CO2e / tonne-km (All articulated HGVs >33t average, Scope 3)
  - **Rail Freight:** 0.0281 kg CO2e / tonne-km (Freight train grid weighted average, Scope 3)
  - **Sea Freight:** 0.0116 kg CO2e / tonne-km (Deep-sea container ship average, Scope 3)
  - **Sea+Road:** 0.0245 kg CO2e / tonne-km (Provisional weighted short-sea/drayage blend)

### D. Grounded Freight Cost (USD)
Total Cost (USD) = (Fixed Handling per Tonne * Weight) + (Rate per Tonne-km * Weight * D_Route)
- **Air:** Fixed = $160/t, Distance Rate = $0.220 / t-km
- **Road:** Fixed = $50/t, Distance Rate = $0.120 / t-km
- **Rail:** Fixed = $40/t, Distance Rate = $0.045 / t-km
- **Sea:** Fixed = $75/t, Distance Rate = $0.015 / t-km

### E. Multi-Criteria Recommendation Algorithm
- **Eligibility Filter:** Only physically feasible options that satisfy the delivery deadline enter the scoring pool.
- **Min-Max Normalization (0.0 to 1.0, lower is better):**
  norm_metric = 1.0 - ((val - min) / (max - min))
- **Composite Score (0 to 100):**
  Composite Score = (0.35 * norm_cost + 0.40 * norm_co2 + 0.25 * norm_time) * 100
  - Carbon emissions has the highest individual weight (40%).
  - Exactly one optimal option per shipment is awarded is_recommended = True.

---

## 4. How to Run Dataset Validation
The validation script runs on Python 3 with zero external dependencies (standard library only).

### Execution Command:
```bash
python3 generate_and_validate_dataset.py
```

### Checks Executed by the Script:
1. Record counts for shipments (27), options (108), disruptions (5), and scenario tests (8).
2. Referential integrity across foreign keys.
3. Physical routing barrier sanity (oceans, Darien Gap).
4. Strict positivity of metrics on feasible options; zeroing of infeasible options.
5. Chronological date validity (delivery deadlines strictly > departure dates).
6. Exactly one recommendation per eligible shipment.
7. COMM-01 mathematical alignment check (Rail score 77.1 vs Sea score 75.0).
8. DIS-04 Panama Canal corridor coverage check.
9. Dynamic apply_disruption() execution and arithmetic validation.
10. Single disruption application guard preventing double counting.
11. Scenario narrative consistency check verifying TC-01, TC-02, TC-03 text matches generated rows.

---

## 5. Documented Assumptions & Limitations
1. **Provisional Multimodal Emission Factor:** The Sea+Road factor (0.0245 kg CO2e/t-km) is a synthetic weighted benchmark rather than an unblended DEFRA table row.
2. **Heuristic Circuity Multipliers:** Modal detour multipliers are standard operational planning approximations, not dynamic marine/flight telematics waypoints.
3. **Illustrative Benchmark Rates:** Transportation costs represent grounded commercial planning benchmarks rather than live carrier spot market quotes.
4. **F1 Cargo Volume Baseline:** The 1,200 metric tonnes baseline reflects published DHL operational estimates for global event freight; individual race volumes vary.
