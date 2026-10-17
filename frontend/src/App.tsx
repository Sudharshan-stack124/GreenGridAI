import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { api } from "./services/api";
import { config } from "./config";
import type { Disruption, Explanation, Recommendation, Shipment } from "./types";
import { Header } from "./components/Header";
import { StatOverview } from "./components/StatOverview";
import { ScenariosView } from "./components/ScenariosView";
import { DatasetExplorerView } from "./components/DatasetExplorerView";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AboutPage } from "./pages/AboutPage";
import { Cursor } from "./components/Cursor";
import { ThemeProvider } from "./context/ThemeContext";

function MainContent() {
  const navigate = useNavigate();
  const [useMocks, setUseMocks] = useState(config.useMocks);

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

  // Handler for loading scenario from Scenarios page
  const handleLoadScenario = useCallback((shipmentId: string, disruptionId: string | null) => {
    setSelectedShipmentId(shipmentId);
    setSelectedDisruptionId(disruptionId);
    navigate("/dashboard");
    handleAnalyse(shipmentId, disruptionId);
  }, [navigate, handleAnalyse]);

  const currentShipment = shipments?.find((s) => s.shipment_id === selectedShipmentId) ?? null;
  const currentDisruption = disruptions?.find((d) => d.disruption_id === selectedDisruptionId) ?? null;

  return (
    <div className="gg-app-root">
      <Cursor />
      <Header
        useMocks={useMocks}
        onToggleMocks={setUseMocks}
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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <>
                <StatOverview
                  totalShipments={shipments?.length ?? 27}
                  totalDisruptions={disruptions?.length ?? 5}
                  selectedShipment={currentShipment}
                  selectedDisruption={currentDisruption}
                />
                <DashboardPage
                  shipments={shipments}
                  disruptions={disruptions}
                  loadingInitial={loadingInitial}
                  initialError={initialError}
                  selectedShipmentId={selectedShipmentId}
                  selectedDisruptionId={selectedDisruptionId}
                  setSelectedShipmentId={(id) => {
                    setSelectedShipmentId(id);
                    setRecommendation(null);
                    setExplanation(null);
                  }}
                  setSelectedDisruptionId={(id) => {
                    setSelectedDisruptionId(id);
                    setRecommendation(null);
                    setExplanation(null);
                  }}
                  isAnalysing={isAnalysing}
                  analysisError={analysisError}
                  recommendation={recommendation}
                  isExplaining={isExplaining}
                  explanationError={explanationError}
                  explanation={explanation}
                  handleAnalyse={handleAnalyse}
                  loadInitialData={loadInitialData}
                  onRetryExplain={() => {
                    if (recommendation) {
                      setIsExplaining(true);
                      api.explain(recommendation)
                        .then(setExplanation)
                        .catch((e: Error) => setExplanationError(e.message))
                        .finally(() => setIsExplaining(false));
                    }
                  }}
                />
              </>
            }
          />
          <Route
            path="/scenarios"
            element={
              <>
                <StatOverview
                  totalShipments={shipments?.length ?? 27}
                  totalDisruptions={disruptions?.length ?? 5}
                  selectedShipment={currentShipment}
                  selectedDisruption={currentDisruption}
                />
                <ScenariosView onLoadScenario={handleLoadScenario} />
              </>
            }
          />
          <Route
            path="/dataset"
            element={
              <>
                <StatOverview
                  totalShipments={shipments?.length ?? 27}
                  totalDisruptions={disruptions?.length ?? 5}
                  selectedShipment={currentShipment}
                  selectedDisruption={currentDisruption}
                />
                <DatasetExplorerView />
              </>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
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

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MainContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
