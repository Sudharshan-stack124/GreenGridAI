"""
Feasibility Filter for GreenGrid Decision Engine
Enforces physical vehicle constraints, hazardous cargo certifications,
geographic connectivity, and real-time disruption avoidance.
"""

from typing import List, Optional, Tuple
from greengrid.models.cargo import Shipment
from greengrid.models.decision import InfeasibilityReasonCode, InfeasibleOption
from greengrid.models.disruption import DisruptionEvent
from greengrid.models.transport import TransportMode, TransportOption


class FeasibilityFilter:
    """Filters out infeasible transport candidates before optimization and scoring."""

    @classmethod
    def filter_options(
        cls,
        options: List[TransportOption],
        shipment: Shipment,
        disruptions: Optional[List[DisruptionEvent]] = None,
    ) -> Tuple[List[TransportOption], List[InfeasibleOption]]:
        """
        Evaluates candidate options against hard operational constraints.
        Returns:
            Tuple of (eligible_options, rejected_options)
        """
        eligible: List[TransportOption] = []
        infeasible: List[InfeasibleOption] = []

        active_disruptions = [d for d in (disruptions or []) if d.active]

        for opt in options:
            rejection = cls._check_option_feasibility(opt, shipment, active_disruptions)
            if rejection:
                infeasible.append(rejection)
            else:
                eligible.append(opt)

        return eligible, infeasible

    @classmethod
    def _check_option_feasibility(
        cls,
        opt: TransportOption,
        shipment: Shipment,
        disruptions: List[DisruptionEvent],
    ) -> Optional[InfeasibleOption]:
        """Runs sequence of feasibility checks for a single transport option."""

        # 1. Payload / Weight Capacity Constraint
        if shipment.total_weight_kg > opt.max_weight_capacity_kg:
            return InfeasibleOption(
                option_id=opt.id,
                option_name=opt.name,
                carrier=opt.carrier,
                primary_mode=opt.primary_mode,
                reason_code=InfeasibilityReasonCode.WEIGHT_CAPACITY_EXCEEDED,
                reason_message=(
                    f"Consignment gross weight ({shipment.total_weight_kg:,.0f} kg) exceeds vehicle/flight "
                    f"payload limit ({opt.max_weight_capacity_kg:,.0f} kg) by "
                    f"{shipment.total_weight_kg - opt.max_weight_capacity_kg:,.0f} kg."
                ),
                metrics={
                    "shipment_weight_kg": shipment.total_weight_kg,
                    "max_capacity_kg": opt.max_weight_capacity_kg,
                    "excess_kg": shipment.total_weight_kg - opt.max_weight_capacity_kg,
                },
            )

        # 2. Volumetric Capacity Constraint
        if shipment.total_volume_m3 > opt.max_volume_capacity_m3:
            return InfeasibleOption(
                option_id=opt.id,
                option_name=opt.name,
                carrier=opt.carrier,
                primary_mode=opt.primary_mode,
                reason_code=InfeasibilityReasonCode.VOLUME_CAPACITY_EXCEEDED,
                reason_message=(
                    f"Consignment volume ({shipment.total_volume_m3:.1f} m³) exceeds container/cargo hold "
                    f"capacity ({opt.max_volume_capacity_m3:.1f} m³) by "
                    f"{shipment.total_volume_m3 - opt.max_volume_capacity_m3:.1f} m³."
                ),
                metrics={
                    "shipment_volume_m3": shipment.total_volume_m3,
                    "max_volume_m3": opt.max_volume_capacity_m3,
                    "excess_m3": shipment.total_volume_m3 - opt.max_volume_capacity_m3,
                },
            )

        # 3. Dangerous Goods / Hazmat Certification
        if shipment.has_hazmat:
            unsupported = [
                h for h in shipment.hazmat_classes if h not in opt.supported_hazmat
            ]
            if unsupported:
                hazmat_names = ", ".join(h.value for h in unsupported)
                return InfeasibleOption(
                    option_id=opt.id,
                    option_name=opt.name,
                    carrier=opt.carrier,
                    primary_mode=opt.primary_mode,
                    reason_code=InfeasibilityReasonCode.HAZMAT_RESTRICTION_VIOLATED,
                    reason_message=(
                        f"Carrier/mode is not certified to transport dangerous goods: [{hazmat_names}]. "
                        f"Violates IATA DGR / IMO IMDG safety regulations."
                    ),
                    metrics={"unsupported_hazmat_count": len(unsupported)},
                )

        # 4. Temperature Control Requirements
        needs_temp = any(item.requires_temperature_control for item in shipment.items)
        if needs_temp and not opt.supports_temperature_control:
            return InfeasibleOption(
                option_id=opt.id,
                option_name=opt.name,
                carrier=opt.carrier,
                primary_mode=opt.primary_mode,
                reason_code=InfeasibilityReasonCode.TEMPERATURE_CONTROL_UNSUPPORTED,
                reason_message=(
                    "Shipment contains temperature-sensitive equipment (e.g. race tires / telemetry sensors) "
                    "but carrier does not offer active climate-controlled reefer cargo."
                ),
            )

        # 5. Active Disruption Corridor Blockage
        traversed_corridors = set(opt.corridors_traversed)
        for leg in opt.legs:
            traversed_corridors.update(leg.corridors)

        for d in disruptions:
            if d.completely_blocked:
                corridor_conflict = any(c in traversed_corridors for c in d.affected_corridors)
                mode_conflict = (opt.primary_mode in d.affected_modes) or (len(d.affected_modes) == 0)
                if corridor_conflict and mode_conflict:
                    return InfeasibleOption(
                        option_id=opt.id,
                        option_name=opt.name,
                        carrier=opt.carrier,
                        primary_mode=opt.primary_mode,
                        reason_code=InfeasibilityReasonCode.DISRUPTION_CORRIDOR_BLOCKED,
                        reason_message=(
                            f"Route traverses blocked corridor affected by active critical disruption: "
                            f"'{d.title}' ({d.category.value}). Total route severance."
                        ),
                        metrics={"delay_hours": d.delay_hours},
                    )

        # 6. Physical / Geographic Disconnect (e.g. road truck across oceans without ferry/rail)
        if opt.primary_mode == TransportMode.ROAD_TRUCK and opt.legs:
            has_ocean_codes = any(
                (leg.origin_code in ["MEL", "MIA", "SIN", "SYD"] and leg.destination_code in ["PVG", "BLQ", "LHR"])
                for leg in opt.legs
            )
            if has_ocean_codes:
                return InfeasibleOption(
                    option_id=opt.id,
                    option_name=opt.name,
                    carrier=opt.carrier,
                    primary_mode=opt.primary_mode,
                    reason_code=InfeasibilityReasonCode.GEOGRAPHICAL_DISCONNECT,
                    reason_message="Direct road freight is physically impossible across intercontinental oceanic routes.",
                )

        return None
