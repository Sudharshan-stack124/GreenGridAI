import React from "react";
import type { Disruption, Explanation, Recommendation, Shipment } from "../types";
import { ShipmentPanel } from "../components/ShipmentPanel";
import { DisruptionPanel } from "../components/DisruptionPanel";
import { ShipmentDetails } from "../components/ShipmentDetails";
import { DisruptionImpactAlert } from "../components/DisruptionImpactAlert";
import { RecommendationHero } from "../components/RecommendationHero";
import { RankedAlternativesTable } from "../components/RankedAlternativesTable";
import { ComparisonCharts } from "../components/ComparisonCharts";
import { AIExplanationCard } from "../components/AIExplanationCard";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { ErrorState } from "../components/ui/ErrorState";
import { CompassIcon, ShieldAlertIcon, CheckIcon } from "../components/ui/Icons";

interface DashboardPageProps {
  shipments: Shipment[] | null;
  disruptions: Disruption[] | null;
  loadingInitial: boolean;
  initialError: string | null;
  selectedShipmentId: string | null;
  selectedDisruptionId: string | null;
  setSelectedShipmentId: (id: string | null) => void;
  setSelectedDisruptionId: (id: string | null) => void;
  isAnalysing: boolean;
  analysisError: string | null;
  recommendation: Recommendation | null;
  isExplaining: boolean;
  explanationError: string | null;
  explanation: Explanation | null;
  handleAnalyse: (shpId?: string | null, disId?: string | null) => Promise<void>;
  loadInitialData: () => Promise<void>;
  onRetryExplain: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  shipments,
  disruptions,
  loadingInitial,
  initialError,
  selectedShipmentId,
  selectedDisruptionId,
  setSelectedShipmentId,
  setSelectedDisruptionId,
  isAnalysing,
  analysisError,
  recommendation,
  isExplaining,
  explanationError,
  explanation,
  handleAnalyse,
  loadInitialData,
  onRetryExplain,
}) => {
  const currentShipment = shipments?.find((s) => s.shipment_id === selectedShipmentId) ?? null;
  const currentDisruption = disruptions?.find((d) => d.disruption_id === selectedDisruptionId) ?? null;

  return (
    <div className="gg-dashboard-split">
      {/* Left Controls Column */}
      <aside className="gg-sidebar-col">
        <ShipmentPanel
          shipments={shipments}
          loading={loadingInitial}
          error={initialError}
          selectedId={selectedShipmentId}
          onSelect={(id) => {
            setSelectedShipmentId(id);
          }}
          onRetry={loadInitialData}
        />

        <DisruptionPanel
          disruptions={disruptions}
          loading={loadingInitial}
          error={initialError}
          selectedId={selectedDisruptionId}
          onSelect={(id) => {
            setSelectedDisruptionId(id);
          }}
          onRetry={loadInitialData}
        />

        <div className="gg-cta-wrap">
          <button
            type="button"
            className="gg-primary-cta"
            disabled={!selectedShipmentId || isAnalysing}
            onClick={() => handleAnalyse()}
          >
            {isAnalysing ? (
              <span className="gg-cta-loading">
                <span className="gg-btn-spinner" /> Evaluating Corridor...
              </span>
            ) : (
              <span>Analyse Freight Corridor</span>
            )}
          </button>
          <div className="gg-cta-caption">
            Evaluates Air, Road, Rail, and Sea against SLA deadlines, expenditure, and carbon footprint.
          </div>
        </div>
      </aside>

      {/* Right Telemetry & Results Column */}
      <section className="gg-results-col" aria-label="Analysis Results">
        <ShipmentDetails shipment={currentShipment} />

        {currentDisruption && (
          <DisruptionImpactAlert
            disruption={currentDisruption}
            onClear={() => {
              setSelectedDisruptionId(null);
            }}
          />
        )}

        {isAnalysing ? (
          <Card title="Decision Engine Multimodal Analysis" icon={<CompassIcon size={16} />}>
            <div className="gg-analysing-state">
              <Spinner label="Evaluating routes against circuity, DEFRA emission factors, and delivery SLA..." size="lg" />
            </div>
          </Card>
        ) : analysisError ? (
          <Card title="Analysis Execution Error" icon={<ShieldAlertIcon size={16} />}>
            <ErrorState
              title="Decision Engine Error"
              message={analysisError}
              onRetry={() => handleAnalyse()}
            />
          </Card>
        ) : !recommendation ? (
          <Card
            title="Decision Engine Ready"
            subtitle="Select shipment route and disruption scenario, then evaluate"
            icon={<CheckIcon size={16} />}
          >
            <div className="gg-onboarding-box">
              <div className="gg-onboarding-graphic">
                <CompassIcon size={36} />
              </div>
              <h3>Multimodal Evaluation Ready</h3>
              <p>
                Select any of the 27 monitored shipments from the catalog and optionally inject an active disruption scenario to evaluate alternative carrier networks.
              </p>
              <button
                type="button"
                className="gg-secondary-btn"
                onClick={() => handleAnalyse()}
                disabled={!selectedShipmentId}
              >
                Analyse {selectedShipmentId || "Selected Corridor"}
              </button>
            </div>
          </Card>
        ) : (
          <div className="gg-results-stream">
            {/* Top Recommendation Banner */}
            <RecommendationHero
              topOption={recommendation.recommendedOption}
              disruption={recommendation.disruption}
              availableWindowDays={currentShipment?.available_window_days}
            />

            {/* Ranked Alternatives Table */}
            <RankedAlternativesTable options={recommendation.options} />

            {/* Multimodal Tradeoff Visualizations */}
            <ComparisonCharts
              options={recommendation.options}
              availableWindowDays={currentShipment?.available_window_days}
            />

            {/* AI Explanation Service Card */}
            <AIExplanationCard
              explanation={explanation}
              loading={isExplaining}
              error={explanationError}
              onRetry={onRetryExplain}
            />
          </div>
        )}
      </section>
    </div>
  );
};
