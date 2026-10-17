"""
Metrics Validator for GreenGrid
Validates upstream supplied cost, transit time, and emissions against physical baselines.
Calculates missing or anomalous metrics.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from greengrid.calculators.cost import CostCalculator
from greengrid.calculators.emissions import EmissionsCalculator
from greengrid.calculators.transit_time import TransitTimeCalculator
from greengrid.models.cargo import Shipment
from greengrid.models.disruption import DisruptionEvent
from greengrid.models.transport import TransportOption


class ValidationReport(BaseModel):
    """Validation audit for a transport option."""
    option_id: str
    cost_validated: float
    time_validated: float
    co2e_validated: float
    discrepancies_found: List[str] = Field(default_factory=list)
    used_calculated_cost: bool = False
    used_calculated_time: bool = False
    used_calculated_co2e: bool = False


class MetricsValidator:
    """Core validator and calculator for logistics route metrics."""

    TOLERANCE_PCT = 0.35  # 35% allowed deviation before flagging upstream discrepancy

    @classmethod
    def validate_or_calculate(
        cls,
        option: TransportOption,
        shipment: Shipment,
        disruptions: Optional[List[DisruptionEvent]] = None,
    ) -> ValidationReport:
        """
        Validates or calculates cost, transit time, and CO2e.
        Populates option.validated_cost_usd, option.validated_transit_hours, and option.validated_co2e_kg.
        """
        # Baseline physical calculations
        calc_emissions = EmissionsCalculator.calculate_total_emissions(option, shipment)
        calc_cost = CostCalculator.calculate_total_cost(option, shipment)
        calc_time = TransitTimeCalculator.calculate_total_transit_time(option, shipment, disruptions)

        discrepancies = []
        used_calc_cost = False
        used_calc_time = False
        used_calc_co2e = False

        # 1. CO2e Validation
        if option.supplied_co2e_kg is not None and option.supplied_co2e_kg > 0:
            diff_ratio = abs(option.supplied_co2e_kg - calc_emissions) / max(calc_emissions, 1.0)
            if diff_ratio > cls.TOLERANCE_PCT:
                discrepancies.append(
                    f"Supplied CO2e ({option.supplied_co2e_kg:.1f} kg) deviates by {diff_ratio*100:.1f}% "
                    f"from GLEC baseline ({calc_emissions:.1f} kg). Defaulting to verified GLEC model."
                )
                final_co2e = calc_emissions
                used_calc_co2e = True
            else:
                final_co2e = option.supplied_co2e_kg
        else:
            final_co2e = calc_emissions
            used_calc_co2e = True

        # 2. Cost Validation
        if option.supplied_cost_usd is not None and option.supplied_cost_usd > 0:
            diff_ratio = abs(option.supplied_cost_usd - calc_cost) / max(calc_cost, 1.0)
            if diff_ratio > cls.TOLERANCE_PCT:
                discrepancies.append(
                    f"Supplied Cost (${option.supplied_cost_usd:,.2f}) deviates by {diff_ratio*100:.1f}% "
                    f"from logistics baseline (${calc_cost:,.2f}). Defaulting to verified freight cost model."
                )
                final_cost = calc_cost
                used_calc_cost = True
            else:
                final_cost = option.supplied_cost_usd
        else:
            final_cost = calc_cost
            used_calc_cost = True

        # 3. Transit Time Validation
        if option.supplied_transit_hours is not None and option.supplied_transit_hours > 0:
            diff_ratio = abs(option.supplied_transit_hours - calc_time) / max(calc_time, 1.0)
            if diff_ratio > cls.TOLERANCE_PCT:
                discrepancies.append(
                    f"Supplied Transit Time ({option.supplied_transit_hours:.1f}h) deviates by {diff_ratio*100:.1f}% "
                    f"from corridor model ({calc_time:.1f}h). Defaulting to verified lead time."
                )
                final_time = calc_time
                used_calc_time = True
            else:
                final_time = option.supplied_transit_hours
        else:
            final_time = calc_time
            used_calc_time = True

        # Write validated values back to option
        option.validated_co2e_kg = round(final_co2e, 2)
        option.validated_cost_usd = round(final_cost, 2)
        option.validated_transit_hours = round(final_time, 2)

        return ValidationReport(
            option_id=option.id,
            cost_validated=option.validated_cost_usd,
            time_validated=option.validated_transit_hours,
            co2e_validated=option.validated_co2e_kg,
            discrepancies_found=discrepancies,
            used_calculated_cost=used_calc_cost,
            used_calculated_time=used_calc_time,
            used_calculated_co2e=used_calc_co2e,
        )
