"""
SmartRoute-AI Test Suite
========================
Tests verifying data preprocessing, factory mapping, route analytics,
lead-time calculations, ML predictions, and API integrity.
"""

import os
import sys
# Ensure workspace root is in python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.factory_mapping import map_product_to_factory, FACTORIES, calculate_distance_miles
from src.route_analytics import compute_efficiency_score
from src.ml_models import ml_manager
from backend.app.auth import get_password_hash, verify_password, create_access_token


def test_factory_mapping():
    """Verify that all candy product lines map to the correct factories."""
    assert map_product_to_factory("Wonka Bar - Milk Chocolate") == "Wicked Choccy's"
    assert map_product_to_factory("Wonka Bar - Triple Dazzle Caramel") == "Wicked Choccy's"
    assert map_product_to_factory("Wonka Bar - Nutty Crunch Surprise") == "Lot's O' Nuts"
    assert map_product_to_factory("Wonka Bar - Fudge Mallows") == "Lot's O' Nuts"
    assert map_product_to_factory("Wonka Bar -Scrumdiddlyumptious") == "Lot's O' Nuts"
    assert map_product_to_factory("Laffy Taffy") == "Sugar Shack"
    assert map_product_to_factory("SweeTARTS") == "Sugar Shack"
    assert map_product_to_factory("Everlasting Gobstopper") == "Secret Factory"
    assert map_product_to_factory("Kazookles") == "The Other Factory"


def test_haversine_distance():
    """Verify distance calculation between coordinates."""
    # Wicked Choccy's (Savannah, GA: 32.076, -81.088) to California (~36.116, -119.681)
    dist = calculate_distance_miles(32.076176, -81.088371, 36.116203, -119.681564)
    assert 2100 < dist < 2300, f"Distance {dist} out of expected range"


def test_efficiency_score_calculation():
    """Verify that efficiency score is bounded between 0 and 100 with correct weighting."""
    # Perfect route: 1 day avg lead time, 0% delay, 0 std dev
    perfect = compute_efficiency_score(1.0, 0.0, 0.0)
    assert perfect["efficiency_score"] == 100.0
    assert perfect["comp_lead_time"] == 100.0
    assert perfect["comp_delay_rate"] == 100.0
    assert perfect["comp_variability"] == 100.0

    # Poor route: 6 days avg lead time, 50% delay, 2.0 std dev
    poor = compute_efficiency_score(6.0, 0.50, 2.0)
    assert 0 <= poor["efficiency_score"] <= 100.0
    assert poor["efficiency_score"] < 50.0


def test_password_hashing():
    """Verify password hashing and verification."""
    raw = "SecurePassword123!"
    h = get_password_hash(raw)
    assert verify_password(raw, h) is True
    assert verify_password("WrongPassword", h) is False


def test_ml_prediction_inference():
    """Verify that ML manager runs inference without errors and returns expected schema."""
    pred = ml_manager.predict_shipment({
        "factory_name": "Lot's O' Nuts",
        "State/Province": "Texas",
        "Region": "Gulf",
        "Ship Mode": "Standard Class",
        "Division": "Chocolate",
        "Product Name": "Wonka Bar - Fudge Mallows",
        "Units": 3,
        "Sales": 10.8,
        "route_distance_miles": 850.0,
        "order_month": 5,
        "unit_price": 3.6
    })
    assert "delay_prediction" in pred
    assert "eta_prediction" in pred
    assert "explainability" in pred
    assert 0 <= pred["delay_prediction"]["delay_probability"] <= 1.0
    assert 0 < pred["eta_prediction"]["predicted_lead_time_days"] < 15.0


if __name__ == "__main__":
    print("Running SmartRoute AI test assertions...")
    test_factory_mapping()
    test_haversine_distance()
    test_efficiency_score_calculation()
    test_password_hashing()
    test_ml_prediction_inference()
    print("ALL TESTS PASSED SUCCESSFULLY! (5/5)")
