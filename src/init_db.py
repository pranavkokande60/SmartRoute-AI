"""
SmartRoute-AI Database Seeder and Initialization
================================================
Module: src/init_db.py
Author: Antigravity AI Engineering Team

Initializes database tables, creates demo user accounts with secure password hashing,
and loads the processed dataset and route metrics into SQLite/PostgreSQL.
"""

import os
import sys
import logging
import pandas as pd
from passlib.context import CryptContext

# Set up paths
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app.database import engine, Base, SessionLocal
from backend.app.models import User, Route, Shipment, Alert, AuditLog
from src.route_analytics import analyze_routes, detect_bottlenecks

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SmartRoute.InitDB")

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def init_database():
    """Create all tables and seed with data."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Demo Users
        if db.query(User).count() == 0:
            logger.info("Seeding demo users...")
            demo_users = [
                User(username="admin", email="admin@smartroute.ai", hashed_password=get_password_hash("Admin123!"), role="Admin"),
                User(username="analyst", email="analyst@smartroute.ai", hashed_password=get_password_hash("Analyst123!"), role="Analyst"),
                User(username="manager", email="manager@smartroute.ai", hashed_password=get_password_hash("Manager123!"), role="Manager"),
                User(username="viewer", email="viewer@smartroute.ai", hashed_password=get_password_hash("Viewer123!"), role="Viewer"),
            ]
            db.add_all(demo_users)
            db.commit()
            logger.info("Demo users seeded successfully.")

        # 2. Seed Processed Shipments
        processed_csv = os.path.join(ROOT_DIR, "data", "processed_nassau_candy.csv")
        if not os.path.exists(processed_csv):
            raise FileNotFoundError(f"Processed dataset not found at: {processed_csv}")

        df = pd.read_csv(processed_csv)
        if db.query(Shipment).count() == 0:
            logger.info(f"Loading {len(df)} shipment records into database...")
            shipment_objects = []
            for _, row in df.iterrows():
                shipment_objects.append(
                    Shipment(
                        row_id=int(row["Row ID"]),
                        order_id=str(row["Order ID"]),
                        customer_id=int(row["Customer ID"]),
                        order_date=str(row.get("order_date_iso", row["Order Date"])),
                        ship_date=str(row.get("ship_date_iso", row["Ship Date"])),
                        ship_mode=str(row["Ship Mode"]),
                        product_id=str(row["Product ID"]),
                        product_name=str(row["Product Name"]),
                        division=str(row["Division"]),
                        factory_name=str(row["factory_name"]),
                        country_region=str(row["Country/Region"]),
                        city=str(row["City"]),
                        state_province=str(row["State/Province"]),
                        postal_code=str(row.get("postal_code_clean", row["Postal Code"])),
                        region=str(row["Region"]),
                        route_id=str(row["route_id"]),
                        route_distance_miles=float(row["route_distance_miles"]) if pd.notnull(row["route_distance_miles"]) else None,
                        sales=float(row["Sales"]),
                        units=int(row["Units"]),
                        gross_profit=float(row["Gross Profit"]),
                        cost=float(row["Cost"]),
                        unit_price=float(row["unit_price"]),
                        unit_cost=float(row["unit_cost"]),
                        unit_profit=float(row["unit_profit"]),
                        gross_margin_pct=float(row["gross_margin_pct"]),
                        raw_lead_time_days=int(row["raw_lead_time_days"]),
                        operational_lead_time_days=int(row["operational_lead_time_days"]),
                        is_delayed=bool(row["is_delayed"]),
                        is_anomaly=bool(row.get("is_anomaly", False)),
                        anomaly_score=float(row.get("anomaly_score", 0.0))
                    )
                )

            # Batch insert
            batch_size = 1000
            for i in range(0, len(shipment_objects), batch_size):
                db.bulk_save_objects(shipment_objects[i:i + batch_size])
                db.commit()
            logger.info("All shipments successfully persisted in database.")

        # 3. Seed Route Analytics
        if db.query(Route).count() == 0:
            logger.info("Computing and seeding route intelligence metrics...")
            routes_data = analyze_routes(df)
            route_objects = []
            for r in routes_data:
                route_objects.append(
                    Route(
                        route_id=r["route_id"],
                        factory_name=r["factory_name"],
                        destination_state=r["destination_state"],
                        country=r["country"],
                        region=r["region"],
                        distance_miles=r["distance_miles"],
                        shipments_count=r["shipments_count"],
                        orders_count=r["orders_count"],
                        total_units=r["total_units"],
                        avg_lead_time=r["avg_lead_time"],
                        median_lead_time=r["median_lead_time"],
                        min_lead_time=r["min_lead_time"],
                        max_lead_time=r["max_lead_time"],
                        std_lead_time=r["std_lead_time"],
                        raw_avg_lead_time=r["raw_avg_lead_time"],
                        delay_count=r["delay_count"],
                        delay_rate=r["delay_rate"],
                        efficiency_score=r["efficiency_score"],
                        comp_lead_time=r["comp_lead_time"],
                        comp_delay_rate=r["comp_delay_rate"],
                        comp_variability=r["comp_variability"],
                        performance_tier=r["performance_tier"],
                        is_bottleneck=r["is_bottleneck"],
                        origin_lat=r["origin_lat"],
                        origin_lng=r["origin_lng"],
                        dest_lat=r["dest_lat"],
                        dest_lng=r["dest_lng"],
                        total_sales=r["total_sales"],
                        avg_sales=r["avg_sales"],
                        total_profit=r["total_profit"],
                        avg_profit=r["avg_profit"]
                    )
                )
            db.bulk_save_objects(route_objects)
            db.commit()
            logger.info(f"Seeded {len(route_objects)} route metrics.")

        # 4. Seed Initial Operational Alerts
        if db.query(Alert).count() == 0:
            logger.info("Generating initial automated alerts...")
            routes_data = analyze_routes(df)
            bottlenecks = detect_bottlenecks(routes_data)
            alerts = []

            # Add alerts for top bottlenecks
            for b in bottlenecks[:4]:
                alerts.append(
                    Alert(
                        title=f"Critical Bottleneck: {b['route_id']}",
                        message=f"High shipment volume ({b['shipments_count']} orders) coupled with {b['delay_percentage']}% delay rate on route to {b['destination_state']}.",
                        severity="CRITICAL",
                        alert_type="BOTTLENECK",
                        route_id=b["route_id"]
                    )
                )

            # High risk alert
            high_delay_routes = [r for r in routes_data if r["delay_rate"] > 0.40 and r["shipments_count"] >= 15]
            for h in high_delay_routes[:3]:
                alerts.append(
                    Alert(
                        title=f"Severe Delay Risk: {h['route_id']}",
                        message=f"Average operational lead time of {h['avg_lead_time']} days with {h['delay_percentage']}% delay rate. Carrier SLA breach warning.",
                        severity="WARNING",
                        alert_type="DELAY_SPIKE",
                        route_id=h["route_id"]
                    )
                )

            # System quality alert
            alerts.append(
                Alert(
                    title="Dataset Quality Audit Active",
                    message="Detected and normalized 449 truncated US postal codes and 200 Canadian FSA records. Dynamic cohort anchoring active.",
                    severity="INFO",
                    alert_type="SYSTEM",
                    route_id=None
                )
            )

            db.add_all(alerts)
            db.commit()
            logger.info(f"Seeded {len(alerts)} automated operational alerts.")

        logger.info("Database initialization completed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
