# GreenGridAI — Contributing and Team Collaboration Guide

## Team Workstreams and Responsibilities
- **Kruthin (Data Service & Integration Lead):** Shipment schemas, synthetic F1 dataset, data validation, system integration, CI/CD, and LinuxONE deployment.
- **Revanth (Decision Engine):** Feasibility engine, multi-modal routing (air, sea, road, rail), cost/time/emissions calculations, scoring algorithms.
- **Punith (AI & Analytics):** Logistics disruption scenarios, route impact analytics, machine learning/heuristic interfaces.
- **Bharath (User Dashboard):** React + TypeScript UI, interactive logistics map, shipment views, route comparison charts, SLA indicators.
- **JP (Administration & Monitoring):** System health metrics, LinuxONE node telemetry, data mode toggle (Synthetic vs Official v2.1.1), disruption simulator controls.

## Branching & Commit Guidelines
1. **Branch Naming:**
   - Data Service: `feature/data-service-<name>`
   - Decision Engine: `feature/decision-engine-<name>`
   - AI & Analytics: `feature/ai-analytics-<name>`
   - Dashboard: `feature/dashboard-<name>`
   - Admin & Monitoring: `feature/admin-monitoring-<name>`
2. **Never commit secrets or credentials:** Never commit `.env` or SSH keys. Use `.env.example` as a template.
3. **API Contract Stability:** Any changes to `backend/app/schemas/` must be agreed upon and tested against both backend unit tests and frontend API clients.

## Standard Units
- Transit Time: Hours (`hours`)
- Cost: USD (`$`)
- Emissions: Kilograms CO₂-equivalent (`kg CO2e`)
- Cargo Weight: Metric Tons (`tons`)
- Dataset Mode: `"synthetic_demo"` until official v2.1.1 is provided.
