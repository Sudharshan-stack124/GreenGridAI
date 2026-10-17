"""
Scoring Engine for GreenGrid
Applies multi-objective weighting: 40% emissions, 35% cost, 25% time.
Normalizes candidate metrics and computes Pareto trade-offs.
"""

from typing import Dict, List, Tuple
from greengrid.models.decision import ScoreBreakdown
from greengrid.models.transport import TransportOption

# Standard GreenGrid Multi-Objective Weights
DEFAULT_WEIGHTS: Dict[str, float] = {
    "emissions": 0.40,
    "cost": 0.35,
    "time": 0.25,
}

# Alternative sensitivity scenarios for decision sensitivity analysis
SENSITIVITY_SCENARIOS: Dict[str, Dict[str, float]] = {
    "GreenGrid Standard": {"emissions": 0.40, "cost": 0.35, "time": 0.25},
    "F1 Net Zero Max Green": {"emissions": 0.70, "cost": 0.20, "time": 0.10},
    "Emergency / Race Critical": {"emissions": 0.10, "cost": 0.20, "time": 0.70},
    "Cost Constrained": {"emissions": 0.20, "cost": 0.70, "time": 0.10},
}


class ScoringEngine:
    """Calculates multi-objective scores for eligible transport candidates."""

    @classmethod
    def score_options(
        cls,
        options: List[TransportOption],
        weights: Dict[str, float] = DEFAULT_WEIGHTS,
    ) -> List[Tuple[TransportOption, ScoreBreakdown]]:
        """
        Applies min-max normalization across all eligible candidates and computes
        weighted composite score out of 100.

        Formula:
            Penalty_i = w_e * norm(E_i) + w_c * norm(C_i) + w_t * norm(T_i)
            Score_i = 100 * (1 - Penalty_i)

        Returns:
            List of (option, ScoreBreakdown) sorted by total_score descending.
        """
        if not options:
            return []

        w_e = weights.get("emissions", 0.40)
        w_c = weights.get("cost", 0.35)
        w_t = weights.get("time", 0.25)

        # Normalize weights if they do not sum to 1.0
        total_w = w_e + w_c + w_t
        if abs(total_w - 1.0) > 1e-6:
            w_e /= total_w
            w_c /= total_w
            w_t /= total_w

        # Extract metric arrays
        emissions_vals = [opt.validated_co2e_kg or 0.0 for opt in options]
        cost_vals = [opt.validated_cost_usd or 0.0 for opt in options]
        time_vals = [opt.validated_transit_hours or 0.0 for opt in options]

        e_min, e_max = min(emissions_vals), max(emissions_vals)
        c_min, c_max = min(cost_vals), max(cost_vals)
        t_min, t_max = min(time_vals), max(time_vals)

        scored_results: List[Tuple[TransportOption, ScoreBreakdown]] = []

        for opt in options:
            e = opt.validated_co2e_kg or 0.0
            c = opt.validated_cost_usd or 0.0
            t = opt.validated_transit_hours or 0.0

            # Normalized metrics (0.0 = best in pool, 1.0 = worst in pool)
            norm_e = 0.0 if e_max == e_min else (e - e_min) / (e_max - e_min)
            norm_c = 0.0 if c_max == c_min else (c - c_min) / (c_max - c_min)
            norm_t = 0.0 if t_max == t_min else (t - t_min) / (t_max - t_min)

            # Sub-scores: Points earned out of weight max
            emissions_pts = (1.0 - norm_e) * (w_e * 100.0)
            cost_pts = (1.0 - norm_c) * (w_c * 100.0)
            time_pts = (1.0 - norm_t) * (w_t * 100.0)

            total_score = round(emissions_pts + cost_pts + time_pts, 2)

            breakdown = ScoreBreakdown(
                co2e_kg=e,
                cost_usd=c,
                transit_hours=t,
                normalized_emissions=round(norm_e, 4),
                normalized_cost=round(norm_c, 4),
                normalized_time=round(norm_t, 4),
                emissions_contribution=round(emissions_pts, 2),
                cost_contribution=round(cost_pts, 2),
                time_contribution=round(time_pts, 2),
                total_score=total_score,
            )

            scored_results.append((opt, breakdown))

        # Sort descending: highest score first
        scored_results.sort(key=lambda item: item[1].total_score, reverse=True)
        return scored_results

    @classmethod
    def evaluate_sensitivity(
        cls,
        options: List[TransportOption],
    ) -> Dict[str, Dict[str, str]]:
        """
        Runs sensitivity analysis across alternative corporate and race priority profiles.
        Shows which option wins under different weighting schemes.
        """
        results: Dict[str, Dict[str, str]] = {}
        for scenario_name, weights in SENSITIVITY_SCENARIOS.items():
            scored = cls.score_options(options, weights)
            if scored:
                top_opt, top_breakdown = scored[0]
                results[scenario_name] = {
                    "winner_id": top_opt.id,
                    "winner_name": top_opt.name,
                    "winner_mode": top_opt.primary_mode.value,
                    "score": f"{top_breakdown.total_score:.1f}/100",
                    "weights": f"{int(weights['emissions']*100)}% CO2 / {int(weights['cost']*100)}% Cost / {int(weights['time']*100)}% Time",
                }
        return results
