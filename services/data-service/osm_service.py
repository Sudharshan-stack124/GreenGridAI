"""
osm_service.py — OpenStreetMap Logistics Facility Module
GreenGrid Data Service (IBM Z Datathon 2026)

Provides a self-contained loader and router for OSM-sourced logistics
facility data (warehouses, ports, airports, freight depots, etc.).

IMPORTANT: This module is entirely separate from the official GreenGrid
Version 2.1.1 dataset. OSM data is supplementary geospatial context only.
It does NOT affect dataset integrity checks or record counts.

CSV expectations
----------------
The loader tolerates any CSV that contains at minimum:
    osm_id, name, facility_type, lat, lon

Optional enriching columns (gracefully absent if missing):
    country, city, address, tags_json, source_file
"""

import csv
import json
import os
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

class OSMFacility(BaseModel):
    """A single logistics facility record sourced from OpenStreetMap."""

    osm_id: str = Field(..., description="OSM node/way/relation ID")
    name: str = Field(..., description="Facility display name")
    facility_type: str = Field(..., description="Facility classification (e.g. warehouse, port, airport)")
    lat: float = Field(..., description="Latitude (WGS-84)")
    lon: float = Field(..., description="Longitude (WGS-84)")
    country: Optional[str] = Field(None, description="Country name")
    city: Optional[str] = Field(None, description="City or municipality")
    address: Optional[str] = Field(None, description="Street address, if available")
    tags: Optional[Dict[str, Any]] = Field(None, description="Parsed OSM tags as key/value map")
    source_file: Optional[str] = Field(None, description="Source CSV filename")
    data_source: str = Field(default="OpenStreetMap", description="Data provenance")


class OSMSummary(BaseModel):
    """High-level summary of loaded OSM facility data."""

    total_facilities: int
    facility_types: Dict[str, int]
    countries: List[str]
    source_files: List[str]
    data_source: str = "OpenStreetMap"
    note: str = (
        "OSM data is supplementary geospatial context. "
        "It is NOT part of the GreenGrid V2.1.1 official dataset."
    )


# ---------------------------------------------------------------------------
# Loader
# ---------------------------------------------------------------------------

class OSMLoader:
    """
    Loads OSM logistics facility CSV files from a configurable directory.

    The loader scans for all *.csv files in `osm_data_dir`, skipping any
    that lack the mandatory columns (osm_id, name, facility_type, lat, lon).
    Multiple files are merged into a single facility list.
    """

    REQUIRED_COLS = {"osm_id", "name", "facility_type", "lat", "lon"}

    def __init__(self, osm_data_dir: Optional[str] = None):
        if osm_data_dir is None:
            base = os.path.dirname(os.path.abspath(__file__))
            # Try canonical locations in order of preference
            candidates = [
                os.path.join(base, "data", "osm"),
                os.path.join(base, "data", "samples"),
                os.path.join(base, "osm", "output"),
            ]
            self.osm_data_dir = next(
                (p for p in candidates if os.path.isdir(p)),
                candidates[0],   # default even if absent → will yield empty list
            )
        else:
            self.osm_data_dir = osm_data_dir

        self.facilities: List[OSMFacility] = []
        self._loaded = False

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _safe_float(self, val: Any) -> Optional[float]:
        try:
            return float(str(val).strip())
        except (ValueError, TypeError):
            return None

    def _safe_str(self, val: Any) -> Optional[str]:
        cleaned = str(val).strip() if val is not None else ""
        return cleaned if cleaned and cleaned.upper() not in ("NONE", "NULL", "NAN", "N/A") else None

    def _parse_tags(self, raw: Any) -> Optional[Dict[str, Any]]:
        """Safely parse tags_json column; returns None on any parse failure."""
        s = self._safe_str(raw)
        if not s:
            return None
        try:
            parsed = json.loads(s)
            return parsed if isinstance(parsed, dict) else None
        except (json.JSONDecodeError, TypeError):
            return None

    def _csv_has_required_cols(self, fieldnames: List[str]) -> bool:
        return self.REQUIRED_COLS.issubset(set(fieldnames))

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def load(self, force_reload: bool = False) -> List[OSMFacility]:
        """Load all OSM CSV files from `osm_data_dir`. Returns facilities list."""
        if self._loaded and not force_reload:
            return self.facilities

        facilities: List[OSMFacility] = []

        if not os.path.isdir(self.osm_data_dir):
            # Directory doesn't exist → return empty, not an error
            self.facilities = []
            self._loaded = True
            return self.facilities

        csv_files = sorted(
            f for f in os.listdir(self.osm_data_dir) if f.endswith(".csv")
        )

        for fname in csv_files:
            fpath = os.path.join(self.osm_data_dir, fname)
            try:
                with open(fpath, encoding="utf-8") as fh:
                    reader = csv.DictReader(fh)
                    if reader.fieldnames is None:
                        continue
                    if not self._csv_has_required_cols(list(reader.fieldnames)):
                        continue  # silently skip incompatible files

                    for row in reader:
                        osm_id = self._safe_str(row.get("osm_id"))
                        name = self._safe_str(row.get("name"))
                        ftype = self._safe_str(row.get("facility_type"))
                        lat = self._safe_float(row.get("lat"))
                        lon = self._safe_float(row.get("lon"))

                        # Skip rows missing mandatory fields
                        if not osm_id or not name or not ftype or lat is None or lon is None:
                            continue

                        facility = OSMFacility(
                            osm_id=osm_id,
                            name=name,
                            facility_type=ftype,
                            lat=lat,
                            lon=lon,
                            country=self._safe_str(row.get("country")),
                            city=self._safe_str(row.get("city")),
                            address=self._safe_str(row.get("address")),
                            tags=self._parse_tags(row.get("tags_json")),
                            source_file=fname,
                        )
                        facilities.append(facility)

            except (OSError, csv.Error):
                # Non-fatal: skip unreadable files
                continue

        self.facilities = facilities
        self._loaded = True
        return self.facilities

    def get_summary(self) -> OSMSummary:
        """Return aggregate statistics about loaded OSM facilities."""
        self.load()
        type_counts: Dict[str, int] = {}
        countries: set = set()
        source_files: set = set()

        for f in self.facilities:
            type_counts[f.facility_type] = type_counts.get(f.facility_type, 0) + 1
            if f.country:
                countries.add(f.country)
            if f.source_file:
                source_files.add(f.source_file)

        return OSMSummary(
            total_facilities=len(self.facilities),
            facility_types=dict(sorted(type_counts.items())),
            countries=sorted(countries),
            source_files=sorted(source_files),
        )

    def filter(
        self,
        facility_type: Optional[str] = None,
        country: Optional[str] = None,
        name_contains: Optional[str] = None,
    ) -> List[OSMFacility]:
        """Return filtered facilities. All filters are case-insensitive and optional."""
        self.load()
        results = self.facilities

        if facility_type:
            ft_lower = facility_type.lower()
            results = [r for r in results if r.facility_type.lower() == ft_lower]
        if country:
            c_lower = country.lower()
            results = [r for r in results if r.country and r.country.lower() == c_lower]
        if name_contains:
            nc_lower = name_contains.lower()
            results = [r for r in results if nc_lower in r.name.lower()]

        return results
