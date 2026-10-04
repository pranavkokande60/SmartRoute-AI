"""
SmartRoute-AI SQLAlchemy Models
===============================
Module: backend/app/models.py
Author: Antigravity AI Engineering Team

Database schemas for Users, Routes, Shipments, Alerts, and Audit Logs.
Designed with clear, student-friendly relationships and explainable table structures.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class User(Base):
    """User account model for JWT Authentication and Role-Based Access Control."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="Viewer", nullable=False)  # Admin, Analyst, Manager, Viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Route(Base):
    """Aggregated route intelligence record (Factory -> Customer State)."""
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(String(100), unique=True, index=True, nullable=False)
    factory_name = Column(String(50), index=True, nullable=False)
    destination_state = Column(String(50), index=True, nullable=False)
    country = Column(String(50), default="United States")
    region = Column(String(50), index=True)
    distance_miles = Column(Float)
    
    # Performance Metrics
    shipments_count = Column(Integer, default=0)
    orders_count = Column(Integer, default=0)
    total_units = Column(Integer, default=0)
    avg_lead_time = Column(Float, default=0.0)
    median_lead_time = Column(Float, default=0.0)
    min_lead_time = Column(Integer, default=0)
    max_lead_time = Column(Integer, default=0)
    std_lead_time = Column(Float, default=0.0)
    raw_avg_lead_time = Column(Float, default=0.0)
    delay_count = Column(Integer, default=0)
    delay_rate = Column(Float, default=0.0)
    
    # 0-100 Transparent Efficiency Score
    efficiency_score = Column(Float, default=0.0)
    comp_lead_time = Column(Float, default=0.0)
    comp_delay_rate = Column(Float, default=0.0)
    comp_variability = Column(Float, default=0.0)
    performance_tier = Column(String(30), default="Moderate Performance")
    is_bottleneck = Column(Boolean, default=False)
    
    # Geospatial Coordinates
    origin_lat = Column(Float)
    origin_lng = Column(Float)
    dest_lat = Column(Float)
    dest_lng = Column(Float)
    
    # Financials
    total_sales = Column(Float, default=0.0)
    avg_sales = Column(Float, default=0.0)
    total_profit = Column(Float, default=0.0)
    avg_profit = Column(Float, default=0.0)


class Shipment(Base):
    """Granular shipment records populated from Nassau Candy Distributor dataset."""
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    row_id = Column(Integer, unique=True, index=True)
    order_id = Column(String(100), index=True)
    customer_id = Column(Integer, index=True)
    order_date = Column(String(20), index=True)
    ship_date = Column(String(20))
    ship_mode = Column(String(30), index=True)
    
    # Product & Division
    product_id = Column(String(50))
    product_name = Column(String(100), index=True)
    division = Column(String(50), index=True)
    factory_name = Column(String(50), index=True)
    
    # Geography
    country_region = Column(String(50))
    city = Column(String(100))
    state_province = Column(String(50), index=True)
    postal_code = Column(String(20))
    region = Column(String(50), index=True)
    route_id = Column(String(100), index=True)
    route_distance_miles = Column(Float)
    
    # Financials & Quantities
    sales = Column(Float)
    units = Column(Integer)
    gross_profit = Column(Float)
    cost = Column(Float)
    unit_price = Column(Float)
    unit_cost = Column(Float)
    unit_profit = Column(Float)
    gross_margin_pct = Column(Float)
    
    # Lead Times
    raw_lead_time_days = Column(Integer)
    operational_lead_time_days = Column(Integer)
    is_delayed = Column(Boolean, default=False)
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0)


class Alert(Base):
    """System-generated alerts for route bottlenecks, delay spikes, and anomalies."""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="INFO")  # CRITICAL, WARNING, INFO
    alert_type = Column(String(50), default="ROUTE_RISK")  # BOTTLENECK, DELAY_SPIKE, ANOMALY, VOLUME_SPIKE
    route_id = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class AuditLog(Base):
    """Simple audit logging for compliance and user activity tracking."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class NewOrder(Base):
    """
    Customer orders entered through the New Order Management module.
    Logically separated from historical training shipments.
    """
    __tablename__ = "new_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(100), unique=True, index=True, nullable=False)
    order_date = Column(String(20), index=True, nullable=False)
    customer_id = Column(Integer, index=True, nullable=False)
    customer_name = Column(String(100), nullable=True)
    customer_email = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    # Product
    product_name = Column(String(100), index=True, nullable=False)
    division = Column(String(50), nullable=False)
    units = Column(Integer, nullable=False)
    estimated_sales = Column(Float, default=0.0)

    # Automatic Factory & Origin
    factory_name = Column(String(50), index=True, nullable=False)
    factory_city = Column(String(100), nullable=True)
    factory_state = Column(String(50), nullable=True)
    origin_lat = Column(Float, nullable=True)
    origin_lng = Column(Float, nullable=True)

    # Destination
    country_region = Column(String(50), default="United States")
    city = Column(String(100), nullable=False)
    state_province = Column(String(50), index=True, nullable=False)
    postal_code = Column(String(20), nullable=False)
    region = Column(String(50), nullable=True)
    dest_lat = Column(Float, nullable=True)
    dest_lng = Column(Float, nullable=True)

    # Route & Shipping
    route_id = Column(String(100), index=True)
    route_distance_miles = Column(Float, nullable=True)
    ship_mode = Column(String(30), index=True, nullable=False)

    # AI Predictions (from existing ML system)
    predicted_lead_time_days = Column(Float, nullable=True)
    expected_range_days = Column(String(30), nullable=True)
    delay_risk = Column(String(30), nullable=True)  # Low Risk, Moderate Risk, High Risk
    delay_probability_pct = Column(Float, nullable=True)
    ai_risk_factors = Column(Text, nullable=True)  # JSON serialized feature drivers
    recommendation = Column(String(255), nullable=True)

    # Actual Delivery Outcomes (for Prediction vs Actual Evaluation)
    actual_delivery_date = Column(String(20), nullable=True)
    actual_lead_time_days = Column(Integer, nullable=True)
    actual_is_delayed = Column(Boolean, nullable=True)
    prediction_error_days = Column(Float, nullable=True)  # predicted - actual
    absolute_error_days = Column(Float, nullable=True)    # |predicted - actual|
    evaluated_at = Column(DateTime, nullable=True)

    # Order Lifecycle Status: NEW, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    status = Column(String(30), default="NEW", index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(Base):
    """System-generated and event-driven notifications for logistics operations."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)  # None for broadcast
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="INFO")  # CRITICAL, WARNING, INFO, SUCCESS
    category = Column(String(50), default="SYSTEM")  # ORDER, ROUTE, MODEL, ANOMALY, QUALITY
    related_entity_type = Column(String(50), nullable=True)  # order, route, model
    related_entity_id = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class ModelMetricHistory(Base):
    """Historical evaluation snapshots and model monitoring records."""
    __tablename__ = "model_monitoring"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False, index=True)
    version = Column(String(50), default="v1.0.0")
    dataset_version = Column(String(50), default="Nassau Candy 2021-2024")
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    evaluated_samples_count = Column(Integer, default=0)
    status = Column(String(30), default="HEALTHY")  # HEALTHY, WARNING, DEGRADED
    degradation_warning = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
