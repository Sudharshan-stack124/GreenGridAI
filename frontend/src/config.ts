// Application configuration loaded from environment variables
// Configurable without rebuilding the app.

export const config = {
  dataUrl: (import.meta.env.VITE_DATA_SERVICE_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:8001",
  decisionUrl: (import.meta.env.VITE_DECISION_ENGINE_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:8002",
  aiUrl: (import.meta.env.VITE_AI_SERVICE_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:8003",
  useMocks: import.meta.env.VITE_USE_MOCKS === "false" ? false : true,
  datasetVersion: "2.1.1 (Official Frozen Benchmark)",
};
