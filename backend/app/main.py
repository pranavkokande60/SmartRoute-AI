"""
SmartRoute-AI Main FastAPI Application Entrypoint
=================================================
Module: backend/app/main.py
Author: Antigravity AI Engineering Team

Assembles the FastAPI application with:
1. Versioned REST API endpoints under /api/v1/
2. WebSocket Live Analytics Event Simulator at /ws/live-operations
3. Automatic OpenAPI documentation (Swagger at /docs, ReDoc at /redoc)
4. CORS middleware configuration for local modern React development
5. Static files mounting for integrated single-binary deployment
"""

import os
import sys
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, FileResponse

# Ensure root workspace directory is in python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app.routes.api import (
    auth_router, dashboard_router, route_router, factory_router,
    state_router, ml_router, anomaly_router, forecast_router,
    simulation_router, alert_router, dataset_router, report_router,
    shipment_router, models_router, notification_router, search_router,
    assistant_router
)
from backend.app.routes.new_orders import new_orders_router
from backend.app.routes.predictions import predictions_router
from backend.app.websocket_manager import manager, live_event_simulator_loop
from backend.app.database import engine, Base
from src.init_db import init_database

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SmartRoute.Main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager handling startup initialization and background tasks."""
    logger.info("Starting up SmartRoute AI backend service...")
    # Ensure database is initialized
    init_database()
    # Launch background live event simulator
    simulator_task = asyncio.create_task(live_event_simulator_loop())
    yield
    logger.info("Shutting down SmartRoute AI backend service...")
    simulator_task.cancel()


app = FastAPI(
    title="SmartRoute AI — Supply Chain Intelligence & Decision Support API",
    description=(
        "Production-grade REST and WebSocket API for factory-to-customer logistics intelligence, "
        "route bottleneck detection, SLA delay prediction, and ETA estimation for Nassau Candy Distributor."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Routers under /api/v1/
API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)
app.include_router(route_router, prefix=API_PREFIX)
app.include_router(factory_router, prefix=API_PREFIX)
app.include_router(state_router, prefix=API_PREFIX)
app.include_router(ml_router, prefix=API_PREFIX)
app.include_router(anomaly_router, prefix=API_PREFIX)
app.include_router(forecast_router, prefix=API_PREFIX)
app.include_router(simulation_router, prefix=API_PREFIX)
app.include_router(alert_router, prefix=API_PREFIX)
app.include_router(dataset_router, prefix=API_PREFIX)
app.include_router(report_router, prefix=API_PREFIX)
app.include_router(shipment_router, prefix=API_PREFIX)
app.include_router(new_orders_router, prefix=API_PREFIX)
app.include_router(predictions_router, prefix=API_PREFIX)
app.include_router(models_router, prefix=API_PREFIX)
app.include_router(notification_router, prefix=API_PREFIX)
app.include_router(search_router, prefix=API_PREFIX)
app.include_router(assistant_router, prefix=API_PREFIX)


# WebSocket Endpoint for Live Operations Simulator
@app.websocket("/ws/live-operations")
async def websocket_live_operations(websocket: WebSocket):
    """WebSocket stream emitting real-time simulated logistics events."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open and receive any client ping
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Health Check
@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "SmartRoute AI",
        "version": "1.0.0",
        "docs": "/docs"
    }


# Optional Frontend Static Mount (if built)
FRONTEND_DIST = os.path.join(ROOT_DIR, "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root_redirect():
        return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
