"""
Transit Time Calculator for GreenGrid
Computes linehaul duration, handling dwells, customs delays, and buffer margins.
"""

from typing import List, Optional
from greengrid.models.cargo import Shipment
from greengrid.models.disruption import DisruptionEvent
from greengrid.models.transport import TransportMode, TransportOption

# Standard baseline reliability safety buffers by primary mode (in hours)
MODE_RELIABILITY_BUFFERS: dict[TransportMode, float] = {
    TransportMode.AIR_CHARTER: 3.0,       # Highest priority, dedicated slots, low variance
    TransportMode.AIR_COMMERCIAL: 6.0,    # Subject to airline belly cargo transfers
    TransportMode.ROAD_TRUCK: 5.0,        # Highway traffic & driver rest regulations (EU Tachograph)
    TransportMode.RAIL_FREIGHT: 8.0,      # Rail shunting / track sharing
    TransportMode.SEA_CONTAINER: 36.0,    # Port congestion, crane availability, pilotage
    TransportMode.MULTIMODAL: 8.0,        # Transshipment handoffs
}


class TransitTimeCalculator:
    """Calculates end-to-end elapsed hours from origin packing to destination circuit arrival."""

    @classmethod
    def calculate_total_transit_time(
        cls,
        option: TransportOption,
        shipment: Shipment,
        disruptions: Optional[List[DisruptionEvent]] = None,
    ) -> float:
        """
        Total transit hours =
          Sum of (leg.transit_hours + leg.dwell_hours)
          + origin_handling_hours
          + customs_handling_hours
          + destination_drayage_hours
          + mode_reliability_buffer
          + disruption_delays
        """
        # Sum legs
        linehaul_hours = sum(leg.transit_hours + leg.dwell_hours for leg in option.legs)

        # Terminal & Ground operations
        terminal_hours = (
            option.origin_handling_hours
            + option.destination_drayage_hours
            + (option.customs_handling_hours if shipment.customs_required else 0.0)
        )

        # Baseline mode reliability buffer
        buffer_hours = MODE_RELIABILITY_BUFFERS.get(option.primary_mode, 6.0)

        # Disruption delays (if any active disruptions match corridors traversed)
        disruption_delay = 0.0
        if disruptions:
            traversed_set = set(option.corridors_traversed)
            for leg in option.legs:
                traversed_set.update(leg.corridors)

            for d in disruptions:
                if d.active and any(c in traversed_set for c in d.affected_corridors):
                    if option.primary_mode in d.affected_modes or not d.affected_modes:
                        disruption_delay += d.delay_hours

        total_hours = linehaul_hours + terminal_hours + buffer_hours + disruption_delay
        return round(total_hours, 2)
