# SmartRoute AI — Intelligent Factory-to-Customer Logistics Analytics & Decision Support System

[![Live Demo](https://img.shields.io/badge/Live_Website-Render-2ea44f?style=for-the-badge&logo=render)](https://smartroute-ai-qn26.onrender.com/)
[![FastAPI](https://img.shields.io/badge/REST_API-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://smartroute-ai-qn26.onrender.com/docs)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)](https://smartroute-ai-qn26.onrender.com/)

> 🌐 **Live Website Application:** [https://smartroute-ai-qn26.onrender.com/](https://smartroute-ai-qn26.onrender.com/)  
> 📖 **Interactive Swagger API Docs:** [https://smartroute-ai-qn26.onrender.com/docs](https://smartroute-ai-qn26.onrender.com/docs)  
> 🎓 **Project for Nassau Candy Distributor**  
> Built with **React**, **FastAPI**, **SQLite / PostgreSQL**, **Scikit-Learn**, **Tailwind CSS**, and **Leaflet**.

---

## 🚀 Project Overview

**SmartRoute AI** is an enterprise-grade logistics analytics, prediction, and decision-support platform designed for **Nassau Candy Distributor**. The system transforms raw historical order records into actionable supply chain intelligence across 5 major manufacturing facilities and 196 factory-to-customer state shipping corridors.

### Key Capabilities:
- **Command Center Dashboard:** High-level executive KPI telemetry, delay rates, and network performance.
- **🆕 New Order Management:** End-to-end customer order intake, automated factory assignment, and ML ETA/delay risk scoring.
- **📊 Prediction vs Actual Performance:** Continuous model evaluation (MAE, RMSE, Error Tolerance Accuracy, Confusion Matrix, Precision, Recall, F1).
- **📈 Model Performance Monitoring:** Live drift tracking, version tracking, and performance degradation warnings ($N \ge 5$ quorum).
- **🧪 AI Prediction Playground:** In-memory sandbox to simulate lead times and risk scores without database mutations.
- **⚖️ Route Comparison Engine:** Side-by-side corridor benchmark analyzing lead times, delivery variance ($\sigma$), and efficiency scores.
- **🤖 AI Logistics Assistant:** Conversational analytics query engine translating natural language questions into safe, read-only SQL aggregations.
- **🔔 Notification Center:** Slide-over notification drawer with unread badge counter and multi-domain filtering (Orders, Models, Routes, Anomalies, Quality).
- **⚡ Global Command Palette (`Ctrl + K`):** Instant keyboard-driven search for orders, routes, factories, products, states, and modules.
- **Interactive US Logistics Map:** Geospatial mapping of factories, states, volume nodes, and carrier delay tiers with drilldown analytics.
- **Unsupervised Anomaly Detection:** Isolation Forest isolating multidimensional transit outliers.
- **Shipment Volume Forecasting:** Time-series forecasting projecting 14-day daily dispatches with 95% confidence intervals.
- **What-If Scenario Simulator:** Strategy comparison tool quantifying transit time savings and risk reductions before dispatch.
- **Live Operations (WebSockets):** Real-time event simulator broadcasting simulated logistics telemetries over WebSockets.
- **Executive PDF Report Generator:** Dynamic, publication-quality logistics report generator powered by ReportLab.

---

## 🏛 System Architecture

```mermaid
flowchart TD
    subgraph Data Layer
        A[Nassau Candy Distributor CSV] --> B[Non-Destructive Preprocessor]
        B --> C[Empirical Cohort Anchoring]
        C --> D[(SQLite / PostgreSQL Database)]
    end

    subgraph Backend Service [FastAPI @ :8000]
        D --> E[SQLAlchemy ORM]
        E --> F[REST API v1 Endpoints]
        E --> G[WebSocket Live Simulator]
        H[ML Model Manager] --> F
    end

    subgraph Frontend Application [React + Vite @ :5173]
        F --> I[API Client]
        G --> J[WebSocket Stream]
        I --> K[Command Center & Route Explorer]
        I --> L[Leaflet US Map]
        I --> M[ML Prediction & Simulator]
        J --> N[Live Operations Feed]
    end
```

---

## 📦 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript | Fast, responsive single-page logistics SaaS dashboard |
| **Styling & UI** | Tailwind CSS, Lucide Icons | Modern dark-slate dashboard theme with responsive cards |
| **Mapping** | Leaflet, CartoDB Dark Matter | Interactive US geospatial rendering of factories and states |
| **Backend API** | FastAPI, Uvicorn, Pydantic | High-performance asynchronous REST API + automatic Swagger docs |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) | Zero-friction local run with full PostgreSQL schema parity |
| **Machine Learning**| Scikit-learn, NumPy, Pandas | Random Forest (Delay/ETA), Isolation Forest (Anomalies) |
| **Real-Time** | WebSockets (`websockets`) | Full-duplex live logistics analytics event simulator |
| **Reporting** | ReportLab | Server-side executive PDF report generation |

---

## 📊 Dataset & Preprocessing Methodology

The source file [`Nassau Candy Distributor.csv`](file:///C:/Users/prana/OneDrive/Desktop/SmartRoute-AI/Nassau%20Candy%20Distributor.csv) contains **10,194 records and 18 columns**.

### The Date Anomaly & Empirical Cohort Anchoring:
Raw dates exhibited an artificial multi-year offset (raw lead times of 904 to 1,642 days). SmartRoute AI resolves this without altering the raw CSV through **empirical Same Day cohort anchoring**:
$$\text{Operational Lead Time} = (\text{Ship Date} - \text{Order Date}) - \min(\text{Same Day Raw Lead Time in Cohort})$$
This restores real-world shipping durations:
- **Same Day:** 0–1 days (mean: 0.38d)
- **First Class:** 1–3 days (mean: 2.55d)
- **Second Class:** 2–5 days (mean: 3.57d)
- **Standard Class:** 4–7 days (mean: 5.32d)

### The 5 Explicit Audit Flags:
1. `flag_artificial_date_shift`: 10,194 records (100.0%)
2. `flag_truncated_us_postal_code`: 449 records (4.4%)
3. `flag_canadian_fsa_postal_code`: 200 records (1.96%)
4. `flag_product_division_inconsistency`: 6 records (0.06%)
5. `flag_extreme_product_volume_imbalance`: 230 records (2.26%)

---

## 🏭 Factory & Product Allocations

| Factory Name | Coordinates | City, State | Specialization |
|---|---|---|---|
| **Lot's O' Nuts** | 32.881893, -111.768036 | Casa Grande, AZ | Nut & Marshmallow Chocolate Bars |
| **Wicked Choccy's** | 32.076176, -81.088371 | Savannah, GA | Premium Milk & Caramel Chocolate |
| **Sugar Shack** | 48.119140, -96.181150 | Thief River Falls, MN | Sugar Candies & Beverages |
| **Secret Factory** | 41.446333, -90.565487 | Rock Island, IL | Experimental Confections |
| **The Other Factory**| 35.117500, -89.971107 | Memphis, TN | Chewy Candies & Toffee |

---

## 🆕 Extended Enterprise Logistics & AI Modules

### 1. 📦 New Order Management (`/api/v1/new-orders`)
- **End-to-End Order Lifecycle:** Allows dispatch managers to enter new customer orders (`NEW` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `CANCELLED`).
- **Automated Factory Allocation:** Eliminates manual guessing by auto-mapping customer confectionery products directly to the 5 specialized factories (`Wicked Choccy's`, `Sugar Shack`, `The Other Factory`, `Secret Factory`, `Lot's O' Nuts`).
- **AI Prediction Integration:** Instantly scores newly placed orders with estimated lead times (ETA in days) and multi-class SLA delay risk ratings (`Low Risk`, `Medium/Moderate Risk`, `High Risk`).
- **Database Separation:** Stored in the dedicated `new_orders` database table without modifying or corrupting historical dataset records.

### 2. 📊 Prediction Performance (Prediction vs Actual) (`/api/v1/predictions/performance`)
- **Continuous Evaluation:** Automatically compares machine learning predictions against ground-truth delivery outcomes for completed orders.
- **Continuous Lead-Time Metrics:** Computes Mean Absolute Error (MAE), Root Mean Square Error (RMSE), Absolute Error per order, and Tolerance Accuracy ($\le 1.0\text{ day}$).
- **Classification Risk Metrics:** Generates a real-time $2 \times 2$ Confusion Matrix ($\text{TP}, \text{FP}, \text{FN}, \text{TN}$) with Precision, Recall, and F1-score for delay classifications.
- **Integrity Rule:** Strictly excludes pending orders without verified delivery outcomes to prevent synthetic distortion.

### 3. 📈 Model Performance Monitoring (`/api/v1/models/monitoring`)
- **Deployed Model Observability:** Live monitoring across 4 production models:
  1. *Random Forest Delay Classifier* (Precision, Recall, F1-Score)
  2. *Gradient Boosted ETA Regressor* (MAE, RMSE, $R^2$)
  3. *Isolation Forest Outlier Detector* (Contamination Rate, Outlier Frequency)
  4. *14-Day Rolling Forecaster* (Horizon Projection Accuracy)
- **Drift & Degradation Detection:** Automated health warnings (`HEALTHY` vs `NEEDS_ATTENTION`) triggered when live MAE exceeds baseline by $>25\%$ or F1 drops by $>0.10$.
- **Sample Quorum Safeguard:** Enforces a minimum sample size ($N \ge 5$) before asserting degradation warnings to avoid premature alerts.

### 4. 🧪 AI Prediction Playground (`/api/v1/predictions/playground`)
- **Interactive Sandbox:** Test hypothetical order scenarios (Product, Units, Customer State, Region, Ship Mode, Order Date) without database mutations.
- **Feature Attribution:** Displays directional feature weights and SLA breach risk percentages.
- **In-Memory Guarantee:** Runs inference directly through `ml_manager` without database writes, keeping production KPI counters pristine.

### 5. ⚖️ Route Comparison Engine (`/api/v1/routes/compare`)
- **Multi-Corridor Benchmark:** Compare 2 to 5 shipping corridors side-by-side.
- **Variance & Reliability:** Computes lead-time standard deviation ($\sigma_{\text{lead\_time}}$) to quantify operational volatility alongside average lead time.
- **Automated Differential Insights:** Synthesizes comparative delta percentages and identifies root-cause delay drivers across selected corridors.

### 6. 🤖 AI Logistics Assistant (`/api/v1/assistant/query`)
- **Conversational Analytics:** Authenticated natural language chat interface answering real questions about historical shipments, routes, factories, and order queues.
- **Strict Read-Only Safety:** Translates natural language into deterministic, safe SQLAlchemy aggregations (zero raw or destructive SQL execution).
- **Source Citation:** Every answer cites verified dataset and database table sources (e.g., `Carrier Mode Aggregation (10,194 shipments)`).

### 7. 🔔 Notification Center (`/api/v1/notifications`)
- **Slide-Over Drawer:** Real-time slide-over drawer connected to the top navbar bell with an unread badge counter.
- **5-Domain Filtering:** Filter alerts across Orders, Models, Corridors, Anomaly Flags, and Data Quality.
- **Persistent State:** Mark individual alerts as read, mark all read, or clear dismissed notifications.

### 8. ⚡ Global Command Palette (`Ctrl + K`) (`/api/v1/search`)
- **System-Wide Modal:** Keyboard-accessible command palette (`Ctrl + K` / `Cmd + K`).
- **Multi-Entity Indexing:** Unified instant search covering modules, new orders, routes, factories, states, and products.
- **Keyboard Navigation:** Full arrow key (`↑`/`↓`) selection, `Enter` to jump, and `ESC` to close.

---

## ⚡ Quick Start & Setup Instructions

### 1. Prerequisites
- Python 3.9+ installed
- Node.js v18+ and npm installed

### 2. Backend Setup
```bash
# Navigate to project root
cd SmartRoute-AI

# Install Python dependencies
pip install fastapi uvicorn sqlalchemy pydantic passlib python-jose[cryptography] websockets python-multipart reportlab scikit-learn pandas numpy

# Initialize database and train models
python src/init_db.py
python src/ml_models.py

# Run FastAPI backend
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev
```
Open your browser at: [http://localhost:5173](http://localhost:5173)

### 4. 1-Click Demo Accounts
| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@smartroute.ai` | `Admin123!` | Full governance, data management |
| **Analyst** | `analyst@smartroute.ai` | `Analyst123!` | ML models, simulations, forecasting |
| **Manager** | `manager@smartroute.ai` | `Manager123!` | Operations, factory metrics, alerts |
| **Viewer** | `viewer@smartroute.ai` | `Viewer123!` | Read-only analytics & route explorer |

---

## 🧪 Testing

Run the automated test suite:
```bash
python tests/test_smartroute.py
```
*Output: `ALL TESTS PASSED SUCCESSFULLY! (5/5)`*

---

## 📚 Project Documentation
- **Date Anomaly & Operational Lead Time Whitepaper:** [`docs/operational_lead_time.md`](docs/operational_lead_time.md)
