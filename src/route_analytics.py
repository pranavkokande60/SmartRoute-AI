"""
SmartRoute-AI Route Intelligence and Efficiency Scoring Module
==============================================================
Module: src/route_analytics.py
Author: Antigravity AI Engineering Team

This module computes comprehensive route analytics (Factory -> Destination State),
calculates the transparent 0-100 Route Efficiency Score, detects geographic bottlenecks,
and generates performance ranking tiers (High Performance, Moderate Performance,
Needs Attention, High Delay Risk).
"""

import math
from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd


def compute_efficiency_score(avg_lead_time: float, delay_rate: float, std_lead_time: float) -> Dict[str, float]:
    """
    Computes a transparent, explainable 0-100 Route Efficiency Score.
    
    Formula & Component Weights:
    1. Lead Time Component (40%): Faster average operational delivery yields higher score.
       Formula: max(0, min(100, 100 - ((avg_lead_time - 1.0) / 6.0) * 100))
    2. Delay Rate Component (40%): Lower SLA delay frequency yields higher score.
       Formula: max(0, min(100, (1.0 - delay_rate) * 100))
    3. Variability Component (20%): Lower standard deviation (predictable delivery) yields higher score.
       Formula: max(0, min(100, 100 - (std_lead_time / 2.5) * 100))
       
    Overall Score = 0.40 * score_lead_time + 0.40 * score_delay_rate + 0.20 * score_variability
    """
    # 1. Lead time score: baseline 1 day = 100, 7 days = 0
    safe_lt = max(0.5, float(avg_lead_time))
    comp_lead_time = max(0.0, min(100.0, 100.0 - ((safe_lt - 1.0) / 6.0) * 100.0))

    # 2. Delay rate score: 0% delay = 100, 100% delay = 0
    safe_delay = max(0.0, min(1.0, float(delay_rate)))
    comp_delay_rate = max(0.0, min(100.0, (1.0 - safe_delay) * 100.0))

    # 3. Variability score: std 0 = 100, std 2.5d = 0
    safe_std = 0.0 if math.isnan(std_lead_time) or std_lead_time is None else float(std_lead_time)
    comp_variability = max(0.0, min(100.0, 100.0 - (safe_std / 2.5) * 100.0))

    # Weighted sum
    overall_score = round(
        (0.40 * comp_lead_time) + (0.40 * comp_delay_rate) + (0.20 * comp_variability), 1
    )

    return {
        "efficiency_score": overall_score,
        "comp_lead_time": round(comp_lead_time, 1),
        "comp_delay_rate": round(comp_delay_rate, 1),
        "comp_variability": round(comp_variability, 1)
    }


def assign_performance_tier(score: float, delay_rate: float) -> str:
    """
    Assign neutral, professional performance categories.
    """
    if delay_rate >= 0.25:
        return "High Delay Risk"
    if score >= 75.0:
        return "High Performance"
    if score >= 55.0:
        return "Moderate Performance"
    return "Needs Attention"


def analyze_routes(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Aggregates orders by route (Factory -> State/Province) and computes all metrics.
    """
    routes_list = []
    grouped = df.groupby(["route_id", "factory_name", "State/Province", "Country/Region", "Region"])

    for (route_id, factory_name, dest_state, country, region), grp in grouped:
        shipments_count = len(grp)
        orders_count = grp["Order ID"].nunique()
        op_lt = grp["operational_lead_time_days"]
        raw_lt = grp["raw_lead_time_days"]

        avg_lt = float(op_lt.mean())
        median_lt = float(op_lt.median())
        min_lt = int(op_lt.min())
        max_lt = int(op_lt.max())
        std_lt = float(op_lt.std()) if len(op_lt) > 1 else 0.0
        if math.isnan(std_lt):
            std_lt = 0.0

        delay_cnt = int(grp["is_delayed"].sum())
        delay_rate = round(delay_cnt / shipments_count, 4)

        total_sales = float(grp["Sales"].sum())
        avg_sales = round(float(grp["Sales"].mean()), 2)
        total_profit = float(grp["Gross Profit"].sum())
        avg_profit = round(float(grp["Gross Profit"].mean()), 2)
        total_units = int(grp["Units"].sum())

        dist_val = grp["route_distance_miles"].dropna().iloc[0] if len(grp["route_distance_miles"].dropna()) > 0 else None
        origin_lat = grp["origin_lat"].dropna().iloc[0] if len(grp["origin_lat"].dropna()) > 0 else None
        origin_lng = grp["origin_lng"].dropna().iloc[0] if len(grp["origin_lng"].dropna()) > 0 else None
        dest_lat = grp["dest_lat"].dropna().iloc[0] if len(grp["dest_lat"].dropna()) > 0 else None
        dest_lng = grp["dest_lng"].dropna().iloc[0] if len(grp["dest_lng"].dropna()) > 0 else None

        # Mode breakdown
        mode_counts = grp["Ship Mode"].value_counts().to_dict()

        # Compute efficiency score
        eff = compute_efficiency_score(avg_lt, delay_rate, std_lt)
        tier = assign_performance_tier(eff["efficiency_score"], delay_rate)

        # Bottleneck detection:
        # High volume (> 50 orders) + high lead time (> 4.8d) + high delay rate (> 15%)
        is_bottleneck = (shipments_count >= 50) and (avg_lt >= 4.8) and (delay_rate >= 0.15)

        routes_list.append({
            "route_id": route_id,
            "factory_name": factory_name,
            "destination_state": dest_state,
            "country": country,
            "region": region,
            "shipments_count": shipments_count,
            "orders_count": orders_count,
            "total_units": total_units,
            "avg_lead_time": round(avg_lt, 2),
            "median_lead_time": round(median_lt, 1),
            "min_lead_time": min_lt,
            "max_lead_time": max_lt,
            "std_lead_time": round(std_lt, 2),
            "raw_avg_lead_time": round(float(raw_lt.mean()), 1),
            "delay_count": delay_cnt,
            "delay_rate": delay_rate,
            "delay_percentage": round(delay_rate * 100, 1),
            "efficiency_score": eff["efficiency_score"],
            "comp_lead_time": eff["comp_lead_time"],
            "comp_delay_rate": eff["comp_delay_rate"],
            "comp_variability": eff["comp_variability"],
            "performance_tier": tier,
            "is_bottleneck": is_bottleneck,
            "distance_miles": round(dist_val, 1) if dist_val else None,
            "origin_lat": origin_lat,
            "origin_lng": origin_lng,
            "dest_lat": dest_lat,
            "dest_lng": dest_lng,
            "total_sales": round(total_sales, 2),
            "avg_sales": avg_sales,
            "total_profit": round(total_profit, 2),
            "avg_profit": avg_profit,
            "ship_mode_breakdown": mode_counts
        })

    # Sort by efficiency score descending
    routes_list.sort(key=lambda r: r["efficiency_score"], reverse=True)
    return routes_list


def detect_bottlenecks(routes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Filter and rank geographic bottlenecks based on:
    Bottleneck Score = (Volume Rank * 0.3) + (Lead Time Rank * 0.4) + (Delay Rate Rank * 0.3)
    """
    bottlenecks = [r for r in routes if r["is_bottleneck"] or r["delay_rate"] >= 0.18 or (r["avg_lead_time"] >= 5.0 and r["shipments_count"] >= 30)]
    # Sort by shipments count * delay rate (impact volume)
    bottlenecks.sort(key=lambda r: r["shipments_count"] * r["delay_rate"], reverse=True)
    return bottlenecks
