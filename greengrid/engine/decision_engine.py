"""
Core Decision Engine Orchestrator for GreenGrid
Authored for: Revanth — Decision Engine

Coordinates:
1. Operational Feasibility Filtering (Capacity, Hazmat, Geography, Disruptions)
2. Metrics Calculation and Validation (Cost, Time, CO2e via GLEC / ISO 14083)
3. Delivery Deadline Enforcement (Hard Grand Prix window constraint)
4. Multi-Objective Scoring (40% emissions, 35% cost, 25% time)
5. Comprehensive Ranking, Trade-off Deltas, and Natural Language Explanations
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional
from greengrid.calculators.validator import MetricsValidator
from greengrid.engine.deadline import DeadlineEnforcer
from greengrid.engine.feasibility import FeasibilityFilter
from greengrid.engine.scorer import DEFAULT_WEIGHTS, ScoringEngine
from greengrid.models.cargo import Shipment
from greengrid.models.decision import (
    DecisionResult,
    InfeasibleOption,
    RankedOption,
    ScoreBreakdown,
    TradeoffDelta,
)
from greengrid.models.disruption import DisruptionEvent
from greengrid.models.transport import TransportOption


class DecisionEngine:
    """
    GreenGrid Decision Engine.
    Executes core business logic to recommend the optimal shipping route.
    """

    def __init__(self, default_weights: Optional[Dict[str, float]] = None):
        self.weights = default_weights or DEFAULT_WEIGHTS

    def evaluate(
        self,
        shipment: Shipment,
        options: List[TransportOption],
        disruptions: Optional[List[DisruptionEvent]] = None,
        weights: Optional[Dict[str, float]] = None,
    ) -> DecisionResult:
        """
        Evaluates candidate shipping routes for a shipment and returns the ranked decision package.
        """
        active_weights = weights or self.weights
        disruptions_list = disruptions or []
        total_candidates = len(options)
        all_infeasible: List[InfeasibleOption] = []

        # -------------------------------------------------------------
        # STEP 1: Filter Infeasible Options (Capacity, Hazmat, Disruptions)
        # -------------------------------------------------------------
        feasible_stage1, infeasible_stage1 = FeasibilityFilter.filter_options(
            options=options,
            shipment=shipment,
            disruptions=disruptions_list,
        )
        all_infeasible.extend(infeasible_stage1)

        # -------------------------------------------------------------
        # STEP 2: Calculate or Validate Cost, Transit Time, and CO2e
        # -------------------------------------------------------------
        for opt in feasible_stage1:
            MetricsValidator.validate_or_calculate(
                option=opt,
                shipment=shipment,
                disruptions=disruptions_list,
            )

        # -------------------------------------------------------------
        # STEP 3: Enforce Delivery Deadlines (Hard operational constraint)
        # -------------------------------------------------------------
        feasible_stage2, deadline_infeasible = DeadlineEnforcer.filter_by_deadline(
            options=feasible_stage1,
            shipment=shipment,
        )
        all_infeasible.extend(deadline_infeasible)

        # -------------------------------------------------------------
        # STEP 4: Apply Multi-Objective Score (40% CO2e, 35% Cost, 25% Time)
        # -------------------------------------------------------------
        scored_candidates = ScoringEngine.score_options(
            options=feasible_stage2,
            weights=active_weights,
        )

        # If zero options survived
        if not scored_candidates:
            return self._build_empty_decision_result(
                shipment=shipment,
                total_candidates=total_candidates,
                all_infeasible=all_infeasible,
                active_weights=active_weights,
            )

        # -------------------------------------------------------------
        # STEP 5: Build Ranked Options and Compute Trade-Off Deltas
        # -------------------------------------------------------------
        ranked_list: List[RankedOption] = []
        best_opt, best_breakdown = scored_candidates[0]
        best_slack = shipment.available_hours - (best_opt.validated_transit_hours or 0.0)

        best_ranked = RankedOption(
            rank=1,
            option_id=best_opt.id,
            option_name=best_opt.name,
            carrier=best_opt.carrier,
            primary_mode=best_opt.primary_mode,
            score_breakdown=best_breakdown,
            slack_hours_before_deadline=round(best_slack, 1),
            tradeoff_vs_best=None,
            rationale=self._generate_best_rationale(best_opt, best_breakdown, best_slack),
            option_details=best_opt,
        )
        ranked_list.append(best_ranked)

        # Build alternatives
        for i, (alt_opt, alt_breakdown) in enumerate(scored_candidates[1:], start=2):
            alt_slack = shipment.available_hours - (alt_opt.validated_transit_hours or 0.0)
            delta = self._compute_tradeoff_delta(best_breakdown, alt_breakdown)
            rationale = self._generate_alternative_rationale(
                alt_opt=alt_opt,
                alt_breakdown=alt_breakdown,
                delta=delta,
                slack_hours=alt_slack,
            )

            ranked_alt = RankedOption(
                rank=i,
                option_id=alt_opt.id,
                option_name=alt_opt.name,
                carrier=alt_opt.carrier,
                primary_mode=alt_opt.primary_mode,
                score_breakdown=alt_breakdown,
                slack_hours_before_deadline=round(alt_slack, 1),
                tradeoff_vs_best=delta,
                rationale=rationale,
                option_details=alt_opt,
            )
            ranked_list.append(ranked_alt)

        # -------------------------------------------------------------
        # STEP 6: Run Sensitivity Analysis and Executive Summary
        # -------------------------------------------------------------
        sensitivity = ScoringEngine.evaluate_sensitivity(feasible_stage2)
        exec_summary = self._generate_executive_summary(
            shipment=shipment,
            best_ranked=best_ranked,
            ranked_list=ranked_list,
            infeasible_count=len(all_infeasible),
        )

        return DecisionResult(
            shipment_id=shipment.id,
            shipment_title=shipment.title,
            evaluated_at=datetime.now(timezone.utc),
            weights_applied=active_weights,
            total_candidates_evaluated=total_candidates,
            feasible_count=len(ranked_list),
            infeasible_count=len(all_infeasible),
            recommended_option=best_ranked,
            ranked_alternatives=ranked_list[1:],
            infeasible_options=all_infeasible,
            executive_summary=exec_summary,
            sensitivity_scenarios=sensitivity,
        )

    # -----------------------------------------------------------------
    # Helper & Explanation Generators
    # -----------------------------------------------------------------

    @staticmethod
    def _compute_tradeoff_delta(best_sb: ScoreBreakdown, alt_sb: ScoreBreakdown) -> TradeoffDelta:
        cost_diff = alt_sb.cost_usd - best_sb.cost_usd
        co2e_diff = alt_sb.co2e_kg - best_sb.co2e_kg
        time_diff = alt_sb.transit_hours - best_sb.transit_hours

        cost_pct = (cost_diff / max(best_sb.cost_usd, 1.0)) * 100.0
        co2e_pct = (co2e_diff / max(best_sb.co2e_kg, 1.0)) * 100.0
        time_pct = (time_diff / max(best_sb.transit_hours, 1.0)) * 100.0

        # Construct human-readable tradeoff sentence
        parts = []
        if cost_diff < 0:
            parts.append(f"saves ${abs(cost_diff):,.0f} ({abs(cost_pct):.1f}% cheaper)")
        elif cost_diff > 0:
            parts.append(f"costs +${cost_diff:,.0f} ({cost_pct:.1f}% more expensive)")

        if co2e_diff < 0:
            parts.append(f"reduces emissions by {abs(co2e_diff):,.0f} kg CO2e ({abs(co2e_pct):.1f}% cleaner)")
        elif co2e_diff > 0:
            parts.append(f"adds +{co2e_diff:,.0f} kg CO2e ({co2e_pct:.1f}% higher footprint)")

        if time_diff < 0:
            parts.append(f"arrives {abs(time_diff):.1f} hrs earlier")
        elif time_diff > 0:
            parts.append(f"requires +{time_diff:.1f} hrs extra transit time")

        summary = ", but ".join(parts) if parts else "Identical performance metrics."

        return TradeoffDelta(
            cost_diff_usd=round(cost_diff, 2),
            co2e_diff_kg=round(co2e_diff, 2),
            time_diff_hours=round(time_diff, 2),
            cost_pct_change=round(cost_pct, 1),
            co2e_pct_change=round(co2e_pct, 1),
            time_pct_change=round(time_pct, 1),
            human_summary=summary,
        )

    @staticmethod
    def _generate_best_rationale(opt: TransportOption, sb: ScoreBreakdown, slack: float) -> str:
        return (
            f"Recommended as #1 optimal route with composite GreenGrid score of {sb.total_score:.1f}/100. "
            f"Delivers an optimal balance of 40% carbon efficiency ({sb.co2e_kg:,.0f} kg CO2e, earning "
            f"{sb.emissions_contribution:.1f}/40 pts), 35% cost containment (${sb.cost_usd:,.0f}, earning "
            f"{sb.cost_contribution:.1f}/35 pts), and 25% schedule adherence ({sb.transit_hours:.1f} hrs, "
            f"earning {sb.time_contribution:.1f}/25 pts) with a robust {slack:.1f} hour buffer before race deadline."
        )

    @staticmethod
    def _generate_alternative_rationale(
        alt_opt: TransportOption,
        alt_breakdown: ScoreBreakdown,
        delta: TradeoffDelta,
        slack_hours: float,
    ) -> str:
        return (
            f"Ranked alternative (Score: {alt_breakdown.total_score:.1f}/100). "
            f"Trade-off vs Recommended Option: {delta.human_summary}. "
            f"Maintains a {slack_hours:.1f} hour safety buffer before paddock deadline."
        )

    @staticmethod
    def _generate_executive_summary(
        shipment: Shipment,
        best_ranked: RankedOption,
        ranked_list: List[RankedOption],
        infeasible_count: int,
    ) -> str:
        return (
            f"Logistics Decision Report for [{shipment.title}]: Evaluated {len(ranked_list) + infeasible_count} "
            f"candidate routes moving {shipment.total_weight_kg:,.0f} kg from {shipment.origin_code} to "
            f"{shipment.destination_code}. {infeasible_count} options disqualified due to physical, hazmat, "
            f"disruption, or deadline constraints. Top recommendation is '{best_ranked.option_name}' "
            f"via {best_ranked.primary_mode.value} (Score: {best_ranked.score_breakdown.total_score:.1f}/100, "
            f"CO2e: {best_ranked.score_breakdown.co2e_kg:,.0f} kg, Cost: ${best_ranked.score_breakdown.cost_usd:,.0f}, "
            f"Lead time: {best_ranked.score_breakdown.transit_hours:.1f} hrs with {best_ranked.slack_hours_before_deadline:.1f}h "
            f"margin before paddock gate closure)."
        )

    @staticmethod
    def _build_empty_decision_result(
        shipment: Shipment,
        total_candidates: int,
        all_infeasible: List[InfeasibleOption],
        active_weights: Dict[str, float],
    ) -> DecisionResult:
        reasons_summary = ", ".join({inf.reason_code.value for inf in all_infeasible})
        return DecisionResult(
            shipment_id=shipment.id,
            shipment_title=shipment.title,
            evaluated_at=datetime.now(timezone.utc),
            weights_applied=active_weights,
            total_candidates_evaluated=total_candidates,
            feasible_count=0,
            infeasible_count=len(all_infeasible),
            recommended_option=None,
            ranked_alternatives=[],
            infeasible_options=all_infeasible,
            executive_summary=(
                f"CRITICAL WARNING: No eligible transport option survived filtering for [{shipment.title}]. "
                f"All {total_candidates} options were disqualified due to: {reasons_summary}. "
                f"Immediate logistics escalation required to avoid race weekend operational failure."
            ),
            sensitivity_scenarios=None,
        )
