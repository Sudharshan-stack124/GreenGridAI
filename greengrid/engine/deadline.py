"""
Deadline Enforcer for GreenGrid Decision Engine
Enforces delivery deadlines as hard constraints for Formula 1 Grand Prix schedules.
"""

from typing import List, Tuple
from greengrid.models.cargo import Shipment
from greengrid.models.decision import InfeasibilityReasonCode, InfeasibleOption
from greengrid.models.transport import TransportOption


class DeadlineEnforcer:
    """Enforces strict delivery deadlines, eliminating routes that arrive late."""

    @classmethod
    def filter_by_deadline(
        cls,
        options: List[TransportOption],
        shipment: Shipment,
    ) -> Tuple[List[TransportOption], List[InfeasibleOption]]:
        """
        Validates whether each option's validated transit time fits within the
        available window between shipment.ready_time and shipment.deadline_time.

        Returns:
            Tuple of (eligible_within_deadline, deadline_exceeded_options)
        """
        eligible: List[TransportOption] = []
        infeasible: List[InfeasibleOption] = []

        available_hours = shipment.available_hours

        for opt in options:
            transit_hours = opt.validated_transit_hours or 0.0

            if transit_hours > available_hours:
                deficit_hours = transit_hours - available_hours
                infeasible.append(
                    InfeasibleOption(
                        option_id=opt.id,
                        option_name=opt.name,
                        carrier=opt.carrier,
                        primary_mode=opt.primary_mode,
                        reason_code=InfeasibilityReasonCode.DEADLINE_EXCEEDED,
                        reason_message=(
                            f"Transit duration ({transit_hours:.1f} hrs) violates strict delivery deadline. "
                            f"Available operational window is {available_hours:.1f} hrs. "
                            f"Route arrives {deficit_hours:.1f} hrs late, missing FIA scrutineering / FP1 setup."
                        ),
                        metrics={
                            "required_transit_hours": transit_hours,
                            "available_window_hours": available_hours,
                            "deficit_hours": deficit_hours,
                        },
                    )
                )
            else:
                eligible.append(opt)

        return eligible, infeasible
