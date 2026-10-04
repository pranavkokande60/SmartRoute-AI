"""
SmartRoute-AI Pydantic Schemas
==============================
Module: backend/app/schemas.py
Author: Antigravity AI Engineering Team

Pydantic validation schemas for API inputs, outputs, predictions, and analytics.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, EmailStr, Field


# -----------------------------
# Auth Schemas
# -----------------------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# -----------------------------
# Dashboard & KPI Schemas
# -----------------------------
class DashboardKPISummary(BaseModel):
    total_shipments: int
    total_orders: int
    total_volume_units: int
    total_revenue_sales: float
    total_gross_profit: float
    avg_operational_lead_time_days: float
    raw_dataset_lead_time_days: float
    delay_rate_pct: float
    avg_route_efficiency_score: float
    active_alerts_count: int
    high_risk_routes_count: int
    bottlenecks_count: int
    total_anomalies_count: int


# -----------------------------
# Route Schemas
# -----------------------------
class RouteSummary(BaseModel):
    route_id: str
    factory_name: str
    destination_state: str
    country: str
    region: Optional[str]
    distance_miles: Optional[float]
    shipments_count: int
    avg_lead_time: float
    median_lead_time: float
    min_lead_time: int
    max_lead_time: int
    std_lead_time: float
    raw_avg_lead_time: float
    delay_rate: float
    delay_percentage: float
    efficiency_score: float
    comp_lead_time: float
    comp_delay_rate: float
    comp_variability: float
    performance_tier: str
    is_bottleneck: bool
    origin_lat: Optional[float]
    origin_lng: Optional[float]
    dest_lat: Optional[float]
    dest_lng: Optional[float]
    total_sales: float
    total_profit: float


# -----------------------------
# Factory & State Schemas
# -----------------------------
class FactorySummary(BaseModel):
    name: str
    id: str
    city: str
    state: str
    latitude: float
    longitude: float
    specialization: str
    capacity_units_day: int
    total_shipments: int
    total_units: int
    total_sales: float
    total_profit: float
    avg_operational_lead_time: float
    delay_rate_pct: float
    active_routes_count: int
    products: List[str]


# -----------------------------
# ML Prediction Schemas
# -----------------------------
class PredictionRequest(BaseModel):
    factory_name: str = Field(..., example="Wicked Choccy's")
    State_Province: str = Field(..., alias="State/Province", example="California")
    Region: str = Field(..., example="Pacific")
    Ship_Mode: str = Field(..., alias="Ship Mode", example="Standard Class")
    Division: str = Field(..., example="Chocolate")
    Product_Name: str = Field(..., alias="Product Name", example="Wonka Bar - Milk Chocolate")
    Units: int = Field(5, example=5)
    Sales: float = Field(16.25, example=16.25)
    route_distance_miles: Optional[float] = Field(2211.0, example=2211.0)
    order_month: int = Field(6, example=6)
    unit_price: Optional[float] = Field(3.25, example=3.25)

    class Config:
        populate_by_name = True


class DelayPredictionResponse(BaseModel):
    is_delayed: bool
    delay_probability: float
    delay_percentage: float
    risk_level: str


class ETAPredictionResponse(BaseModel):
    predicted_lead_time_days: float
    expected_range_days: str
    expected_min: int
    expected_max: int


class PredictionResponse(BaseModel):
    delay_prediction: DelayPredictionResponse
    eta_prediction: ETAPredictionResponse
    explainability: Dict[str, Any]


# -----------------------------
# What-If Simulation Schema
# -----------------------------
class SimulationRequest(BaseModel):
    factory_name: str
    destination_state: str
    current_ship_mode: str = "Standard Class"
    target_ship_mode: str = "First Class"
    product_name: str
    units: int = 5


class SimulationScenarioResult(BaseModel):
    scenario_name: str
    ship_mode: str
    predicted_lead_time_days: float
    delay_probability_pct: float
    risk_level: str
    estimated_sales: float
    estimated_cost: float
    estimated_profit: float


class SimulationResponse(BaseModel):
    route_id: str
    distance_miles: Optional[float]
    current_scenario: SimulationScenarioResult
    alternative_scenario: SimulationScenarioResult
    lead_time_reduction_days: float
    delay_risk_reduction_pct: float
    executive_recommendation: str


# -----------------------------
# New Order Management Schemas
# -----------------------------
class NewOrderCreate(BaseModel):
    order_id: Optional[str] = None
    order_date: Optional[str] = None
    customer_id: int
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    notes: Optional[str] = None
    product_name: str
    units: int = Field(..., ge=1)
    country_region: Optional[str] = "United States"
    city: str
    state_province: str
    postal_code: str
    ship_mode: str = "Standard Class"


class NewOrderUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None


class NewOrderResponse(BaseModel):
    id: int
    order_id: str
    order_date: str
    customer_id: int
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    notes: Optional[str] = None
    product_name: str
    division: str
    units: int
    estimated_sales: float
    factory_name: str
    factory_city: Optional[str] = None
    factory_state: Optional[str] = None
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    country_region: str
    city: str
    state_province: str
    postal_code: str
    region: Optional[str] = None
    dest_lat: Optional[float] = None
    dest_lng: Optional[float] = None
    route_id: Optional[str] = None
    route_distance_miles: Optional[float] = None
    ship_mode: str
    predicted_lead_time_days: Optional[float] = None
    expected_range_days: Optional[str] = None
    delay_risk: Optional[str] = None
    delay_probability_pct: Optional[float] = None
    ai_risk_factors: Optional[str] = None
    recommendation: Optional[str] = None
    # Actual Outcomes
    actual_delivery_date: Optional[str] = None
    actual_lead_time_days: Optional[int] = None
    actual_is_delayed: Optional[bool] = None
    prediction_error_days: Optional[float] = None
    absolute_error_days: Optional[float] = None
    evaluated_at: Optional[Any] = None
    status: str
    created_at: Any
    updated_at: Any

    class Config:
        from_attributes = True


class NewOrdersSummaryResponse(BaseModel):
    total_new_orders: int
    pending_orders: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int


# -----------------------------
# Prediction vs Actual Schemas
# -----------------------------
class PredictionEvaluationRequest(BaseModel):
    actual_delivery_date: Optional[str] = None
    actual_lead_time_days: int = Field(..., ge=0)
    notes: Optional[str] = None


class PredictionPerformanceResponse(BaseModel):
    total_evaluated_orders: int
    total_awaiting_orders: int
    mae: float
    rmse: float
    avg_prediction_error: float
    lead_time_accuracy_pct: float
    precision: float
    recall: float
    f1_score: float
    classification_accuracy: float
    confusion_matrix: Dict[str, int]
    evaluated_orders: List[Dict[str, Any]]
    awaiting_orders: List[Dict[str, Any]]


# -----------------------------
# Model Monitoring Schemas
# -----------------------------
class ModelDetailStatus(BaseModel):
    model_id: str
    model_name: str
    model_type: str
    version: str
    training_date: str
    dataset_version: str
    status: str
    degradation_warning: Optional[str] = None
    total_predictions_served: int
    evaluated_samples_count: int
    last_evaluation_date: Optional[str] = None
    baseline_metrics: Dict[str, Any]
    current_metrics: Dict[str, Any]
    drift_indicators: Dict[str, Any]


class ModelMonitoringOverviewResponse(BaseModel):
    system_status: str
    total_models_monitored: int
    evaluated_outcomes_count: int
    last_system_evaluation: Optional[str] = None
    thresholds: Dict[str, Any]
    models: List[ModelDetailStatus]


# -----------------------------
# Prediction Playground Schemas
# -----------------------------
class PlaygroundPredictionRequest(BaseModel):
    product_name: str
    units: int = Field(..., ge=1, le=100)
    state_province: str
    ship_mode: str = "Standard Class"
    region: Optional[str] = None
    order_date: Optional[str] = None
    factory_name: Optional[str] = None


class PlaygroundPredictionResponse(BaseModel):
    estimated_lead_time_days: float
    expected_range_days: str
    delay_risk: str
    delay_probability_pct: float
    confidence_score_pct: float
    is_delayed_expected: bool
    factory_name: str
    route_id: str
    route_distance_miles: float
    destination: str
    disclaimer: str = "AI Prediction — Not an Actual Shipment"
    explanation_factors: List[Dict[str, Any]]


# -----------------------------
# Route Comparison Schemas
# -----------------------------
class RouteComparisonRequest(BaseModel):
    route_ids: List[str] = Field(..., min_items=2, max_items=6)


class RouteDetailComparison(BaseModel):
    route_id: str
    factory_name: str
    destination_state: str
    region: Optional[str] = None
    distance_miles: float
    avg_lead_time: float
    median_lead_time: float
    std_lead_time: float
    delay_rate_pct: float
    delay_count: int
    shipments_count: int
    efficiency_score: float
    performance_tier: str
    is_bottleneck: bool
    preferred_ship_mode: str
    most_frequent_delay_reason: str
    score_breakdown: Dict[str, float]


class RouteComparisonResponse(BaseModel):
    routes: List[RouteDetailComparison]
    best_performing_route_id: Optional[str] = None
    fastest_route_id: Optional[str] = None
    most_reliable_route_id: Optional[str] = None
    insights: List[str]
    summary_verdict: str


# -----------------------------
# Notification Center Schemas
# -----------------------------
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    category: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None
    is_read: bool
    created_at: Any

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total_count: int
    unread_count: int
    critical_count: int
    warning_count: int


# -----------------------------
# Global Search & Command Palette
# -----------------------------
class SearchResultItem(BaseModel):
    id: str
    title: str
    category: str  # MODULE, ORDER, ROUTE, FACTORY, STATE, PRODUCT
    subtitle: str
    target_tab: str
    badge: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class GlobalSearchResponse(BaseModel):
    query: str
    total_count: int
    results: List[SearchResultItem]


# -----------------------------
# AI Logistics Assistant Schemas
# -----------------------------
class AssistantQueryRequest(BaseModel):
    query: str


class AssistantQueryResponse(BaseModel):
    query: str
    answer: str
    source_metric: Optional[str] = None
    data_points: Optional[Dict[str, Any]] = None
    suggested_followups: List[str]






