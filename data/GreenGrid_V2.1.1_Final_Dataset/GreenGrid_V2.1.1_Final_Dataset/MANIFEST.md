# GreenGrid Version 2.1.1 — Package Manifest
**Archive Name:** `GreenGrid_V2.1.1_Final_Dataset.zip`  
**Generated:** October 14, 2026  
**Scope:** Complete Frozen Version 2.1.1 Dataset, Validation Script, and Independent Audit Reports  

---

## File Inventory & Verification

| # | File Name | Directory Path | Type | Records / Entries | Description |
|---|---|---|---|---|---|
| 1 | `shipments.csv` | `data/shipments.csv` | CSV | 27 records (27 columns) | 23 F1 demonstration legs + 4 commercial stress benchmarks |
| 2 | `transport_options.csv` | `data/transport_options.csv` | CSV | 108 records (21 columns) | 4 candidate modes (Air, Road, Rail, Sea) per shipment |
| 3 | `disruptions.csv` | `data/disruptions.csv` | CSV | 5 records (11 columns) | Global simulated disruptions (DIS-01 through DIS-05) |
| 4 | `scenario_tests.csv` | `data/scenario_tests.csv` | CSV | 8 records (20 columns) | Baseline vs disrupted stress tests (TC-01 through TC-08) |
| 5 | `data_dictionary.csv` | `data/data_dictionary.csv` | CSV | 79 records (7 columns) | Complete schema definitions for all 79 columns |
| 6 | `README.md` | `README.md` | Markdown | Documentation | Overview, formulas, parameters, and instructions |
| 7 | `generate_and_validate_dataset.py` | `scripts/generate_and_validate_dataset.py` | Python | 1,039 lines | Standalone calculation & 11-step validation engine |
| 8 | `EMISSIONS_SOURCE_VERIFICATION_REPORT.md` | `reports/EMISSIONS_SOURCE_VERIFICATION_REPORT.md` | Markdown | Audit Report | Authoritative UK DESNZ/DEFRA emission factor source audit |
| 9 | `FINAL_DATASET_AUDIT_REPORT.md` | `reports/FINAL_DATASET_AUDIT_REPORT.md` | Markdown | Audit Report | 100% verified mathematical & relational readiness audit |
| 10 | `MANIFEST.md` | `MANIFEST.md` | Markdown | Manifest | This file manifest and integrity index |

---

## CSV Record Count Cross-Check

- `shipments.csv`: **27 data rows** + 1 header = 28 lines
- `transport_options.csv`: **108 data rows** + 1 header = 109 lines
- `disruptions.csv`: **5 data rows** + 1 header = 6 lines
- `scenario_tests.csv`: **8 data rows** + 1 header = 9 lines
- `data_dictionary.csv`: **79 data rows** + 1 header = 80 lines

---

## Validation Execution Command
```bash
python3 scripts/generate_and_validate_dataset.py
```
*Result: ALL VALIDATION & TARGETED AUDIT INTEGRITY CHECKS PASSED (0 Errors).*
