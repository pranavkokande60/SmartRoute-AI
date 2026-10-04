"""
SmartRoute-AI Factory and Product Mapping Module
================================================
Module: src/factory_mapping.py
Author: Antigravity AI Engineering Team

This module defines the 5 primary factory facilities, their geospatial coordinates,
the exact product-to-factory distribution assignments, and US state centroid coordinates
for route geometry calculation.
"""

import math
from typing import Dict, Any, Optional, Tuple

# 1. FACTORY DIRECTORY WITH GEOGRAPHIC COORDINATES
FACTORIES: Dict[str, Dict[str, Any]] = {
    "Lot's O' Nuts": {
        "id": "FAC-LON-01",
        "name": "Lot's O' Nuts",
        "latitude": 32.881893,
        "longitude": -111.768036,
        "city": "Casa Grande",
        "state": "Arizona",
        "state_code": "AZ",
        "specialization": "Nut & Marshmallow Chocolate Bars",
        "capacity_units_day": 50000
    },
    "Wicked Choccy's": {
        "id": "FAC-WCK-02",
        "name": "Wicked Choccy's",
        "latitude": 32.076176,
        "longitude": -81.088371,
        "city": "Savannah",
        "state": "Georgia",
        "state_code": "GA",
        "specialization": "Premium Milk & Caramel Chocolate",
        "capacity_units_day": 75000
    },
    "Sugar Shack": {
        "id": "FAC-SSK-03",
        "name": "Sugar Shack",
        "latitude": 48.119140,
        "longitude": -96.181150,
        "city": "Thief River Falls",
        "state": "Minnesota",
        "state_code": "MN",
        "specialization": "Sugar Candies & Specialty Beverages",
        "capacity_units_day": 35000
    },
    "Secret Factory": {
        "id": "FAC-SEC-04",
        "name": "Secret Factory",
        "latitude": 41.446333,
        "longitude": -90.565487,
        "city": "Rock Island",
        "state": "Illinois",
        "state_code": "IL",
        "specialization": "Experimental Confections & Novelties",
        "capacity_units_day": 25000
    },
    "The Other Factory": {
        "id": "FAC-OTH-05",
        "name": "The Other Factory",
        "latitude": 35.117500,
        "longitude": -89.971107,
        "city": "Memphis",
        "state": "Tennessee",
        "state_code": "TN",
        "specialization": "Chewy Candies & Specialty Toffee",
        "capacity_units_day": 40000
    }
}

# 2. PRODUCT TO FACTORY RAW MAPPING RULES
PRODUCT_TO_FACTORY_RULES: Dict[str, str] = {
    # Chocolate Division
    "wonka bar - nutty crunch surprise": "Lot's O' Nuts",
    "wonka bar - fudge mallows": "Lot's O' Nuts",
    "wonka bar -scrumdiddlyumptious": "Lot's O' Nuts",
    "wonka bar - scrumdiddlyumptious": "Lot's O' Nuts",
    "wonka bar - milk chocolate": "Wicked Choccy's",
    "wonka bar - triple dazzle caramel": "Wicked Choccy's",
    # Sugar Division
    "laffy taffy": "Sugar Shack",
    "sweetarts": "Sugar Shack",
    "nerds": "Sugar Shack",
    "fun dip": "Sugar Shack",
    "everlasting gobstopper": "Secret Factory",
    "hair toffee": "The Other Factory",
    # Other Division
    "fizzy lifting drinks": "Sugar Shack",
    "lickable wallpaper": "Secret Factory",
    "wonka gum": "Secret Factory",
    "kazookles": "The Other Factory"
}

# 3. US STATE & CANADIAN PROVINCE CENTROID COORDINATES
STATE_COORDINATES: Dict[str, Dict[str, Any]] = {
    "Alabama": {"code": "AL", "lat": 32.806671, "lng": -86.791130, "country": "US", "region": "Gulf"},
    "Alaska": {"code": "AK", "lat": 61.370716, "lng": -152.404419, "country": "US", "region": "Pacific"},
    "Arizona": {"code": "AZ", "lat": 33.729759, "lng": -111.431221, "country": "US", "region": "Pacific"},
    "Arkansas": {"code": "AR", "lat": 34.969704, "lng": -92.373123, "country": "US", "region": "Gulf"},
    "California": {"code": "CA", "lat": 36.116203, "lng": -119.681564, "country": "US", "region": "Pacific"},
    "Colorado": {"code": "CO", "lat": 39.059811, "lng": -105.311104, "country": "US", "region": "Interior"},
    "Connecticut": {"code": "CT", "lat": 41.597782, "lng": -72.755371, "country": "US", "region": "Atlantic"},
    "Delaware": {"code": "DE", "lat": 39.318523, "lng": -75.507141, "country": "US", "region": "Atlantic"},
    "District of Columbia": {"code": "DC", "lat": 38.897438, "lng": -77.026817, "country": "US", "region": "Atlantic"},
    "Florida": {"code": "FL", "lat": 27.766279, "lng": -81.686783, "country": "US", "region": "Gulf"},
    "Georgia": {"code": "GA", "lat": 33.040619, "lng": -83.643074, "country": "US", "region": "Gulf"},
    "Idaho": {"code": "ID", "lat": 44.240459, "lng": -114.478828, "country": "US", "region": "Pacific"},
    "Illinois": {"code": "IL", "lat": 40.349457, "lng": -88.986137, "country": "US", "region": "Interior"},
    "Indiana": {"code": "IN", "lat": 39.849426, "lng": -86.258278, "country": "US", "region": "Interior"},
    "Iowa": {"code": "IA", "lat": 42.011539, "lng": -93.210526, "country": "US", "region": "Interior"},
    "Kansas": {"code": "KS", "lat": 38.526600, "lng": -96.726486, "country": "US", "region": "Interior"},
    "Kentucky": {"code": "KY", "lat": 37.668140, "lng": -84.670067, "country": "US", "region": "Gulf"},
    "Louisiana": {"code": "LA", "lat": 31.169546, "lng": -91.867805, "country": "US", "region": "Gulf"},
    "Maine": {"code": "ME", "lat": 44.693947, "lng": -69.381927, "country": "US", "region": "Atlantic"},
    "Maryland": {"code": "MD", "lat": 39.063946, "lng": -76.802101, "country": "US", "region": "Atlantic"},
    "Massachusetts": {"code": "MA", "lat": 42.230171, "lng": -71.530106, "country": "US", "region": "Atlantic"},
    "Michigan": {"code": "MI", "lat": 43.326618, "lng": -84.536095, "country": "US", "region": "Interior"},
    "Minnesota": {"code": "MN", "lat": 45.694454, "lng": -93.900192, "country": "US", "region": "Interior"},
    "Mississippi": {"code": "MS", "lat": 32.741646, "lng": -89.678696, "country": "US", "region": "Gulf"},
    "Missouri": {"code": "MO", "lat": 38.456085, "lng": -92.288368, "country": "US", "region": "Interior"},
    "Montana": {"code": "MT", "lat": 46.921925, "lng": -110.454353, "country": "US", "region": "Pacific"},
    "Nebraska": {"code": "NE", "lat": 41.125370, "lng": -98.268082, "country": "US", "region": "Interior"},
    "Nevada": {"code": "NV", "lat": 38.313515, "lng": -117.055374, "country": "US", "region": "Pacific"},
    "New Hampshire": {"code": "NH", "lat": 43.452492, "lng": -71.563896, "country": "US", "region": "Atlantic"},
    "New Jersey": {"code": "NJ", "lat": 40.298904, "lng": -74.521011, "country": "US", "region": "Atlantic"},
    "New Mexico": {"code": "NM", "lat": 34.840515, "lng": -106.248482, "country": "US", "region": "Pacific"},
    "New York": {"code": "NY", "lat": 42.165726, "lng": -74.948051, "country": "US", "region": "Atlantic"},
    "North Carolina": {"code": "NC", "lat": 35.630066, "lng": -79.806419, "country": "US", "region": "Atlantic"},
    "North Dakota": {"code": "ND", "lat": 47.528912, "lng": -99.784012, "country": "US", "region": "Interior"},
    "Ohio": {"code": "OH", "lat": 40.388783, "lng": -82.764915, "country": "US", "region": "Interior"},
    "Oklahoma": {"code": "OK", "lat": 35.565342, "lng": -96.928917, "country": "US", "region": "Interior"},
    "Oregon": {"code": "OR", "lat": 44.572021, "lng": -122.070938, "country": "US", "region": "Pacific"},
    "Pennsylvania": {"code": "PA", "lat": 40.590752, "lng": -77.209755, "country": "US", "region": "Atlantic"},
    "Rhode Island": {"code": "RI", "lat": 41.680893, "lng": -71.511780, "country": "US", "region": "Atlantic"},
    "South Carolina": {"code": "SC", "lat": 33.856892, "lng": -80.945007, "country": "US", "region": "Atlantic"},
    "South Dakota": {"code": "SD", "lat": 44.299782, "lng": -99.438828, "country": "US", "region": "Interior"},
    "Tennessee": {"code": "TN", "lat": 35.747845, "lng": -86.692345, "country": "US", "region": "Gulf"},
    "Texas": {"code": "TX", "lat": 31.054487, "lng": -97.563461, "country": "US", "region": "Gulf"},
    "Utah": {"code": "UT", "lat": 40.150032, "lng": -111.862434, "country": "US", "region": "Pacific"},
    "Vermont": {"code": "VT", "lat": 44.045876, "lng": -72.710686, "country": "US", "region": "Atlantic"},
    "Virginia": {"code": "VA", "lat": 37.769337, "lng": -78.169968, "country": "US", "region": "Atlantic"},
    "Washington": {"code": "WA", "lat": 47.400902, "lng": -121.490494, "country": "US", "region": "Pacific"},
    "West Virginia": {"code": "WV", "lat": 38.491226, "lng": -80.954453, "country": "US", "region": "Atlantic"},
    "Wisconsin": {"code": "WI", "lat": 44.268543, "lng": -89.616508, "country": "US", "region": "Interior"},
    "Wyoming": {"code": "WY", "lat": 42.755966, "lng": -107.302490, "country": "US", "region": "Interior"},
    # Canadian Provinces
    "Alberta": {"code": "AB", "lat": 53.933271, "lng": -116.576504, "country": "CA", "region": "Pacific"},
    "British Columbia": {"code": "BC", "lat": 53.726668, "lng": -127.647621, "country": "CA", "region": "Pacific"},
    "Manitoba": {"code": "MB", "lat": 53.760861, "lng": -98.813876, "country": "CA", "region": "Interior"},
    "New Brunswick": {"code": "NB", "lat": 46.565316, "lng": -66.461916, "country": "CA", "region": "Atlantic"},
    "Newfoundland and Labrador": {"code": "NL", "lat": 53.135509, "lng": -57.660436, "country": "CA", "region": "Atlantic"},
    "Nova Scotia": {"code": "NS", "lat": 44.681987, "lng": -63.744311, "country": "CA", "region": "Atlantic"},
    "Ontario": {"code": "ON", "lat": 51.253775, "lng": -85.323214, "country": "CA", "region": "Atlantic"},
    "Prince Edward Island": {"code": "PE", "lat": 46.510712, "lng": -63.416814, "country": "CA", "region": "Atlantic"},
    "Quebec": {"code": "QC", "lat": 52.939916, "lng": -73.549136, "country": "CA", "region": "Atlantic"},
    "Saskatchewan": {"code": "SK", "lat": 52.939916, "lng": -106.450864, "country": "CA", "region": "Interior"}
}


def normalize_product_name(product_name: str) -> str:
    """
    Safely normalize product name for robust mapping:
    converts to lower case, removes multiple spaces, normalizes hyphens.
    """
    if not product_name or not isinstance(product_name, str):
        return ""
    # Replace multiple hyphens or dash variations
    clean = product_name.strip().lower()
    # Normalize spaces around dashes (e.g. 'Wonka Bar -Scrumdiddlyumptious' -> 'wonka bar - scrumdiddlyumptious')
    clean = clean.replace(" -", " - ").replace("- ", " - ")
    # Replace multiple spaces with a single space
    clean = " ".join(clean.split())
    # Handle the specific hyphen spacing in Scrumdiddlyumptious
    clean = clean.replace("wonka bar - scrumdiddlyumptious", "wonka bar - scrumdiddlyumptious")
    return clean


def map_product_to_factory(product_name: str) -> str:
    """
    Map product name to origin manufacturing facility with fallback.
    """
    norm = normalize_product_name(product_name)
    # Direct match
    if norm in PRODUCT_TO_FACTORY_RULES:
        return PRODUCT_TO_FACTORY_RULES[norm]
    
    # Fuzzy keyword matching for resilient mapping
    if "nutty" in norm or "fudge" in norm or "scrum" in norm:
        return "Lot's O' Nuts"
    if "milk chocolate" in norm or "dazzle" in norm or "caramel" in norm:
        return "Wicked Choccy's"
    if "taffy" in norm or "sweetarts" in norm or "nerds" in norm or "fun dip" in norm or "fizzy" in norm:
        return "Sugar Shack"
    if "gobstopper" in norm or "wallpaper" in norm or "gum" in norm:
        return "Secret Factory"
    if "toffee" in norm or "kazookles" in norm:
        return "The Other Factory"

    return "Unknown Factory"


def calculate_distance_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points in miles using Haversine formula.
    """
    R = 3958.8  # Earth radius in miles
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)


def get_route_details(factory_name: str, destination_state: str) -> Dict[str, Any]:
    """
    Compute route metadata including origin/destination coordinates and straight-line distance.
    """
    factory = FACTORIES.get(factory_name)
    state = STATE_COORDINATES.get(destination_state)

    if not factory or not state:
        return {
            "route_id": f"{factory_name} -> {destination_state}",
            "factory_name": factory_name,
            "destination_state": destination_state,
            "distance_miles": None,
            "origin_lat": factory["latitude"] if factory else None,
            "origin_lng": factory["longitude"] if factory else None,
            "dest_lat": state["lat"] if state else None,
            "dest_lng": state["lng"] if state else None
        }

    dist = calculate_distance_miles(factory["latitude"], factory["longitude"], state["lat"], state["lng"])
    return {
        "route_id": f"{factory_name} -> {destination_state}",
        "factory_name": factory_name,
        "destination_state": destination_state,
        "distance_miles": dist,
        "origin_lat": factory["latitude"],
        "origin_lng": factory["longitude"],
        "dest_lat": state["lat"],
        "dest_lng": state["lng"]
    }
