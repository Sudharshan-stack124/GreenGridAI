# GreenGridAI
🌱 GreenGridAI — Intelligent & Sustainable Logistics Optimization

Smarter routes. Lower emissions. Better logistics decisions.

GreenGridAI is an intelligent logistics optimization project developed for the IBM Z Datathon 2026. It aims to help logistics teams make more sustainable and cost-effective shipping decisions by comparing available transportation options against delivery deadlines, shipping costs, and carbon emissions.

Instead of selecting routes based only on speed or price, GreenGridAI evaluates multiple transportation modes and recommends a feasible option based on a configurable decision model.

📌 Problem Statement

Global logistics depends on multiple transportation modes, including air, sea, rail, and road freight. Choosing the right mode is challenging because every option involves trade-offs between:

Cost: How much will the shipment cost?

Carbon emissions: How much CO₂-equivalent will transportation generate?

Delivery time: Can the shipment arrive before its deadline?

Feasibility: Is the transportation option suitable for the shipment?

Disruptions and route restrictions can further complicate logistics planning.

GreenGridAI aims to simplify these decisions through a unified optimization workflow that evaluates shipping alternatives and prioritizes sustainability without ignoring operational requirements.

💡 Proposed Solution

GreenGridAI provides a logistics decision-support platform that:

Accepts shipment information, including origin, destination, cargo weight, and delivery deadline.

Retrieves available shipment and transportation data.

Evaluates alternative transportation options.

Filters out options that are infeasible or fail the delivery deadline.

Scores eligible options using configurable weights for emissions, cost, and delivery time.

Recommends a suitable transportation option and presents its estimated metrics.

Provides an analytics dashboard for reviewing shipment recommendations and aggregate results.

The system is designed to support commercial freight scenarios, with motorsport logistics such as Formula 1 serving as a potential demonstration use case.

✨ Key Features

Multi-modal comparison: Evaluate air, sea, rail, and road freight options where available.

Sustainability-aware decisions: Incorporate estimated CO₂e emissions into transportation scoring.

Cost and time optimization: Balance shipping costs, emissions, and delivery speed.

Deadline-aware recommendations: Exclude options that cannot meet the required delivery deadline.

Feasibility checks: Avoid recommending options that fail the configured constraints.

Shipment-level insights: Review individual shipments and their available alternatives.

Analytics dashboard: Explore recommendation distributions and aggregate shipment metrics.

Configurable decision weights: Adjust the relative importance of emissions, cost, and time.

Extensible architecture: Separate services support modular development and integration.

🧠 Decision Model

GreenGridAI uses a weighted decision model to balance sustainability and operational performance.

The current configured weights are:

Evaluation criterion

Weight

Carbon emissions

40%

Transportation cost

35%

Delivery time

25%

Eligible transportation alternatives are evaluated against these criteria, with lower emissions, lower costs, and shorter delivery times generally preferred.

The model applies feasibility and deadline constraints before making a recommendation. If no option satisfies the required constraints, the system should not present an infeasible option as a valid recommendation.

The weights are configurable and can be adjusted for different logistics priorities.

Note: The current implementation uses benchmark-based or synthetic data for demonstration. These weights represent the project's current configuration, not a universally optimal logistics policy.

🏗️ System Architecture

GreenGridAI follows a modular architecture with a React frontend and separate backend services.

                 ┌─────────────────────────┐
                 │     React Frontend      │
                 │ Shipment Portal / Admin │
                 └────────────┬────────────┘
                              │
                 ┌────────────▼────────────┐
                 │    Vite Dev Server      │
                 │   API Proxy / Routing   │
                 └────────────┬────────────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
     ┌───────▼────────┐ ┌─────▼─────────┐ ┌────▼───────────┐
     │  Data Service  │ │ Decision Engine│ │ Analytics API  │
     │    Port 8001   │ │   Port 8002   │ │   Port 8003    │
     └───────┬────────┘ └─────┬─────────┘ └────┬───────────┘
             │                │                │
             └────────────────┼────────────────┘
                              │
                 ┌────────────▼────────────┐
                 │ Shipment Data, Scoring, │
                 │ Recommendations &       │
                 │ Analytics Results       │
                 └─────────────────────────┘

The diagram represents the intended integration flow. Individual services may use adapters or precomputed results depending on the endpoint.

Core Components

1. React Frontend

Provides the user-facing interface for shipment information and logistics insights.

Uses Vite for local development.

Uses Lucide icons and Recharts for interface elements and data visualizations.

2. Data Service — Port 8001

Exposes shipment information and available transportation alternatives.

Provides shipment details and disruption-related data through API endpoints.

3. Decision Engine — Port 8002

Evaluates transportation alternatives.

Applies configured decision weights and feasibility constraints.

Produces shipment-level recommendations and evaluation results.

4. Analytics API — Port 8003

Exposes aggregate analytics and shipment-level reporting endpoints.

Serves verified, precomputed analytics results for the current integration workflow.

🛠️ Technology Stack

Technology

Purpose

React

Frontend user interface

Vite

Frontend development server and build tooling

JavaScript

Frontend application logic

CSS

Interface styling

Lucide React

Icons

Recharts

Data visualization

Python

Backend service implementation

FastAPI

HTTP APIs for backend services

JSON

Data exchange and analytics results

Git and GitHub

Version control and collaboration

Infrastructure: IBM Z / LinuxONE is the intended platform context for the datathon. The final deployment environment and production integration should be documented once confirmed.

📂 Project Structure

The repository is organized around the frontend, backend services, data, and integration components.

GreenGridAI/
├── data/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── styles.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── Integration/
├── services/
└── README.md

The exact locations of service implementations and supporting datasets may vary as integration progresses.

🚀 Getting Started

Prerequisites

Install the following tools:

Node.js and npm

Python

Git

1. Clone the repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd GreenGridAI

Replace the placeholder with your actual GitHub repository URL.

2. Start the frontend

Open a terminal in the frontend directory:

cd frontend
npm install
npm run dev

Open the local URL displayed by Vite, usually:

http://localhost:5173/

3. Start the backend services

The backend services must be started separately using their respective project directories and dependency instructions.

The current integration uses these local service ports:

Service

Port

Data Service

8001

Decision Engine

8002

Analytics API

8003

Run each service using its actual application entry point and configured dependencies. Confirm that its health endpoint responds before testing frontend integration.

For the current integration, the available endpoints include:

Data Service

GET /health

GET /shipments

GET /shipments/{shipment_id}

GET /shipments/{shipment_id}/options?feasible_only=true

GET /disruptions

Decision Engine

GET /health

GET /api/v1/weights

GET /api/v1/scenarios

GET /api/v1/scenarios/{scenario_id}/evaluate

POST /api/v1/evaluate

Analytics API

GET /health

GET /analytics/summary

GET /analytics/shipments

GET /analytics/shipments/{shipment_id}

Check the service implementation for request schemas, response formats, and any additional setup requirements.

📊 Data and Assumptions

GreenGridAI uses shipment records, transportation alternatives, estimated costs, transit times, and emissions factors to demonstrate logistics optimization.

The current prototype uses benchmark-based and/or synthetic data where real operational data is unavailable.

Important considerations:

Cost estimates are illustrative and are not live carrier quotations.

Emissions estimates depend on the selected transportation mode, distance, cargo weight, and configured emissions factors.

Delivery times are estimates and may not reflect actual carrier schedules.

Route availability and disruption information may be limited by the current dataset and integration.

Some capacity, volume, or route-related fields may use simplified assumptions.

Results should be interpreted as decision-support outputs rather than guaranteed operational outcomes.

The project can be extended with validated carrier data, real-time disruption feeds, verified emissions factors, and additional operational constraints.

🌍 Sustainability Impact

GreenGridAI is designed to help logistics teams explore transportation alternatives that balance operational feasibility with environmental impact.

Potential benefits include:

Identifying lower-emission alternatives when feasible.

Making cost, time, and emissions trade-offs more transparent.

Supporting data-driven logistics planning.

Comparing transportation strategies across multiple shipments.

Helping organizations evaluate sustainability-oriented shipping decisions.

The actual environmental benefit depends on the available alternatives, the accuracy of the input data, and the performance of the selected transportation options. Emissions savings should be measured against a clearly defined baseline before being reported as achieved results.

🔮 Future Enhancements

Potential future development includes:

Real-time transport disruption monitoring.

Alternative-route evaluation when a route becomes unavailable.

Integration with verified carrier pricing and schedules.

More accurate emissions calculations based on shipment and vehicle characteristics.

Historical shipment analysis and trend reporting.

Scenario simulation for different logistics priorities.

Enhanced user and administrator workflows.

Deployment and performance evaluation on the confirmed IBM Z / LinuxONE environment.

👥 Team and Acknowledgements

Developed collaboratively for the IBM Z Datathon 2026.

The project brings together frontend development, backend services, data analysis, and logistics decision modeling to explore the role of AI-assisted decision support in sustainable transportation.

📄 Disclaimer

GreenGridAI is a prototype developed for educational and demonstration purposes. Recommendations depend on the data, assumptions, constraints, and decision weights configured in the system. The project does not guarantee real-world delivery performance, carrier availability, financial savings, or emissions reductions.

GreenGridAI — Making logistics decisions more transparent, efficient, and sustainability-aware.
