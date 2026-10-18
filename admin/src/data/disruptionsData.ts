import type { Disruption } from "../types";

export const DIS_DATASET: Disruption[] = [
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
  },
  {
    "disruption_id": "DIS-02",
    "title": "North Atlantic Airspace Severe Jetstream & ATC Strike",
    "type": "Weather & Labor Industrial Action",
    "affected_mode": "Air",
    "geographic_corridor": "Transatlantic North America - Europe Corridor",
    "delay_impact_days": 2.5,
    "cost_surcharge_usd": 220000.0,
    "emissions_increase_pct": 12.0,
    "description": "Air traffic control strikes and adverse jetstream cause severe holding delays. Directly impacts Transatlantic air lanes.",
    "status": "Simulated Active Scenario",
    "mitigation_mode": "Priority express sea dispatch or rerouted polar air lanes",
    "dataset_version": "2.1.1"
  },
  {
    "disruption_id": "DIS-03",
    "title": "Eurotunnel & Dover Channel Port Industrial Action",
    "type": "Port / Customs Border Bottleneck",
    "affected_mode": "Road",
    "geographic_corridor": "UK - Continental Europe Cross-Channel Route",
    "delay_impact_days": 2.0,
    "cost_surcharge_usd": 48000.0,
    "emissions_increase_pct": 15.0,
    "description": "Queuing at Dover and Folkestone terminals forces diversion to North Sea ferry ports. Directly impacts UK to Continental Europe road freight.",
    "status": "Simulated Active Scenario",
    "mitigation_mode": "Dedicated Air Charter or North Sea Ro-Ro detour",
    "dataset_version": "2.1.1"
  },
  {
    "disruption_id": "DIS-04",
    "title": "Panama Canal Freshwater Draft Restrictions",
    "type": "Climate / Waterway Bottleneck",
    "affected_mode": "Sea",
    "geographic_corridor": "Transpacific - US East Coast / Caribbean Maritime Lane",
    "delay_impact_days": 8.0,
    "cost_surcharge_usd": 95000.0,
    "emissions_increase_pct": 18.0,
    "description": "Severe drought limits daily vessel transits; waiting anchorage exceeds one week or requires Cape Horn voyage. Directly impacts East Asia to US East Coast/Florida sea lanes.",
    "status": "Simulated Active Scenario",
    "mitigation_mode": "West Coast Port discharge + Transcontinental Rail Land-Bridge or Air Charter",
    "dataset_version": "2.1.1"
  },
  {
    "disruption_id": "DIS-05",
    "title": "Typhoon Malakas East China Sea Port Operations Halt",
    "type": "Severe Weather / Cyclone",
    "affected_mode": "Sea",
    "geographic_corridor": "East Asia Coastal Lane (Suzuka / Shanghai)",
    "delay_impact_days": 4.5,
    "cost_surcharge_usd": 60000.0,
    "emissions_increase_pct": 8.0,
    "description": "Gale-force typhoon conditions shut down container crane operations at Shanghai Yangshan port for 4 days. Directly impacts East Asia coastal shipping.",
    "status": "Simulated Active Scenario",
    "mitigation_mode": "Short-haul regional Air Charter",
    "dataset_version": "2.1.1"
  }
];
