export interface ScenarioTest {
  test_case_id: string;
  domain: string;
  scenario_name: string;
  shipment_id: string;
  origin: string;
  destination: string;
  disruption_id: string;
  tested_mode: string;
  baseline_mode: string;
  baseline_transit_days: number;
  baseline_cost_usd: number;
  baseline_emissions_tco2e: number;
  baseline_deadline_met: boolean;
  disrupted_mode: string;
  disrupted_transit_days: number;
  disrupted_cost_usd: number;
  disrupted_emissions_tco2e: number;
  disrupted_deadline_met: boolean;
  recommended_action: string;
  explanation: string;
}

export const SCENARIO_TESTS: ScenarioTest[] = [
  {
    "test_case_id": "TC-01",
    "domain": "F1_Demonstration",
    "scenario_name": "Suez Closure on Middle East to Australia (Leg 02)",
    "shipment_id": "SHP-02",
    "origin": "Jeddah",
    "destination": "Melbourne",
    "disruption_id": "DIS-01",
    "tested_mode": "Sea",
    "baseline_mode": "Sea",
    "baseline_transit_days": 31.5,
    "baseline_cost_usd": 470664.0,
    "baseline_emissions_tco2e": 294.4,
    "baseline_deadline_met": false,
    "disrupted_mode": "Sea (Disrupted)",
    "disrupted_transit_days": 45.0,
    "disrupted_cost_usd": 615664.0,
    "disrupted_emissions_tco2e": 388.6,
    "disrupted_deadline_met": false,
    "recommended_action": "Mandatory Air freight charter required; Sea is deadline-infeasible.",
    "explanation": "Under baseline conditions, Sea transit takes 31.5 days and already misses the critical 10.0-day race deadline. Disruption via DIS-01 adds +13.5 days (pushing Sea to 45.0 days and +$145k cost). Air freight (2.2 days) is confirmed as the sole viable mode capable of meeting the April 1 delivery deadline."
  },
  {
    "test_case_id": "TC-02",
    "domain": "F1_Demonstration",
    "scenario_name": "Dover Port Strike on UK to Austria (Leg 10)",
    "shipment_id": "SHP-10",
    "origin": "Silverstone",
    "destination": "Spielberg",
    "disruption_id": "DIS-03",
    "tested_mode": "Road",
    "baseline_mode": "Road",
    "baseline_transit_days": 2.2,
    "baseline_cost_usd": 294720.0,
    "baseline_emissions_tco2e": 225.5,
    "baseline_deadline_met": true,
    "disrupted_mode": "Road (Disrupted)",
    "disrupted_transit_days": 4.2,
    "disrupted_cost_usd": 342720.0,
    "disrupted_emissions_tco2e": 259.3,
    "disrupted_deadline_met": false,
    "recommended_action": "Trigger modal shift: Road breached deadline due to Eurotunnel & Dover Channel Port Industrial Action.",
    "explanation": "Road is the baseline recommended green winner (2.2 days, $294,720, 225.5 tCO2e, meeting the 3.0-day window). DIS-03 adds a 2.0-day cross-channel bottleneck, pushing Road to 4.2 days and breaching the delivery deadline. GreenGrid detects deadline breach and triggers emergency modal shift to Air charter (1.6 days), preserving the race event."
  },
  {
    "test_case_id": "TC-03",
    "domain": "F1_Demonstration",
    "scenario_name": "Transatlantic Storm & ATC Grounding on Canada to Monaco (Leg 07)",
    "shipment_id": "SHP-07",
    "origin": "Montr\u00e9al",
    "destination": "Monaco",
    "disruption_id": "DIS-02",
    "tested_mode": "Air",
    "baseline_mode": "Air",
    "baseline_transit_days": 1.8,
    "baseline_cost_usd": 1937568.0,
    "baseline_emissions_tco2e": 4919.3,
    "baseline_deadline_met": true,
    "disrupted_mode": "Air (Disrupted)",
    "disrupted_transit_days": 4.3,
    "disrupted_cost_usd": 2157568.0,
    "disrupted_emissions_tco2e": 5509.6,
    "disrupted_deadline_met": true,
    "recommended_action": "Retain Air with schedule adjustment; deadline margin remains positive (5.7d).",
    "explanation": "Baseline recommended Air takes 1.8 days ($1.94M, 4,919.3 tCO2e) within a 10.0-day window. DIS-02 adds +2.5 days delay and a $220k fuel holding surcharge. Because disrupted transit (4.3 days) comfortably satisfies the 10.0-day deadline, GreenGrid recommends retaining Air with an updated arrival schedule, preventing unnecessary and costly panic rerouting."
  },
  {
    "test_case_id": "TC-04",
    "domain": "F1_Demonstration",
    "scenario_name": "Typhoon Impact on Japan to China (Leg 04)",
    "shipment_id": "SHP-04",
    "origin": "Suzuka",
    "destination": "Shanghai",
    "disruption_id": "DIS-05",
    "tested_mode": "Sea",
    "baseline_mode": "Sea",
    "baseline_transit_days": 8.0,
    "baseline_cost_usd": 133866.0,
    "baseline_emissions_tco2e": 33.9,
    "baseline_deadline_met": false,
    "disrupted_mode": "Sea (Disrupted)",
    "disrupted_transit_days": 12.5,
    "disrupted_cost_usd": 193866.0,
    "disrupted_emissions_tco2e": 36.6,
    "disrupted_deadline_met": false,
    "recommended_action": "Mandatory Air freight charter required; Sea is deadline-infeasible.",
    "explanation": "Baseline Sea takes 8.0 days, failing the 6.0-day inter-race window. DIS-05 adds +4.5 days port crane shutdown (+8% emissions). Baseline and disrupted conditions confirm that Air charter (1.6 days) is strictly necessary to meet the Shanghai deadline."
  },
  {
    "test_case_id": "TC-05",
    "domain": "Commercial_General",
    "scenario_name": "Red Sea Closure on Electronics Export (COMM-01: Shenzhen -> Rotterdam)",
    "shipment_id": "COMM-01",
    "origin": "Shenzhen",
    "destination": "Rotterdam",
    "disruption_id": "DIS-01",
    "tested_mode": "Sea",
    "baseline_mode": "Sea",
    "baseline_transit_days": 24.8,
    "baseline_cost_usd": 14045.0,
    "baseline_emissions_tco2e": 8.3,
    "baseline_deadline_met": true,
    "disrupted_mode": "Sea (Disrupted)",
    "disrupted_transit_days": 38.3,
    "disrupted_cost_usd": 159045.0,
    "disrupted_emissions_tco2e": 11.0,
    "disrupted_deadline_met": false,
    "recommended_action": "Trigger modal shift: Sea breached deadline due to Red Sea & Bab-el-Mandeb Maritime Security Closure.",
    "explanation": "In baseline evaluation, China-Europe Railway Express (18.1 days, $25.3k, 14.7 tCO2e) is already the optimal balanced choice (Score: 77.1 vs Sea: 75.0) due to its 6.7-day time advantage over Sea with minimal emissions impact. When Red Sea closure occurs, Sea's transit expands from 24.8 to 38.3 days, completely breaching the 28.0-day contract deadline. GreenGrid cements Rail as the resilient green choice, avoiding a forced shift to Air ($106.6k, 280.2 tCO2e)."
  },
  {
    "test_case_id": "TC-06",
    "domain": "Commercial_General",
    "scenario_name": "JIT Automotive Tight Deadline (COMM-02: Stuttgart -> Barcelona)",
    "shipment_id": "COMM-02",
    "origin": "Stuttgart",
    "destination": "Barcelona",
    "disruption_id": "NONE",
    "tested_mode": "Road",
    "baseline_mode": "Road",
    "baseline_transit_days": 1.8,
    "baseline_cost_usd": 4360.0,
    "baseline_emissions_tco2e": 3.1,
    "baseline_deadline_met": true,
    "disrupted_mode": "Road",
    "disrupted_transit_days": 1.8,
    "disrupted_cost_usd": 4360.0,
    "disrupted_emissions_tco2e": 3.1,
    "disrupted_deadline_met": true,
    "recommended_action": "Maintain baseline recommendation (Road).",
    "explanation": "With an available window of 3.0 days, Rail takes 3.8 days (failing the production line SLA). Road takes 1.8 days, costs only $4.4k, and meets the deadline, outperforming Air which costs $8.7k. Demonstrates deadline-first filtering ruling out the lowest-emissions mode when SLAs are violated."
  },
  {
    "test_case_id": "TC-07",
    "domain": "Commercial_General",
    "scenario_name": "Urgent Medical Cold-Chain Vaccine Transit (COMM-03: Chicago -> Frankfurt)",
    "shipment_id": "COMM-03",
    "origin": "Chicago",
    "destination": "Frankfurt",
    "disruption_id": "NONE",
    "tested_mode": "Air",
    "baseline_mode": "Air",
    "baseline_transit_days": 1.9,
    "baseline_cost_usd": 14517.0,
    "baseline_emissions_tco2e": 37.3,
    "baseline_deadline_met": true,
    "disrupted_mode": "Air",
    "disrupted_transit_days": 1.9,
    "disrupted_cost_usd": 14517.0,
    "disrupted_emissions_tco2e": 37.3,
    "disrupted_deadline_met": true,
    "recommended_action": "Maintain baseline recommendation (Air).",
    "explanation": "Ocean transport takes 17.6 days across the Atlantic, completely violating the 4.0-day temperature-sensitive viability window. Air is the sole feasible mode capable of meeting the delivery deadline."
  },
  {
    "test_case_id": "TC-08",
    "domain": "F1_Demonstration",
    "scenario_name": "Panama Canal Drought Restrictions on Transpacific Ocean Lane (Leg 05: Shanghai -> Miami)",
    "shipment_id": "SHP-05",
    "origin": "Shanghai",
    "destination": "Miami",
    "disruption_id": "DIS-04",
    "tested_mode": "Sea",
    "baseline_mode": "Sea",
    "baseline_transit_days": 30.7,
    "baseline_cost_usd": 459612.0,
    "baseline_emissions_tco2e": 285.8,
    "baseline_deadline_met": false,
    "disrupted_mode": "Sea (Disrupted)",
    "disrupted_transit_days": 38.7,
    "disrupted_cost_usd": 554612.0,
    "disrupted_emissions_tco2e": 337.2,
    "disrupted_deadline_met": false,
    "recommended_action": "Mandatory Air freight charter required; Sea is deadline-infeasible.",
    "explanation": "East Asia to Florida container ships transit the Panama Canal. Baseline Sea takes 30.7 days, already exceeding the 10.0-day race window. DIS-04 adds +8.0 days transit delay, $95,000 reservation surcharge, and +18.0% emissions due to canal draft queuing. Validates that DIS-04 severely degrades ocean supply, reinforcing mandatory Air freight (2.2 days)."
  }
];
