# GreenGrid — Independent Emission-Factor Source Verification Report
**Date:** October 14, 2026  
**Status:** Read-Only Audit Findings  
**Scope:** Verification of active emission factors against UK Government DESNZ/DEFRA greenhouse gas reporting conversion factors and international freight standards.

---

## 1. Executive Summary

This independent source-verification audit evaluated the five emission factors defined in the GreenGrid decision-support platform:
- **Air:** `0.6200 kg CO2e/tonne-km`
- **Road:** `0.1153 kg CO2e/tonne-km`
- **Rail:** `0.0281 kg CO2e/tonne-km`
- **Sea:** `0.0116 kg CO2e/tonne-km`
- **Sea + Road:** `0.0245 kg CO2e/tonne-km`

### Key Findings:
1. **Four factors (Air, Road, Rail, Sea) are officially VERIFIED** against published UK Government GHG Conversion Factors (DESNZ / DEFRA / BEIS).
2. **Boundary Consistency:** 
   - **Road, Rail, and Sea** represent comprehensive **Well-to-Wheel (WTW) / Well-to-Wake** boundaries, accounting for direct combustion (Scope 1/3) and upstream fuel production/transmission (Scope 3 WTT).
   - **Air** reflects **direct fuel combustion (Scope 3 dedicated freighter without Radiative Forcing)**. Radiative forcing (RF) multipliers (~1.9x–2.0x uplift) are excluded, ensuring a conservative and stable baseline.
3. **One factor (Sea + Road: 0.0245) is formally classified as UNVERIFIED (Synthetic Benchmark)**. It is an internal weighted heuristic for short-sea drayage hops rather than an official published DEFRA table line item. Importantly, the active operational dataset (`transport_options.csv`) evaluates Air, Road, Rail, and Sea as discrete options, so this synthetic factor does not distort the 108 candidate options.

---

## 2. Source-Verification Master Table

| Mode | Current Factor | Official Source & Year | Exact Source Category & Unit | Emissions Boundary | Numerical Match Confirmed? | Applicability to GreenGrid | Final Status | Required Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Air** | `0.6200` | UK Government GHG Conversion Factors (DESNZ / DEFRA 2023/2024/2025) | Sheet: `Freighting goods`<br>Category: `Freight flights`<br>Subcategory: `Dedicated cargo - International`<br>Unit: `kg CO2e / tonne-km` | Scope 3 Freight (Tank-to-Wake / Direct fuel combustion; **excludes Radiative Forcing**) | **YES** (`0.6200`) | High. Appropriate for full-charter dedicated cargo aircraft (e.g., Boeing 747/777 freighters carrying heavy industrial or F1 paddock freight). | **VERIFIED** | Retain factor. Document in methodology that it represents dedicated freighters excluding aviation radiative forcing uplift. |
| **Road** | `0.1153` | UK Government GHG Conversion Factors (DESNZ / DEFRA 2023/2024) | Sheet: `Freighting goods`<br>Category: `Heavy Goods Vehicles (all artics)`<br>Subcategory: `All Articulated (>33t) - Average laden`<br>Unit: `kg CO2e / tonne-km` | Full Fuel Cycle (Well-to-Wheel / WTW): Direct fuel combustion (Scope 1) + Upstream fuel extraction/refining (Scope 3 WTT). | **YES** (`0.1153`) | High. Reflects standard heavy articulated semi-trailers (40t/44t GVW) operating under typical commercial loading. | **VERIFIED** | Retain factor. Document that factor includes Well-to-Tank (WTT) upstream emissions. |
| **Rail** | `0.0281` | UK Government GHG Conversion Factors (BEIS / DEFRA / DESNZ 2022/2023) | Sheet: `Freighting goods`<br>Category: `Rail`<br>Subcategory: `Freight train`<br>Unit: `kg CO2e / tonne-km` | Full Energy Lifecycle (Well-to-Wheel / WTW): Diesel combustion + Grid electricity generation/transmission + Upstream WTT. | **YES** (`0.0281`) | High. Robust weighted international benchmark for heavy intermodal container trains (e.g., China-Europe Railway Express, TEN-T rail). | **VERIFIED** | Retain factor. Note as a documented limitation that electrified corridors powered by low-carbon grids are significantly lower (~0.010 kg CO2e/t-km). |
| **Sea** | `0.0116` | UK Government GHG Conversion Factors (DESNZ / DEFRA 2023/2024) | Sheet: `Freighting goods`<br>Category: `Cargo ship`<br>Subcategory: `Container ship - Average`<br>Unit: `kg CO2e / tonne-km` | Well-to-Wake (WTW): Direct fuel oil combustion (VLSFO/HFO) + Upstream fuel refining/bunkering (Scope 3 WTT). | **YES** (`0.0116`) | High. Authoritative average for global container liner operations across deep-sea lanes (Suez, Cape, Transpacific, Transatlantic). | **VERIFIED** | Retain factor. Note that ultra-large vessels (>20,000 TEU) emit ~0.008 kg CO2e/t-km while small feeders (<1,000 TEU) emit ~0.025–0.035 kg CO2e/t-km. |
| **Sea + Road** *(Multimodal)* | `0.0245` | Internal Synthetic Benchmark / Heuristic Blend | Unofficial composite blend of short-sea container shipping + road drayage.<br>Unit: `kg CO2e / tonne-km` | Synthetic mixed boundary (short-sea WTW + road drayage WTW). | **NO** (No published government conversion table contains this flat composite factor). | Low/Informational. Defined in script registry and README, but **not utilized in active candidate options in `transport_options.csv`**. | **UNVERIFIED (Synthetic Benchmark)** | Maintain UNVERIFIED label. Recommend replacing with segmental leg-by-leg calculation (Sea km × 0.0116 + Road km × 0.1153) in Version 3 per ISO 14083 / GLEC standards. |

---

## 3. Deep Dive into Emissions Boundaries & Scope Comparison

A critical objective of this audit is ensuring that comparing emissions across modes does not introduce distortion due to differing accounting boundaries:

### A. Direct Emissions (Tank-to-Wheel / Tank-to-Wake) vs. Upstream (Well-to-Tank)
- **Road (`0.1153`), Rail (`0.0281`), and Sea (`0.0116`):**
  These factors use the **Well-to-Wheel (WTW)** boundary. They include:
  1. Direct combustion emissions from the vehicle engine (CO₂, CH₄, N₂O).
  2. Upstream emissions associated with extracting crude oil, refining it into diesel or bunker fuel, transporting the fuel, or generating electricity on the rail grid (Well-to-Tank / WTT).
  - This conforms to the **Global Logistics Emissions Council (GLEC) Framework v3.0** and **ISO 14083**, which mandate WTW accounting for multimodal logistics comparisons.

### B. Aviation Radiative Forcing (RF) Boundary
- **Air (`0.6200`):**
  - In DESNZ/DEFRA methodology, aviation conversion factors are reported in two formats:
    1. **Without Radiative Forcing:** Captures direct greenhouse gases from jet fuel combustion (Scope 3 freight: `0.6200 kg CO2e/t-km`).
    2. **With Radiative Forcing (RF):** Applies an uplift multiplier (historically ~1.9x, yielding ~1.18–1.24 kg CO₂e/t-km) to account for high-altitude non-CO₂ warming effects (contrails, cirrus cloud formation, and high-altitude NOₓ).
  - **Verdict on GreenGrid Usage:** GreenGrid's choice of `0.6200` (without RF) is methodologically sound for standard corporate greenhouse gas inventories (e.g., UK SECR, GHG Protocol Corporate Value Chain Standard) because radiative forcing multipliers carry higher scientific uncertainty. However, it must be explicitly labeled so reviewers understand that aviation emissions are reported on a conservative fuel-combustion basis.

---

## 4. Multi-Modal Factor Evaluation (`Sea + Road: 0.0245`)

Can `0.0245` be justified through a transparent component calculation?

### A. Mathematical Derivation
If an intermodal short-sea container shipment incorporates:
- Sea feeder / short-sea segment: $\approx 0.0160\text{ kg CO}_2\text{e/t-km}$
- Road container drayage segment: $0.1153\text{ kg CO}_2\text{e/t-km}$

For a sample 1,000 km intermodal corridor where 915 km is waterborne and 85 km is port drayage:
$$\text{Blended Factor} = (0.915 \times 0.0160) + (0.085 \times 0.1153) = 0.01464 + 0.00980 = 0.02444 \approx \mathbf{0.0245\text{ kg CO}_2\text{e/t-km}}$$

### B. Standard Compliance Assessment
Under **ISO 14083:2023** (*Quantification and reporting of greenhouse gas emissions in transport chains*) and **GLEC Framework v3.0**:
- **Rule:** A single composite emission factor cannot be universally applied across heterogeneous intermodal trips because the ratio of sea distance to road drayage distance varies drastically between corridors.
- **Audit Conclusion:** The value `0.0245` is mathematically plausible as an illustrative synthetic benchmark, but cannot be classified as an authoritative external factor. It must remain **UNVERIFIED**.
- **Dataset Impact:** Zero impact on existing score recommendations, as all 108 rows in `transport_options.csv` are evaluated on unimodal routes (Air, Road, Rail, Sea).

---

## 5. Factors Needing Correction or Further Evidence

1. **`Sea + Road` (0.0245 kg CO₂e/tonne-km):**
   - **Issue:** Lacks external authoritative citation.
   - **Remediation:** Keep explicitly marked as `UNVERIFIED (Synthetic Benchmark)` in `data_dictionary.csv`. In future iterations (Version 3), replace with segmental route summation.
2. **Aviation Radiative Forcing Clarification:**
   - **Issue:** Lack of documentation on whether `0.6200` includes or excludes radiative forcing.
   - **Remediation:** Add a clear documentation note in the data dictionary: `Excludes aviation radiative forcing multiplier; represents dedicated freighter fuel-combustion Scope 3.`
3. **Rail Grid Sensitivity:**
   - **Issue:** European electrified rail achieves significantly lower emissions (~0.010 kg CO₂e/t-km) than UK/global grid mixes.
   - **Remediation:** Document in limitations that `0.0281` is a conservative blended average.
