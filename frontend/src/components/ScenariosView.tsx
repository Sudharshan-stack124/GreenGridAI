import React from "react";
import { SCENARIO_TESTS } from "../data/scenariosData";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { ZapIcon, ArrowRightIcon } from "./ui/Icons";
import { formatCost, formatEmissions, formatTransitTime } from "./ui/formatters";

interface ScenariosViewProps {
  onLoadScenario: (shipmentId: string, disruptionId: string | null) => void;
}

export const ScenariosView: React.FC<ScenariosViewProps> = ({ onLoadScenario }) => {
  return (
    <div className="gg-scenarios-view">
      <Card
        title="Official Scenario Stress-Test Suite"
        subtitle="8 verified benchmark test cases validating multimodal rerouting, deadline SLAs, and carbon optimization"
        icon={<ZapIcon size={16} />}
        right={<Badge variant="white">8 Benchmark Cases</Badge>}
      >
        <p className="gg-scenarios-intro">
          These test cases are defined in <code>scenario_tests.csv</code>. Select any test case to load its corridor and active disruption scenario directly into the decision engine.
        </p>

        <div className="gg-scenario-grid">
          {SCENARIO_TESTS.map((tc) => {
            const hasDisruption = tc.disruption_id !== "NONE";
            return (
              <div key={tc.test_case_id} className="gg-scenario-card">
                <div className="gg-scenario-card-header">
                  <div className="gg-scenario-tag-group">
                    <strong className="gg-scenario-id">{tc.test_case_id}</strong>
                    <Badge variant="titanium">
                      {tc.domain === "F1_Demonstration" ? "Formula 1" : "Commercial"}
                    </Badge>
                  </div>
                  <Badge variant={hasDisruption ? "white" : "subtle"}>
                    {hasDisruption ? tc.disruption_id : "Baseline"}
                  </Badge>
                </div>

                <h4 className="gg-scenario-name">{tc.scenario_name}</h4>
                <div className="gg-scenario-corridor">
                  <strong>{tc.origin}</strong> → <strong>{tc.destination}</strong> ({tc.shipment_id})
                </div>

                <div className="gg-scenario-comparison-box">
                  <div className="gg-comparison-col">
                    <span className="gg-comparison-label">Baseline ({tc.baseline_mode}):</span>
                    <div className="gg-comparison-metrics">
                      <span>{formatTransitTime(tc.baseline_transit_days)}</span>
                      <span>{formatCost(tc.baseline_cost_usd)}</span>
                      <span>{formatEmissions(tc.baseline_emissions_tco2e)}</span>
                      <Badge variant={tc.baseline_deadline_met ? "good" : "bad"}>
                        {tc.baseline_deadline_met ? "Met" : "Breached"}
                      </Badge>
                    </div>
                  </div>

                  {hasDisruption && (
                    <div className="gg-comparison-col disrupted-col">
                      <span className="gg-comparison-label">Disrupted ({tc.disrupted_mode}):</span>
                      <div className="gg-comparison-metrics">
                        <span>{formatTransitTime(tc.disrupted_transit_days)}</span>
                        <span>{formatCost(tc.disrupted_cost_usd)}</span>
                        <span>{formatEmissions(tc.disrupted_emissions_tco2e)}</span>
                        <Badge variant={tc.disrupted_deadline_met ? "good" : "bad"}>
                          {tc.disrupted_deadline_met ? "Met" : "Breached"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="gg-scenario-recommendation">
                  <span className="gg-rec-label">Decision Action:</span>
                  <p>{tc.recommended_action}</p>
                </div>

                <div className="gg-scenario-explanation">
                  <span className="gg-exp-label">Rationale:</span>
                  <p>{tc.explanation}</p>
                </div>

                <button
                  type="button"
                  className="gg-load-scenario-btn"
                  onClick={() => onLoadScenario(tc.shipment_id, hasDisruption ? tc.disruption_id : null)}
                >
                  <span>Load Scenario ({tc.shipment_id})</span>
                  <ArrowRightIcon size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
