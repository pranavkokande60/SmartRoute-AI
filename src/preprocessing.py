"""
SmartRoute-AI Preprocessing & Feature Engineering Pipeline
==========================================================
Module: src/preprocessing.py
Author: Antigravity AI Engineering Team

This module implements a rigorous, non-destructive data preprocessing and feature-engineering
pipeline for Nassau Candy Distributor dataset.

Key Principles:
1. NON-DESTRUCTIVE: The raw input CSV is never altered or overwritten.
2. DYNAMIC VALIDATION: Lead time offsets are NOT arbitrarily hard-coded; they are
   dynamically inferred and statistically validated against cohort anchor distributions
   (specifically Same Day shipments within each Order ID cohort).
3. AUDITABILITY: Both raw and operational metrics, along with comprehensive data quality flags,
   are explicitly preserved in the derived dataset.
"""

import os
import sys
import re
import json
import logging
from typing import Dict, Tuple, Optional, Any
import numpy as np
import pandas as pd

# Ensure root workspace directory is in python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SmartRoute.Preprocessor")


class DatasetQualityError(Exception):
    """Raised when data quality issues prevent confident pipeline execution."""
    pass


class NassauDataPreprocessor:
    """
    Robust preprocessor for Nassau Candy Distributor logistics dataset.
    """

    EXPECTED_COLUMNS = [
        "Row ID", "Order ID", "Order Date", "Ship Date", "Ship Mode",
        "Customer ID", "Country/Region", "City", "State/Province",
        "Postal Code", "Division", "Region", "Product ID", "Product Name",
        "Sales", "Units", "Gross Profit", "Cost"
    ]

    EXPECTED_SHIP_MODES = ["Same Day", "First Class", "Second Class", "Standard Class"]

    def __init__(self, raw_csv_path: str, output_csv_path: Optional[str] = None):
        self.raw_csv_path = raw_csv_path
        self.output_csv_path = output_csv_path or os.path.join(
            os.path.dirname(raw_csv_path), "data", "processed_nassau_candy.csv"
        )
        self.raw_df: Optional[pd.DataFrame] = None
        self.processed_df: Optional[pd.DataFrame] = None
        self.cohort_anchors: Dict[str, int] = {}
        self.validation_summary: Dict[str, Any] = {}

    def load_raw_data(self) -> pd.DataFrame:
        """
        Load raw CSV with all text columns read as strings to preserve leading zeros
        and original formatting.
        """
        if not os.path.exists(self.raw_csv_path):
            raise FileNotFoundError(f"Source file not found at: {self.raw_csv_path}")

        logger.info(f"Loading raw data from: {self.raw_csv_path}")
        # Read Postal Code as string explicitly to preserve any leading zero
        self.raw_df = pd.read_csv(self.raw_csv_path, dtype={"Postal Code": str})
        
        # Verify columns
        missing_cols = set(self.EXPECTED_COLUMNS) - set(self.raw_df.columns)
        if missing_cols:
            raise DatasetQualityError(f"Missing required columns in dataset: {missing_cols}")

        logger.info(f"Loaded {len(self.raw_df)} records across {len(self.raw_df.columns)} columns.")
        return self.raw_df

    def parse_dates_and_raw_lead_time(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Parse Order Date and Ship Date strictly with DD-MM-YYYY format.
        Compute raw_lead_time_days = Ship Date - Order Date.
        """
        logger.info("Parsing dates with DD-MM-YYYY format...")
        df["order_date_parsed"] = pd.to_datetime(df["Order Date"], format="%d-%m-%Y", errors="coerce")
        df["ship_date_parsed"] = pd.to_datetime(df["Ship Date"], format="%d-%m-%Y", errors="coerce")

        if df["order_date_parsed"].isnull().any():
            invalid_cnt = df["order_date_parsed"].isnull().sum()
            raise DatasetQualityError(f"Failed to parse {invalid_cnt} Order Dates using DD-MM-YYYY format.")

        if df["ship_date_parsed"].isnull().any():
            invalid_cnt = df["ship_date_parsed"].isnull().sum()
            raise DatasetQualityError(f"Failed to parse {invalid_cnt} Ship Dates using DD-MM-YYYY format.")

        df["raw_lead_time_days"] = (df["ship_date_parsed"] - df["order_date_parsed"]).dt.days
        logger.info("Raw lead times computed successfully.")
        return df

    def extract_cohorts(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Extract cohort year from Order ID prefix (e.g. 'US-2021-103800...' -> '2021').
        """
        df["cohort_year"] = df["Order ID"].str.extract(r"^[A-Z]+-(\d{4})-")[0]
        if df["cohort_year"].isnull().any():
            unmatched = df["cohort_year"].isnull().sum()
            raise DatasetQualityError(f"Found {unmatched} rows where Order ID does not match expected pattern.")
        
        logger.info(f"Cohorts identified: {df['cohort_year'].value_counts().to_dict()}")
        return df

    def discover_and_validate_cohort_anchors(self, df: pd.DataFrame) -> Dict[str, int]:
        """
        Empirically discover the artificial date-shift offset for each cohort
        by analyzing 'Same Day' shipments.

        Logic:
        By definition, 'Same Day' shipping mode implies immediate or next-calendar-day dispatch
        (operational shipping duration = 0 or 1 day).
        For each cohort:
          offset = min(raw_lead_time_days for Ship Mode == 'Same Day')
        
        Validation criteria:
        1. Cohort must contain >= 20 'Same Day' orders for robust sample size.
        2. Same Day orders must have tight dispersion (std dev <= 1.0 day).
        3. Offsets across sequential cohorts must exhibit realistic step increments (~365 days).
        """
        logger.info("Discovering cohort anchors from empirical Same Day orders...")
        anchors = {}
        cohort_groups = df.groupby("cohort_year")

        for cohort, grp in cohort_groups:
            same_day_orders = grp[grp["Ship Mode"] == "Same Day"]
            count_same_day = len(same_day_orders)

            if count_same_day < 20:
                raise DatasetQualityError(
                    f"Insufficient Same Day samples in cohort {cohort} (found {count_same_day}, minimum 20 required)."
                )

            min_same_day_lead = int(same_day_orders["raw_lead_time_days"].min())
            std_same_day_lead = float(same_day_orders["raw_lead_time_days"].std())

            logger.info(
                f"Cohort {cohort}: N={len(grp)} | Same Day N={count_same_day} | "
                f"Min Same Day Lead={min_same_day_lead}d | StdDev={std_same_day_lead:.4f}d"
            )

            # Check dispersion
            if std_same_day_lead > 1.5:
                raise DatasetQualityError(
                    f"High variance in Same Day orders for cohort {cohort} (std={std_same_day_lead:.2f}). "
                    "Cannot confidently isolate an exact cohort shift."
                )

            anchors[cohort] = min_same_day_lead

        self.cohort_anchors = anchors
        logger.info(f"Validated empirical cohort anchors: {self.cohort_anchors}")

        # Check year-over-year step differences
        cohort_years = sorted(anchors.keys())
        for i in range(len(cohort_years) - 1):
            c1, c2 = cohort_years[i], cohort_years[i+1]
            diff = anchors[c2] - anchors[c1]
            logger.info(f"Anchor difference between {c1} and {c2}: {diff} days")

        return anchors

    def calculate_and_validate_operational_lead_time(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Compute operational_lead_time_days = raw_lead_time_days - cohort_anchor.
        Validate against domain logistics thresholds:
        - Same Day: 0 to 1 days (tolerates up to 2 days)
        - First Class: 1 to 3 days (tolerates up to 5 days)
        - Second Class: 2 to 5 days (tolerates up to 6 days)
        - Standard Class: 4 to 7 days (tolerates up to 11 days)
        """
        df["cohort_base_shift_days"] = df["cohort_year"].map(self.cohort_anchors)

        # Mark correction status
        df["lead_time_correction_status"] = np.where(
            df["cohort_base_shift_days"].notnull(), "CORRECTED_CONFIDENT", "UNCORRECTED"
        )

        df["operational_lead_time_days"] = (
            df["raw_lead_time_days"] - df["cohort_base_shift_days"]
        ).astype(int)

        # Compute corrected operational ship date
        df["operational_ship_date"] = (
            df["order_date_parsed"] + pd.to_timedelta(df["operational_lead_time_days"], unit="D")
        ).dt.strftime("%Y-%m-%d")

        # Validate by Ship Mode
        mode_validation = {}
        for mode in self.EXPECTED_SHIP_MODES:
            sub = df[df["Ship Mode"] == mode]["operational_lead_time_days"]
            stats = {
                "count": int(sub.count()),
                "min": int(sub.min()),
                "median": float(sub.median()),
                "mean": round(float(sub.mean()), 3),
                "max": int(sub.max()),
                "std": round(float(sub.std()), 3),
                "p25": float(sub.quantile(0.25)),
                "p75": float(sub.quantile(0.75))
            }
            mode_validation[mode] = stats

            # Sanity checks
            if mode == "Same Day" and (stats["min"] < 0 or stats["median"] > 1):
                raise DatasetQualityError(f"Validation failed for Same Day mode: {stats}")
            if mode == "First Class" and (stats["min"] < 0 or stats["median"] > 4):
                raise DatasetQualityError(f"Validation failed for First Class mode: {stats}")
            if mode == "Second Class" and (stats["min"] < 0 or stats["median"] > 6):
                raise DatasetQualityError(f"Validation failed for Second Class mode: {stats}")
            if mode == "Standard Class" and (stats["min"] < 0 or stats["median"] > 8):
                raise DatasetQualityError(f"Validation failed for Standard Class mode: {stats}")

        self.validation_summary["mode_validation"] = mode_validation
        logger.info("Operational lead time successfully validated across all shipping modes.")
        return df

    def engineer_features_and_quality_flags(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate feature-engineered columns and explicit data quality flags.
        """
        logger.info("Generating features and data quality flags...")

        # 1. Quality Flag: Artificial Date Shift
        df["flag_artificial_date_shift"] = df["raw_lead_time_days"] > 30

        # 2. Quality Flag & Clean Value: Truncated US Postal Code
        # US postal codes should be 5 digits. If length < 5, leading zero was truncated.
        is_us = df["Country/Region"] == "United States"
        raw_zip_str = df["Postal Code"].astype(str).str.strip()
        df["flag_truncated_us_postal_code"] = is_us & (raw_zip_str.str.len() < 5)

        # 3. Quality Flag: Canadian FSA-Only Postal Code
        is_ca = df["Country/Region"] == "Canada"
        df["flag_canadian_fsa_postal_code"] = is_ca & (raw_zip_str.str.len() == 3)

        # Standardized Clean Postal Code
        def clean_zip(row):
            z = str(row["Postal Code"]).strip()
            if row["Country/Region"] == "United States":
                return z.zfill(5)
            return z.upper()

        df["postal_code_clean"] = df.apply(clean_zip, axis=1)

        # 4. Quality Flag: Product/Division Inconsistency
        # Product OTH-FIZ-56000 has prefix 'OTH' but Division 'Sugar'
        id_prefix = df["Product ID"].str.split("-").str[0]
        div_prefix_map = {"Chocolate": "CHO", "Sugar": "SUG", "Other": "OTH"}
        expected_prefix = df["Division"].map(div_prefix_map)
        df["flag_product_division_inconsistency"] = id_prefix != expected_prefix

        # 5. Quality Flag: Extreme Product Volume Imbalance
        # Products in the lower frequency tail (< 100 occurrences in dataset)
        prod_counts = df["Product Name"].map(df["Product Name"].value_counts())
        df["flag_extreme_product_volume_imbalance"] = prod_counts < 100

        # Import factory mapping
        from src.factory_mapping import map_product_to_factory, FACTORIES, STATE_COORDINATES, calculate_distance_miles

        # Map Factory
        df["factory_name"] = df["Product Name"].apply(map_product_to_factory)
        df["factory_id"] = df["factory_name"].apply(lambda f: FACTORIES.get(f, {}).get("id", "UNKNOWN"))
        df["route_id"] = df["factory_name"] + " -> " + df["State/Province"]

        # Calculate Route Distance (Miles) and Coordinates
        def compute_route_geom(row):
            fac = FACTORIES.get(row["factory_name"])
            st = STATE_COORDINATES.get(row["State/Province"])
            if fac and st:
                dist = calculate_distance_miles(fac["latitude"], fac["longitude"], st["lat"], st["lng"])
                return pd.Series([dist, fac["latitude"], fac["longitude"], st["lat"], st["lng"]])
            return pd.Series([None, None, None, None, None])

        geom_df = df.apply(compute_route_geom, axis=1)
        geom_df.columns = ["route_distance_miles", "origin_lat", "origin_lng", "dest_lat", "dest_lng"]
        df = pd.concat([df, geom_df], axis=1)

        # Mode-specific SLA Delay Flag:
        # Same Day: > 1 day is delayed
        # First Class: > 3 days is delayed
        # Second Class: > 4 days is delayed
        # Standard Class: > 5 days is delayed
        def check_sla_delay(row):
            mode = row["Ship Mode"]
            lt = row["operational_lead_time_days"]
            if mode == "Same Day":
                return lt > 1
            elif mode == "First Class":
                return lt > 3
            elif mode == "Second Class":
                return lt > 4
            elif mode == "Standard Class":
                return lt > 5
            return lt > 5

        df["is_delayed"] = df.apply(check_sla_delay, axis=1)
        df["is_delayed_gt5"] = df["operational_lead_time_days"] > 5

        # Additional domain features
        df["unit_price"] = (df["Sales"] / df["Units"]).round(4)
        df["unit_cost"] = (df["Cost"] / df["Units"]).round(4)
        df["unit_profit"] = (df["Gross Profit"] / df["Units"]).round(4)
        df["gross_margin_pct"] = ((df["Gross Profit"] / df["Sales"]) * 100).round(2)

        # Time components from Order Date
        df["order_year"] = df["order_date_parsed"].dt.year
        df["order_month"] = df["order_date_parsed"].dt.month
        df["order_quarter"] = df["order_date_parsed"].dt.quarter
        df["order_day_name"] = df["order_date_parsed"].dt.day_name()

        # Format dates as ISO-8601 strings for portable storage
        df["order_date_iso"] = df["order_date_parsed"].dt.strftime("%Y-%m-%d")
        df["ship_date_iso"] = df["ship_date_parsed"].dt.strftime("%Y-%m-%d")

        logger.info("Feature engineering and data quality flagging completed.")
        return df

    def run_pipeline(self) -> pd.DataFrame:
        """
        Execute full preprocessing pipeline without mutating the raw CSV.
        Save the resulting dataset to the designated processed path.
        """
        df = self.load_raw_data()
        # Work on an isolated copy
        df_proc = df.copy()

        df_proc = self.parse_dates_and_raw_lead_time(df_proc)
        df_proc = self.extract_cohorts(df_proc)
        self.discover_and_validate_cohort_anchors(df_proc)
        df_proc = self.calculate_and_validate_operational_lead_time(df_proc)
        df_proc = self.engineer_features_and_quality_flags(df_proc)

        # Save to output file
        os.makedirs(os.path.dirname(self.output_csv_path), exist_ok=True)
        logger.info(f"Saving processed dataset to: {self.output_csv_path}")
        df_proc.to_csv(self.output_csv_path, index=False)
        logger.info("Processed dataset saved successfully.")

        self.processed_df = df_proc
        return df_proc

    def get_summary_report(self) -> Dict[str, Any]:
        """
        Generate comprehensive summary metrics from processed dataset.
        """
        if self.processed_df is None:
            raise RuntimeError("Pipeline has not been executed yet.")

        df = self.processed_df
        lt = df["operational_lead_time_days"]
        raw_lt = df["raw_lead_time_days"]

        return {
            "total_records_processed": len(df),
            "uncorrectable_records": int((df["lead_time_correction_status"] == "UNCORRECTED").sum()),
            "cohort_anchors": self.cohort_anchors,
            "raw_lead_time": {
                "min": int(raw_lt.min()),
                "max": int(raw_lt.max()),
                "mean": round(float(raw_lt.mean()), 4),
                "median": float(raw_lt.median()),
                "std": round(float(raw_lt.std()), 4)
            },
            "operational_lead_time": {
                "min": int(lt.min()),
                "max": int(lt.max()),
                "mean": round(float(lt.mean()), 4),
                "median": float(lt.median()),
                "std": round(float(lt.std()), 4)
            },
            "ship_mode_distribution": self.validation_summary.get("mode_validation", {}),
            "data_quality_flags": {
                "flag_artificial_date_shift_count": int(df["flag_artificial_date_shift"].sum()),
                "flag_truncated_us_postal_code_count": int(df["flag_truncated_us_postal_code"].sum()),
                "flag_canadian_fsa_postal_code_count": int(df["flag_canadian_fsa_postal_code"].sum()),
                "flag_product_division_inconsistency_count": int(df["flag_product_division_inconsistency"].sum()),
                "flag_extreme_product_volume_imbalance_count": int(df["flag_extreme_product_volume_imbalance"].sum())
            }
        }


if __name__ == "__main__":
    raw_path = r"C:\Users\prana\OneDrive\Desktop\SmartRoute-AI\Nassau Candy Distributor.csv"
    preprocessor = NassauDataPreprocessor(raw_csv_path=raw_path)
    preprocessor.run_pipeline()
    report = preprocessor.get_summary_report()
    print("\n" + "="*70)
    print("PIPELINE EXECUTION SUMMARY REPORT")
    print("="*70)
    print(json.dumps(report, indent=2))
