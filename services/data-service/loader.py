import csv
import os
from typing import Dict, List, Optional
from schemas import ShipmentModel, DisruptionModel, TransportOptionModel

class DataLoader:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            # Default to data folder inside services/data-service
            base_dir = os.path.dirname(os.path.abspath(__file__))
            self.data_dir = os.getenv("GREENGRID_DATA_DIR", os.path.join(base_dir, "data"))
        else:
            self.data_dir = data_dir

        self.shipments: Dict[str, ShipmentModel] = {}
        self.disruptions: Dict[str, DisruptionModel] = {}
        self.transport_options: Dict[str, List[TransportOptionModel]] = {}
        self.data_mode: str = "synthetic_demo"

    def _parse_bool(self, val: str) -> bool:
        if not val:
            return False
        return str(val).strip().lower() in ("true", "1", "yes", "t")

    def _parse_float(self, val: str) -> Optional[float]:
        if val is None:
            return None
        cleaned = str(val).strip()
        if not cleaned or cleaned.upper() in ("NONE", "NULL", "NAN", "N/A"):
            return None
        try:
            return float(cleaned)
        except ValueError:
            return None

    def _parse_list(self, val: str, delimiter: str = ";") -> List[str]:
        if not val:
            return []
        items = [item.strip() for item in str(val).split(delimiter)]
        return [item for item in items if item and item.upper() != "NONE"]

    def load_all(self):
        """Loads shipments, disruptions, and transport options from CSV files."""
        self.load_shipments()
        self.load_disruptions()
        self.load_transport_options()

    def load_shipments(self, filename: str = "shipments.csv"):
        file_path = os.path.join(self.data_dir, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Shipments data file not found at: {file_path}")

        loaded: Dict[str, ShipmentModel] = {}
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                s_id = row.get("shipment_id", "").strip()
                if not s_id:
                    continue

                total_weight = self._parse_float(row.get("total_weight_tons")) or 0.0
                deadline = self._parse_float(row.get("deadline_hours")) or 0.0

                shipment = ShipmentModel(
                    shipment_id=s_id,
                    origin=row.get("origin", "").strip(),
                    destination=row.get("destination", "").strip(),
                    cargo_category=row.get("cargo_category", "").strip(),
                    total_weight_tons=total_weight,
                    deadline_hours=deadline,
                    priority=row.get("priority", "standard").strip(),
                    status=row.get("status", "scheduled").strip(),
                    data_mode=self.data_mode
                )
                loaded[s_id] = shipment
        self.shipments = loaded

    def load_disruptions(self, filename: str = "disruptions.csv"):
        file_path = os.path.join(self.data_dir, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Disruptions data file not found at: {file_path}")

        loaded: Dict[str, DisruptionModel] = {}
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                d_id = row.get("disruption_id", "").strip()
                if not d_id or d_id.upper() == "NONE":
                    continue

                delay = self._parse_float(row.get("delay_hours_impact")) or 0.0
                cost_mult = self._parse_float(row.get("cost_multiplier_impact")) or 1.0

                disruption = DisruptionModel(
                    disruption_id=d_id,
                    title=row.get("title", "").strip(),
                    type=row.get("type", "unknown").strip(),
                    affected_modes=self._parse_list(row.get("affected_modes", "")),
                    severity=row.get("severity", "medium").strip(),
                    location_name=row.get("location_name", "").strip(),
                    delay_hours_impact=delay,
                    cost_multiplier_impact=cost_mult,
                    description=row.get("description", "").strip(),
                    active=self._parse_bool(row.get("active", "true")),
                    data_mode=self.data_mode
                )
                loaded[d_id] = disruption
        self.disruptions = loaded

    def load_transport_options(self, filename: str = "transport_options.csv"):
        file_path = os.path.join(self.data_dir, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Transport options data file not found at: {file_path}")

        loaded: Dict[str, List[TransportOptionModel]] = {}
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                opt_id = row.get("option_id", "").strip()
                shipment_id = row.get("shipment_id", "").strip()
                if not opt_id or not shipment_id:
                    continue

                is_feasible = self._parse_bool(row.get("is_feasible", "true"))
                infeasibility_reason = row.get("infeasibility_reason", "").strip() or None

                raw_transit = self._parse_float(row.get("transit_time_hours"))
                raw_cost = self._parse_float(row.get("cost_usd"))
                raw_emissions = self._parse_float(row.get("emissions_kg_co2e"))

                # Requirement: Treat placeholder values in infeasible options as unavailable (None/null),
                # not genuine zero cost or zero transit time.
                if not is_feasible:
                    if raw_transit is not None and raw_transit <= 0.0:
                        raw_transit = None
                    if raw_cost is not None and raw_cost <= 0.0:
                        raw_cost = None
                    if raw_emissions is not None and raw_emissions <= 0.0:
                        raw_emissions = None

                option = TransportOptionModel(
                    option_id=opt_id,
                    shipment_id=shipment_id,
                    mode=row.get("mode", "").strip(),
                    provider_name=row.get("provider_name", "").strip(),
                    transit_time_hours=raw_transit,
                    cost_usd=raw_cost,
                    emissions_kg_co2e=raw_emissions,
                    is_feasible=is_feasible,
                    infeasibility_reason=infeasibility_reason,
                    disruption_ids=self._parse_list(row.get("disruption_ids", "")),
                    data_mode=self.data_mode
                )

                if shipment_id not in loaded:
                    loaded[shipment_id] = []
                loaded[shipment_id].append(option)
        self.transport_options = loaded
