// Data formatting utilities adhering to GreenGrid precision guidelines
// GUARANTEE: Never display placeholder zero values as genuine cost, time, or emissions.

export const isValidMetric = (v?: number | null): v is number =>
  typeof v === "number" && isFinite(v) && v > 0;

export const formatCost = (v?: number | null, currency = "USD"): string => {
  if (!isValidMetric(v)) return "N/A (Infeasible)";
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`;
};

export const formatTransitTime = (days?: number | null): string => {
  if (!isValidMetric(days)) return "N/A (Infeasible)";
  const hours = Math.round(days * 24 * 10) / 10;
  if (days < 2) {
    return `${days.toFixed(1)} days (${hours} hrs)`;
  }
  return `${days.toFixed(1)} days`;
};

export const formatEmissions = (tco2e?: number | null): string => {
  if (!isValidMetric(tco2e)) return "N/A (Infeasible)";
  if (tco2e < 1.0) {
    return `${(tco2e * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e`;
  }
  return `${tco2e.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO₂e`;
};

export const formatWeight = (tonnes?: number | null): string => {
  if (!isValidMetric(tonnes)) return "0.0 t";
  const kg = Math.round(tonnes * 1000);
  return `${tonnes.toLocaleString()} metric tonnes (${kg.toLocaleString()} kg)`;
};

export const formatDistance = (km?: number | null): string => {
  if (!isValidMetric(km)) return "N/A";
  return `${km.toLocaleString()} km`;
};
