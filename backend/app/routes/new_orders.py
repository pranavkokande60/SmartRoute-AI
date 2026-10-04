"""
SmartRoute-AI New Order Management Router
=========================================
Module: backend/app/routes/new_orders.py
Author: Antigravity AI Engineering Team

Handles real-time customer order entry, automatic factory and route assignment,
and automated ML ETA/Delay predictions, logically separated from historical shipments.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import random
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc

from backend.app.database import get_db
from backend.app.models import NewOrder, Route
from backend.app.schemas import (
    NewOrderCreate, NewOrderUpdate, NewOrderResponse, NewOrdersSummaryResponse
)
from src.factory_mapping import (
    FACTORIES, STATE_COORDINATES, map_product_to_factory, calculate_distance_miles
)
from src.ml_models import ml_manager

new_orders_router = APIRouter(prefix="/new-orders", tags=["New Order Management"])

# Product Division Reference Map
PRODUCT_DIVISIONS: Dict[str, str] = {
    "Wonka Bar - Nutty Crunch Surprise": "Chocolate",
    "Wonka Bar - Fudge Mallows": "Chocolate",
    "Wonka Bar - Scrumdiddlyumptious": "Chocolate",
    "Wonka Bar - Milk Chocolate": "Chocolate",
    "Wonka Bar - Triple Dazzle Caramel": "Chocolate",
    "Laffy Taffy": "Sugar",
    "SweeTARTS": "Sugar",
    "Nerds": "Sugar",
    "Fun Dip": "Sugar",
    "Everlasting Gobstopper": "Sugar",
    "Hair Toffee": "Sugar",
    "Fizzy Lifting Drinks": "Other",
    "Lickable Wallpaper": "Other",
    "Wonka Gum": "Other",
    "Kazookles": "Other"
}


@new_orders_router.get("/reference-data")
def get_order_reference_data():
    """
    Returns reference lists for dropdowns:
    products with their pre-mapped factory and division, US states, and ship modes.
    """
    products_list = []
    for prod_name, division in PRODUCT_DIVISIONS.items():
        factory = map_product_to_factory(prod_name)
        f_meta = FACTORIES.get(factory, {})
        products_list.append({
            "product_name": prod_name,
            "division": division,
            "factory_name": factory,
            "factory_city": f_meta.get("city"),
            "factory_state": f_meta.get("state"),
            "factory_specialization": f_meta.get("specialization")
        })

    states_list = [
        {"state_name": s_name, "code": s_meta["code"], "region": s_meta["region"]}
        for s_name, s_meta in sorted(STATE_COORDINATES.items())
    ]

    return {
        "products": products_list,
        "states": states_list,
        "ship_modes": ["Standard Class", "Second Class", "First Class", "Same Day"]
    }


@new_orders_router.get("/summary", response_model=NewOrdersSummaryResponse)
def get_new_orders_summary(db: Session = Depends(get_db)):
    """KPI summary cards for newly entered orders dashboard."""
    total = db.query(NewOrder).count()
    pending = db.query(NewOrder).filter(NewOrder.status.in_(["NEW", "PROCESSING"])).count()
    low_risk = db.query(NewOrder).filter(NewOrder.delay_risk == "Low Risk").count()
    med_risk = db.query(NewOrder).filter(NewOrder.delay_risk == "Moderate Risk").count()
    high_risk = db.query(NewOrder).filter(NewOrder.delay_risk == "High Risk").count()

    return {
        "total_new_orders": total,
        "pending_orders": pending,
        "low_risk_count": low_risk,
        "medium_risk_count": med_risk,
        "high_risk_count": high_risk
    }


@new_orders_router.get("", response_model=List[NewOrderResponse])
def get_all_new_orders(
    search: Optional[str] = None,
    status: Optional[str] = None,
    delay_risk: Optional[str] = None,
    factory: Optional[str] = None,
    ship_mode: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve all newly entered orders with search, filtering, and sorting."""
    query = db.query(NewOrder)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (NewOrder.order_id.ilike(pattern)) |
            (NewOrder.customer_name.ilike(pattern)) |
            (NewOrder.city.ilike(pattern)) |
            (NewOrder.product_name.ilike(pattern))
        )

    if status and status != "ALL":
        query = query.filter(NewOrder.status == status)

    if delay_risk and delay_risk != "ALL":
        query = query.filter(NewOrder.delay_risk == delay_risk)

    if factory and factory != "ALL":
        query = query.filter(NewOrder.factory_name == factory)

    if ship_mode and ship_mode != "ALL":
        query = query.filter(NewOrder.ship_mode == ship_mode)

    return query.order_by(desc(NewOrder.id)).all()


@new_orders_router.post("", response_model=NewOrderResponse, status_code=status.HTTP_201_CREATED)
def create_new_order(order_in: NewOrderCreate, db: Session = Depends(get_db)):
    """
    Enter a new customer order.
    1. Automatically maps product to its manufacturing facility (no manual selection).
    2. Automatically builds origin-to-destination route and computes distance.
    3. Triggers ML ETA Regressor and Delay Classifier to calculate predictions.
    4. Persists the order into the new_orders database table.
    """
    # 1. Automatic Factory Resolution
    factory_name = map_product_to_factory(order_in.product_name)
    if factory_name == "Unknown Factory" or factory_name not in FACTORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Product '{order_in.product_name}' is not recognized in factory catalog."
        )

    f_meta = FACTORIES[factory_name]
    division = PRODUCT_DIVISIONS.get(order_in.product_name, "Chocolate")

    # 2. Destination State Resolution
    state_meta = STATE_COORDINATES.get(order_in.state_province)
    dest_lat = state_meta["lat"] if state_meta else None
    dest_lng = state_meta["lng"] if state_meta else None
    region = state_meta["region"] if state_meta else "Pacific"

    # 3. Route & Distance Calculation
    route_id = f"{factory_name} -> {order_in.state_province}"
    distance_miles = None
    if dest_lat and dest_lng:
        distance_miles = calculate_distance_miles(
            f_meta["latitude"], f_meta["longitude"], dest_lat, dest_lng
        )

    # 4. Generate Order ID and Dates if not provided
    order_id = order_in.order_id
    if not order_id:
        random_suffix = random.randint(10000, 99999)
        order_id = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{random_suffix}"

    # Check for duplicate Order ID
    existing = db.query(NewOrder).filter(NewOrder.order_id == order_id).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Order ID '{order_id}' already exists.")

    order_date = order_in.order_date or datetime.utcnow().strftime("%Y-%m-%d")
    estimated_sales = round(order_in.units * 3.50, 2)

    # 5. ML Predictive Inference (ETA + Delay Risk)
    month_num = 6
    try:
        month_num = datetime.strptime(order_date, "%Y-%m-%d").month
    except Exception:
        month_num = 6

    ml_input = {
        "factory_name": factory_name,
        "State/Province": order_in.state_province,
        "Region": region,
        "Ship Mode": order_in.ship_mode,
        "Division": division,
        "Product Name": order_in.product_name,
        "Units": order_in.units,
        "Sales": estimated_sales,
        "route_distance_miles": distance_miles or 850.0,
        "order_month": month_num,
        "unit_price": 3.50
    }

    pred = ml_manager.predict_shipment(ml_input)

    pred_eta = pred.get("predicted_eta_days", 4.0)
    expected_range = pred.get("expected_range_days", "3-5 days")
    delay_risk = pred.get("risk_level", "Moderate Risk")
    delay_prob = round(pred.get("delay_probability", 0.3) * 100, 1)
    risk_factors = json.dumps(pred.get("top_risk_factors", []))
    recommendation = pred.get("carrier_mode_recommendation")

    # 6. Save in database
    new_order = NewOrder(
        order_id=order_id,
        order_date=order_date,
        customer_id=order_in.customer_id,
        customer_name=order_in.customer_name,
        customer_email=order_in.customer_email,
        notes=order_in.notes,
        product_name=order_in.product_name,
        division=division,
        units=order_in.units,
        estimated_sales=estimated_sales,
        factory_name=factory_name,
        factory_city=f_meta["city"],
        factory_state=f_meta["state"],
        origin_lat=f_meta["latitude"],
        origin_lng=f_meta["longitude"],
        country_region=order_in.country_region or "United States",
        city=order_in.city,
        state_province=order_in.state_province,
        postal_code=order_in.postal_code,
        region=region,
        dest_lat=dest_lat,
        dest_lng=dest_lng,
        route_id=route_id,
        route_distance_miles=distance_miles,
        ship_mode=order_in.ship_mode,
        predicted_lead_time_days=pred_eta,
        expected_range_days=expected_range,
        delay_risk=delay_risk,
        delay_probability_pct=delay_prob,
        ai_risk_factors=risk_factors,
        recommendation=recommendation,
        status="NEW"
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order


@new_orders_router.get("/{order_id}", response_model=NewOrderResponse)
def get_new_order_detail(order_id: int, db: Session = Depends(get_db)):
    """Fetch complete details of a single new order by primary key ID."""
    order = db.query(NewOrder).filter(NewOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order with ID {order_id} not found.")
    return order


@new_orders_router.put("/{order_id}", response_model=NewOrderResponse)
def update_new_order(order_id: int, update_data: NewOrderUpdate, db: Session = Depends(get_db)):
    """Update order status (NEW, PROCESSING, SHIPPED, DELIVERED, CANCELLED) or notes."""
    order = db.query(NewOrder).filter(NewOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order with ID {order_id} not found.")

    if update_data.status:
        valid_statuses = ["NEW", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
        if update_data.status.upper() not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status '{update_data.status}'. Must be one of: {valid_statuses}"
            )
        order.status = update_data.status.upper()

    if update_data.notes is not None:
        order.notes = update_data.notes

    if update_data.customer_name is not None:
        order.customer_name = update_data.customer_name

    if update_data.customer_email is not None:
        order.customer_email = update_data.customer_email

    db.commit()
    db.refresh(order)
    return order


@new_orders_router.delete("/{order_id}")
def delete_new_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an entered order."""
    order = db.query(NewOrder).filter(NewOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order with ID {order_id} not found.")

    db.delete(order)
    db.commit()
    return {"success": True, "message": f"Order {order.order_id} successfully deleted."}
