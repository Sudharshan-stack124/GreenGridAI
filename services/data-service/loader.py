import csv
import os
from typing import Dict, List, Optional, Any
from schemas import (
    ShipmentModel,
    TransportOptionModel,
    DisruptionModel,
    ScenarioTestModel,
)

class DataLoader:
    """
    Robust data loader for GreenGrid Version 2.1.1 Official Frozen Dataset.
    Enforces exact dataset provenance, types, placeholder normalization, and referential checks.
    """
    EXPECTED_COUNTS = {
        "shipments": 27,
        "transport_options": 108,
        "disruptions": 5,
        "scenario_tests": 8,
        "data_dictionary": 79
    }

    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            self.data_dir = os.getenv("GREENGRID_DATA_DIR", os.path.join(base_dir, "data"))
        else:
            self.data_dir = data_dir

        self.shipments: Dict[str, ShipmentModel] = {}
        self.transport_options: Dict[str, List[TransportOptionModel]] = {}
        self.disruptions: Dict[str, DisruptionModel] = {}
        self.scenario_tests: Dict[str, ScenarioTestModel] = {}
        self.dictionary_rows_count: int = 0
        self.dataset_version: str = "2.1.1"

    def _parse_bool(self, val: Any) -> Optional[bool]:
        if val is None:
            return None
        cleaned = str(val).strip().lower()
        if not cleaned or cleaned in ("none", "null", "nan", "n/a"):
            return None
        return cleaned in ("true", "1", "yes", "t")

    def _parse_float(self, val: Any) -> Optional[float]:
        if val is None:
            return None
        cleaned = str(val).strip()
        if not cleaned or cleaned.upper() in ("NONE", "NULL", "NAN", "N/A", "-999"):
            return None
        try:
            return float(cleaned)
        except ValueError:
            return None

    def _parse_int(self, val: Any) -> Optional[int]:
        if val is None:
            return None
        cleaned = str(val).strip()
        if not cleaned or cleaned.upper() in ("NONE", "NULL", "NAN", "N/A", "-999"):
            return None
        try:
            return int(float(cleaned))
        except ValueError:
            return None

    def _parse_str(self, val: Any) -> Optional[str]:
        if val is None:
            return None
        cleaned = str(val).strip()
        if not cleaned or cleaned.upper() in ("NONE", "NULL", "NAN"):
            return None
        return cleaned

    def load_all(self):
        """Loads and verifies all canonical CSV tables from the data directory."""
        self.load_shipments()
        self.load_transport_options()
        self.load_disruptions()
        self.load_scenario_tests()
        self.load_data_dictionary()

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

                shipment = ShipmentModel(
                    shipment_id=s_id,
                    use_case_type=row.get("use_case_type", "").strip(),
                    leg_number=self._parse_int(row.get("leg_number")),
                    origin_round=self._parse_int(row.get("origin_round")),
                    origin_name=row.get("origin_name", "").strip(),
                    origin_circuit=self._parse_str(row.get("origin_circuit")),
                    origin_facility=self._parse_str(row.get("origin_facility")),
                    origin_country=row.get("origin_country", "").strip(),
                    origin_lat=self._parse_float(row.get("origin_lat")) or 0.0,
                    origin_lon=self._parse_float(row.get("origin_lon")) or 0.0,
                    origin_region=row.get("origin_region", "").strip(),
                    destination_round=self._parse_int(row.get("destination_round")),
                    destination_name=row.get("destination_name", "").strip(),
                    destination_circuit=self._parse_str(row.get("destination_circuit")),
                    destination_facility=self._parse_str(row.get("destination_facility")),
                    destination_country=row.get("destination_country", "").strip(),
                    destination_lat=self._parse_float(row.get("destination_lat")) or 0.0,
                    destination_lon=self._parse_float(row.get("destination_lon")) or 0.0,
                    destination_region=row.get("destination_region", "").strip(),
                    great_circle_km=self._parse_int(row.get("great_circle_km")) or 0,
                    cargo_weight_tonnes=self._parse_float(row.get("cargo_weight_tonnes")) or 0.0,
                    cargo_description=row.get("cargo_description", "").strip(),
                    weight_provenance=self._parse_str(row.get("weight_provenance")),
                    departure_date=row.get("departure_date", "").strip(),
                    delivery_deadline=row.get("delivery_deadline", "").strip(),
                    available_window_days=self._parse_float(row.get("available_window_days")) or 0.0,
                    notes=self._parse_str(row.get("notes")),
                    dataset_version=self.dataset_version
                )
                loaded[s_id] = shipment
        self.shipments = loaded

    def load_transport_options(self, filename: str = "transport_options.csv"):
        file_path = os.path.join(self.data_dir, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Transport options data file not found at: {file_path}")

        loaded: Dict[str, List[TransportOptionModel]] = {}
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                opt_id = row.get("option_id", "").strip()
                shp_id = row.get("shipment_id", "").strip()
                if not opt_id or not shp_id:
                    continue

                feasibility_status = row.get("feasibility_status", "").strip()
                is_infeasible = (feasibility_status.lower() == "infeasible")

                # Parse raw numerical fields
                raw_dist = self._parse_int(row.get("route_distance_km"))
                raw_circuity = self._parse_float(row.get("circuity_multiplier"))
                raw_transit = self._parse_float(row.get("transit_time_days"))
                raw_arrival = self._parse_str(row.get("estimated_arrival_date"))
                raw_meets = self._parse_bool(row.get("meets_deadline"))
                raw_margin = self._parse_float(row.get("deadline_margin_days"))
                raw_fixed = self._parse_float(row.get("fixed_cost_usd"))
                raw_distance_cost = self._parse_float(row.get("distance_cost_usd"))
                raw_cost = self._parse_float(row.get("total_cost_usd"))
                raw_ef = self._parse_float(row.get("emission_factor_kg_per_tkm"))
                raw_emissions = self._parse_float(row.get("total_emissions_tco2e"))
                raw_composite = self._parse_float(row.get("composite_score"))
                raw_rec = self._parse_bool(row.get("is_recommended"))

                # Infeasible normalization: treat 0.0 placeholders on infeasible routes as unavailable (None/null)
                # Genuine 0 values on feasible routes are preserved
                if is_infeasible:
                    if raw_transit is not None and raw_transit <= 0.0:
                        raw_transit = None
                    if raw_cost is not None and raw_cost <= 0.0:
                        raw_cost = None
                    if raw_emissions is not None and raw_emissions <= 0.0:
                        raw_emissions = None
                    if raw_dist is not None and raw_dist <= 0:
                        raw_dist = None
                    if raw_circuity is not None and raw_circuity <= 0.0:
                        raw_circuity = None
                    if raw_fixed is not None and raw_fixed <= 0.0:
                        raw_fixed = None
                    if raw_distance_cost is not None and raw_distance_cost <= 0.0:
                        raw_distance_cost = None
                    if raw_ef is not None and raw_ef <= 0.0:
                        raw_ef = None
                    if raw_composite is not None and raw_composite <= 0.0:
                        raw_composite = None
                    raw_meets = False
                    raw_rec = False

                option = TransportOptionModel(
                    option_id=opt_id,
                    shipment_id=shp_id,
                    use_case_type=row.get("use_case_type", "").strip(),
                    mode=row.get("mode", "").strip(),
                    feasibility_status=feasibility_status,
                    feasibility_reason=self._parse_str(row.get("feasibility_reason")),
                    route_distance_km=raw_dist,
                    circuity_multiplier=raw_circuity,
                    transit_time_days=raw_transit,
                    estimated_arrival_date=raw_arrival,
                    meets_deadline=raw_meets,
                    deadline_margin_days=raw_margin,
                    fixed_cost_usd=raw_fixed,
                    distance_cost_usd=raw_distance_cost,
                    total_cost_usd=raw_cost,
                    emission_factor_kg_per_tkm=raw_ef,
                    total_emissions_tco2e=raw_emissions,
                    composite_score=raw_composite,
                    is_recommended=raw_rec,
                    data_confidence=self._parse_str(row.get("data_confidence")),
                    cost_status=self._parse_str(row.get("cost_status")),
                    dataset_version=self.dataset_version
                )

                if shp_id not in loaded:
                    loaded[shp_id] = []
                loaded[shp_id].append(option)
        self.transport_options = loaded

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

                disruption = DisruptionModel(
                    disruption_id=d_id,
                    title=row.get("title", "").strip(),
                    type=row.get("type", "").strip(),
                    affected_mode=row.get("affected_mode", "").strip(),
                    geographic_corridor=row.get("geographic_corridor", "").strip(),
                    delay_impact_days=self._parse_float(row.get("delay_impact_days")) or 0.0,
                    cost_surcharge_usd=self._parse_float(row.get("cost_surcharge_usd")) or 0.0,
                    emissions_increase_pct=self._parse_float(row.get("emissions_increase_pct")) or 0.0,
                    description=row.get("description", "").strip(),
                    status=row.get("status", "").strip(),
                    mitigation_mode=self._parse_str(row.get("mitigation_mode")),
                    dataset_version=self.dataset_version
                )
                loaded[d_id] = disruption
        self.disruptions = loaded

    def load_scenario_tests(self, filename: str = "scenario_tests.csv"):
        file_path = os.path.join(self.data_dir, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Scenario tests data file not found at: {file_path}")

        loaded: Dict[str, ScenarioTestModel] = {}
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                tc_id = row.get("test_case_id", "").strip()
                if not tc_id:
                    continue

                tc = ScenarioTestModel(
                    test_case_id=tc_id,
                    domain=row.get("domain", "").strip(),
                    scenario_name=row.get("scenario_name", "").strip(),
                    shipment_id=row.get("shipment_id", "").strip(),
                    origin=row.get("origin", "").strip(),
                    destination=row.get("destination", "").strip(),
                    disruption_id=row.get("disruption_id", "").strip(),
                    tested_mode=row.get("tested_mode", "").strip(),
                    baseline_mode=row.get("baseline_mode", "").strip(),
                    baseline_transit_days=self._parse_float(row.get("baseline_transit_days")) or 0.0,
                    baseline_cost_usd=self._parse_float(row.get("baseline_cost_usd")) or 0.0,
                    baseline_emissions_tco2e=self._parse_float(row.get("baseline_emissions_tco2e")) or 0.0,
                    baseline_deadline_met=self._parse_bool(row.get("baseline_deadline_met")) or False,
                    disrupted_mode=row.get("disrupted_mode", "").strip(),
                    disrupted_transit_days=self._parse_float(row.get("disrupted_transit_days")) or 0.0,
                    disrupted_cost_usd=self._parse_float(row.get("disrupted_cost_usd")) or 0.0,
                    disrupted_emissions_tco2e=self._parse_float(row.get("disrupted_emissions_tco2e")) or 0.0,
                    disrupted_deadline_met=self._parse_bool(row.get("disrupted_deadline_met")) or False,
                    recommended_action=row.get("recommended_action", "").strip(),
                    explanation=row.get("explanation", "").strip(),
                    dataset_version=self.dataset_version
                )
                loaded[tc_id] = tc
        self.scenario_tests = loaded

    def load_data_dictionary(self, filename: str = "data_dictionary.csv"):
        file_path = os.path.join(self.data_dir, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Data dictionary file not found at: {file_path}")

        count = 0
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for _ in reader:
                count += 1
        self.dictionary_rows_count = count

    def get_record_counts(self) -> Dict[str, int]:
        total_options = sum(len(opts) for opts in self.transport_options.values())
        return {
            "shipments": len(self.shipments),
            "transport_options": total_options,
            "disruptions": len(self.disruptions),
            "scenario_tests": len(self.scenario_tests),
            "data_dictionary": self.dictionary_rows_count
        }

    def verify_integrity(self) -> bool:
        """Verifies record counts match manifest and foreign keys exist."""
        counts = self.get_record_counts()
        for key, expected in self.EXPECTED_COUNTS.items():
            if counts.get(key) != expected:
                return False

        # Referential integrity check: every option's shipment_id must exist in shipments
        for shp_id, opts in self.transport_options.items():
            if shp_id not in self.shipments:
                return False
            for opt in opts:
                if opt.shipment_id not in self.shipments:
                    return False
        return True
