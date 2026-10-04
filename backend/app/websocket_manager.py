"""
SmartRoute-AI WebSocket Live Analytics Event Simulator
======================================================
Module: backend/app/websocket_manager.py
Author: Antigravity AI Engineering Team

Demonstrates real-time event streaming via WebSockets.
Generates simulated logistics events (e.g. shipment processed, anomaly flagged,
prediction generated, SLA risk shift) based on historical dataset patterns
without falsely claiming real-world live telemetry.
"""

import asyncio
import json
import random
import logging
from typing import List
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("SmartRoute.WebSocket")

SAMPLE_ROUTES = [
    ("Wicked Choccy's", "California", "Wonka Bar - Milk Chocolate", "Standard Class"),
    ("Lot's O' Nuts", "New York", "Wonka Bar - Fudge Mallows", "Second Class"),
    ("Sugar Shack", "Texas", "Laffy Taffy", "First Class"),
    ("Secret Factory", "Illinois", "Wonka Gum", "Same Day"),
    ("The Other Factory", "Florida", "Kazookles", "Standard Class"),
    ("Lot's O' Nuts", "Washington", "Wonka Bar - Nutty Crunch Surprise", "Standard Class"),
    ("Wicked Choccy's", "Georgia", "Wonka Bar - Triple Dazzle Caramel", "First Class")
]

EVENT_TYPES = [
    "SHIPMENT_PROCESSED",
    "ETA_PREDICTION_GENERATED",
    "ANOMALY_DETECTED",
    "ROUTE_RISK_EVALUATED",
    "SLA_ALERT_TRIGGERED"
]


class ConnectionManager:
    """Manages active WebSocket connections and broadcasts simulated events."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)


manager = ConnectionManager()


async def live_event_simulator_loop():
    """
    Background simulation loop producing realistic logistics analytics events every 3-5 seconds.
    """
    logger.info("Starting live analytics event simulator loop...")
    order_counter = 10200

    while True:
        try:
            await asyncio.sleep(random.uniform(2.5, 4.5))
            if not manager.active_connections:
                continue

            order_counter += 1
            fac, st, prod, mode = random.choice(SAMPLE_ROUTES)
            event_type = random.choices(
                EVENT_TYPES,
                weights=[0.40, 0.25, 0.10, 0.15, 0.10],
                k=1
            )[0]

            lead_time = round(random.uniform(0.5, 6.0), 1)
            is_anomaly = event_type == "ANOMALY_DETECTED"
            risk = "HIGH" if lead_time > 5.0 else ("MODERATE" if lead_time > 3.5 else "LOW")

            event_payload = {
                "event_id": f"EVT-{order_counter}",
                "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
                "event_type": event_type,
                "order_id": f"US-2025-{order_counter}",
                "factory": fac,
                "destination_state": st,
                "product": prod,
                "ship_mode": mode,
                "operational_lead_time_days": lead_time,
                "risk_level": risk,
                "is_anomaly": is_anomaly,
                "summary": f"[{event_type}] {fac} -> {st} ({prod}, {mode}): ETA {lead_time}d [{risk} RISK]"
            }

            await manager.broadcast(event_payload)
        except Exception as e:
            logger.error(f"Error in live event simulator: {e}")
            await asyncio.sleep(5)
