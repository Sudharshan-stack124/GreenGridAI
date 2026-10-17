import React, { useCallback, useEffect, useState } from "react";
import { api } from "./services/api";
import { config } from "./config";
import type { Disruption, Explanation, Recommendation, Shipment } from "./types";
import { Header } from "./components/Header";
import { StatOverview } from "./components/StatOverview";
import { ShipmentPanel } from "./components/ShipmentPanel";
import { DisruptionPanel } from "./components/DisruptionPanel";
import { ShipmentDetails } from "./components/ShipmentDetails";
import { DisruptionImpactAlert } from "./components/DisruptionImpactAlert";
import { RecommendationHero } from "./components/RecommendationHero";
import { RankedAlternativesTable } from "./components/RankedAlternativesTable";
import { ComparisonCharts } from "./components/ComparisonCharts";
import { AIExplanationCard } from "./components/AIExplanationCard";
import { ScenariosView } from "./components/ScenariosView";
import { DatasetExplorerView } from "./components/DatasetExplorerView";
import { Card } from "./components/ui/Card";
import { Spinner } from "./components/ui/Spinner";
import { ErrorState } from "./components/ui/ErrorState";
import { CompassIcon, ShieldAlertIcon, CheckIcon } from "./components/ui/Icons";

export default function App() {
  const [useMocks, setUseMocks] = useState(config.useMocks);
  const [activeTab, setActiveTab] = useState<"dashboard" | "scenarios" | "dataset">("dashboard");

  // Remote / Mock Data States
  const [shipments, setShipments] = useState<Shipment[] | null>(null);
  const [disruptions, setDisruptions] = useState<Disruption[] | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [initialError, setInitialError] = useState<string | null>(null);

  // User Selections
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [selectedDisruptionId, setSelectedDisruptionId] = useState<string | null>(null);

  // Analysis Result States
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  // AI Explanation States
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);

  // Load initial shipments and disruptions
  const loadInitialData = useCallback(async () => {
    setLoadingInitial(true);
    setInitialError(null);
    try {
      const [shpData, disData] = await Promise.all([
        api.getShipments(),
        api.getDisruptions(),
      ]);
      setShipments(shpData);
      setDisruptions(disData);

      // Default select the first shipment if none selected
      if (!selectedShipmentId && shpData.length > 0) {
        setSelectedShipmentId(shpData[0].shipment_id);
      }
    } catch (err: unknown) {
      setInitialError((err as Error).message || "Failed to load logistics telemetry.");
    } finally {
      setLoadingInitial(false);
    }
  }, [selectedShipmentId]);

  useEffect(() => {
    config.useMocks = useMocks;
    loadInitialData();
  }, [useMocks, loadInitialData]);

  // Selected entities
  const currentShipment = shipments?.find((s) => s.shipment_id === selectedShipmentId) ?? null;
  const currentDisruption = disruptions?.find((d) => d.disruption_id === selectedDisruptionId) ?? null;

  // Execute Analysis
  const handleAnalyse = useCallback(async (shpId = selectedShipmentId, disId = selectedDisruptionId) => {
    if (!shpId) return;

    setIsAnalysing(true);
    setAnalysisError(null);
    setRecommendation(null);
    setExplanation(null);
    setExplanationError(null);

    try {
      const rec = await api.recommend(shpId, disId);
      setRecommendation(rec);

      // Trigger AI Explanation
      setIsExplaining(true);
      api.explain(rec)
        .then((expl) => {
          setExplanation(expl);
        })
        .catch((err: Error) => {
          setExplanationError(err.message || "Unable to retrieve AI explanation.");
        })
        .finally(() => {
          setIsExplaining(false);
        });
    } catch (err: unknown) {
      setAnalysisError((err as Error).message || "Failed to execute decision recommendation.");
    } finally {
      setIsAnalysing(false);
    }
  }, [selectedShipmentId, selectedDisruptionId]);

  // Handler for loading a scenario from the Scenarios View
  const handleLoadScenario = useCallback((shipmentId: string, disruptionId: string | null) => {
    setSelectedShipmentId(shipmentId);
    setSelectedDisruptionId(disruptionId);
    setActiveTab("dashboard");
    // Trigger analysis for that scenario immediately
    handleAnalyse(shipmentId, disruptionId);
  }, [handleAnalyse]);

  return (
    <div className="gg-app-root">
      <Header
        useMocks={useMocks}
        onToggleMocks={setUseMocks}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {useMocks && (
        <div className="gg-mock-banner" role="status">
          <div className="gg-mock-banner-content">
            <span className="gg-banner-pill">STANDALONE BENCHMARK MODE</span>
            <span>
              Operating with the verified IBM Z Datathon 2026 Frozen Dataset (v2.1.1). Set <code>VITE_USE_MOCKS=false</code> in <code>.env</code> or toggle above to connect live backend microservices.
            </span>
          </div>
        </div>
      )}

      <main className="gg-main-layout" id="main-content">
        <StatOverview
          totalShipments={shipments?.length ?? 27}
          totalDisruptions={disruptions?.length ?? 5}
          selectedShipment={currentShipment}
          selectedDisruption={currentDisruption}
        />

        {activeTab === "scenarios" ? (
          <ScenariosView onLoadScenario={handleLoadScenario} />
        ) : activeTab === "dataset" ? (
          <DatasetExplorerView />
        ) : (
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
                  setRecommendation(null);
                  setExplanation(null);
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
                  setRecommendation(null);
                  setExplanation(null);
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
                    setRecommendation(null);
                    setExplanation(null);
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
                    onRetry={() => {
                      if (recommendation) {
                        setIsExplaining(true);
                        api.explain(recommendation)
                          .then(setExplanation)
                          .catch((e: Error) => setExplanationError(e.message))
                          .finally(() => setIsExplaining(false));
                      }
                    }}
                  />
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="gg-footer">
        <div className="gg-footer-container">
          <div className="gg-footer-left">
            <span><strong>GreenGrid</strong> — Logistics Decision-Support System</span>
            <span>IBM Z Datathon 2026 • LinuxONE & z/OS AI Architecture</span>
          </div>
          <div className="gg-footer-right">
            <span>Verified Dataset: <strong>v2.1.1 Frozen Benchmark</strong></span>
            <span>Carbon Accounting: <strong>ISO 14083 / GLEC Framework</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
