"""
Decision Engine Result Models for GreenGrid
Provides structured rankings, score breakdowns, trade-off comparisons, and audit trails.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from greengrid.models.transport import TransportMode, TransportOption


class InfeasibilityReasonCode(str, Enum):
    """Categorical reasons an option was disqualified."""
    WEIGHT_CAPACITY_EXCEEDED = "WEIGHT_CAPACITY_EXCEEDED"
    VOLUME_CAPACITY_EXCEEDED = "VOLUME_CAPACITY_EXCEEDED"
    HAZMAT_RESTRICTION_VIOLATED = "HAZMAT_RESTRICTION_VIOLATED"
    DEADLINE_EXCEEDED = "DEADLINE_EXCEEDED"
    DISRUPTION_CORRIDOR_BLOCKED = "DISRUPTION_CORRIDOR_BLOCKED"
    GEOGRAPHICAL_DISCONNECT = "GEOGRAPHICAL_DISCONNECT"
    TEMPERATURE_CONTROL_UNSUPPORTED = "TEMPERATURE_CONTROL_UNSUPPORTED"


class InfeasibleOption(BaseModel):
    """Audit record for a disqualified route candidate."""
    option_id: str
    option_name: str
    carrier: str
    primary_mode: TransportMode
    reason_code: InfeasibilityReasonCode
    reason_message: str
    metrics: Dict[str, float] = Field(default_factory=dict)


class ScoreBreakdown(BaseModel):
    """Granular breakdown of the multi-objective score."""
    co2e_kg: float
    cost_usd: float
    transit_hours: float
    normalized_emissions: float = Field(ge=0.0, le=1.0, description="0 = lowest in pool, 1 = highest")
    normalized_cost: float = Field(ge=0.0, le=1.0)
    normalized_time: float = Field(ge=0.0, le=1.0)
    emissions_contribution: float = Field(description="Points earned out of 40")
    cost_contribution: float = Field(description="Points earned out of 35")
    time_contribution: float = Field(description="Points earned out of 25")
    total_score: float = Field(ge=0.0, le=100.0, description="Final score 0 to 100")


class TradeoffDelta(BaseModel):
    """Comparison against the #1 Recommended Option."""
    cost_diff_usd: float = Field(description="Difference in cost (positive = more expensive, negative = cheaper)")
    co2e_diff_kg: float = Field(description="Difference in emissions (positive = dirtier, negative = cleaner)")
    time_diff_hours: float = Field(description="Difference in transit time (positive = slower, negative = faster)")
    cost_pct_change: float
    co2e_pct_change: float
    time_pct_change: float
    human_summary: str


class RankedOption(BaseModel):
    """Eligible transport option evaluated and ranked by the Decision Engine."""
    rank: int = Field(ge=1)
    option_id: str
    option_name: str
    carrier: str
    primary_mode: TransportMode
    score_breakdown: ScoreBreakdown
    slack_hours_before_deadline: float = Field(description="Margin between delivery time and race deadline")
    tradeoff_vs_best: Optional[TradeoffDelta] = None
    rationale: str = Field(description="Transparent natural language justification")
    option_details: TransportOption


class DecisionResult(BaseModel):
    """Comprehensive decision package returned by Revanth — Decision Engine."""
    shipment_id: str
    shipment_title: str
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    weights_applied: Dict[str, float] = Field(
        default_factory=lambda: {"emissions": 0.40, "cost": 0.35, "time": 0.25}
    )
    total_candidates_evaluated: int
    feasible_count: int
    infeasible_count: int
    recommended_option: Optional[RankedOption] = None
    ranked_alternatives: List[RankedOption] = Field(default_factory=list)
    infeasible_options: List[InfeasibleOption] = Field(default_factory=list)
    executive_summary: str
    sensitivity_scenarios: Optional[Dict[str, Dict[str, str]]] = None
