"""
Data Preparation Script for UIDAI Platform
Converts raw UIDAI CSV datasets to JSON for web deployment
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
import glob
import warnings
warnings.filterwarnings('ignore')

# Configuration
# Script is in: uidai-platform/scripts/
# Data is in: ../api_data_aadhar_*/
BASE_DIR = Path(__file__).parent.parent.parent  # Goes to "Data Analysis for UIDAI"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print(f"\nSearching for CSV files in: {BASE_DIR}")
print(f"Output directory: {OUTPUT_DIR}")

print("="*70)
print("UIDAI PLATFORM DATA PREPARATION")
print("="*70)

def compress_dataframe(df, max_records=None):
    """Optimize DataFrame for web deployment"""
    # Sample if too large
    if max_records and len(df) > max_records:
        print(f"  Sampling {max_records:,} records from {len(df):,}")
        df = df.sample(n=max_records, random_state=42)
    
    # Optimize dtypes
    for col in df.columns:
        if df[col].dtype == 'float64':
            df[col] = df[col].astype('float32')
        elif df[col].dtype == 'int64':
            df[col] = df[col].astype('int32')
    
    return df

def export_to_json(df, filename, compress=True):
    """Export DataFrame to optimized JSON"""
    output_path = OUTPUT_DIR / filename
    
    if compress:
        df.to_json(output_path, orient='records', date_format='iso')
    else:
        df.to_json(output_path, orient='records', indent=2, date_format='iso')
    
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"  ✓ {filename}: {len(df):,} records, {size_mb:.2f} MB")
    
    return output_path

# ============================================================================
# STEP 1: Load raw UIDAI datasets from chunked CSVs
# ============================================================================
print("\n[STEP 1] Loading raw UIDAI datasets...")

try:
    # Load biometric data
    bio_files = sorted(glob.glob(str(BASE_DIR / "api_data_aadhar_biometric" / "*.csv")))
    print(f"\nLoading {len(bio_files)} biometric files...")
    bio_dfs = []
    for f in bio_files:
        df = pd.read_csv(f)
        bio_dfs.append(df)
        print(f"  ✓ {Path(f).name}: {len(df):,} records")
    bio_df = pd.concat(bio_dfs, ignore_index=True)
    print(f"✓ Total biometric records: {len(bio_df):,}")
    
    # Load demographic data
    demo_files = sorted(glob.glob(str(BASE_DIR / "api_data_aadhar_demographic" / "*.csv")))
    print(f"\nLoading {len(demo_files)} demographic files...")
    demo_dfs = []
    for f in demo_files:
        df = pd.read_csv(f)
        demo_dfs.append(df)
        print(f"  ✓ {Path(f).name}: {len(df):,} records")
    demo_df = pd.concat(demo_dfs, ignore_index=True)
    print(f"✓ Total demographic records: {len(demo_df):,}")
    
    # Load enrolment data
    enrol_files = sorted(glob.glob(str(BASE_DIR / "api_data_aadhar_enrolment" / "*.csv")))
    print(f"\nLoading {len(enrol_files)} enrolment files...")
    enrol_dfs = []
    for f in enrol_files:
        df = pd.read_csv(f)
        enrol_dfs.append(df)
        print(f"  ✓ {Path(f).name}: {len(df):,} records")
    enrol_df = pd.concat(enrol_dfs, ignore_index=True)
    print(f"✓ Total enrolment records: {len(enrol_df):,}")
    
except Exception as e:
    print(f"\n❌ Error loading datasets: {e}")
    print("\nExpected folder structure:")
    print("  Data Analysis for UIDAI/")
    print("    api_data_aadhar_biometric/*.csv")
    print("    api_data_aadhar_demographic/*.csv")
    print("    api_data_aadhar_enrolment/*.csv")
    import sys
    sys.exit(1)

# ============================================================================
# STEP 2: Parse dates and standardize
# ============================================================================
print("\n[STEP 2] Parsing dates and standardizing...")

# Parse dates (already in 'date' column from CSVs)
demo_df['date'] = pd.to_datetime(demo_df['date'], errors='coerce')
bio_df['date'] = pd.to_datetime(bio_df['date'], errors='coerce')
enrol_df['date'] = pd.to_datetime(enrol_df['date'], errors='coerce')

# Rename columns to match expected format
# Demographic: demo_age_5_17 (child), demo_age_17_ (adult)
demo_df = demo_df.rename(columns={
    'demo_age_5_17': 'demo_child',
    'demo_age_17_': 'demo_adult'
})

# Biometric: bio_age_5_17 (child), bio_age_17_ (adult)
bio_df = bio_df.rename(columns={
    'bio_age_5_17': 'bio_child',
    'bio_age_17_': 'bio_adult'
})

# Enrolment: age_0_5 (infant), age_5_17 (child), age_18_greater (adult)
enrol_df = enrol_df.rename(columns={
    'age_0_5': 'enrol_infant',
    'age_5_17': 'enrol_child',
    'age_18_greater': 'enrol_adult'
})

print(f"✓ Date parsing complete")
print(f"  Demo NaT: {demo_df['date'].isna().sum()} ({demo_df['date'].isna().mean()*100:.2f}%)")
print(f"  Bio NaT: {bio_df['date'].isna().sum()} ({bio_df['date'].isna().mean()*100:.2f}%)")
print(f"  Enrol NaT: {enrol_df['date'].isna().sum()} ({enrol_df['date'].isna().mean()*100:.2f}%)")

# ============================================================================
# STEP 3: Create district-daily aggregation (like your notebook)
# ============================================================================
print("\n[STEP 3] Creating district-daily aggregation...")

# Select needed columns
demo_clean = demo_df[['date', 'state', 'district', 'pincode', 'demo_child', 'demo_adult']].copy()
bio_clean = bio_df[['date', 'state', 'district', 'pincode', 'bio_child', 'bio_adult']].copy()
enrol_clean = enrol_df[['date', 'state', 'district', 'pincode', 'enrol_infant', 'enrol_child', 'enrol_adult']].copy()

# Aggregate by (date, state, district) - remove pincode to avoid math errors
district_daily = demo_clean.groupby(['date', 'state', 'district']).agg({
    'demo_child': 'sum',
    'demo_adult': 'sum'
}).reset_index()

bio_daily = bio_clean.groupby(['date', 'state', 'district']).agg({
    'bio_child': 'sum',
    'bio_adult': 'sum'
}).reset_index()

enrol_daily = enrol_clean.groupby(['date', 'state', 'district']).agg({
    'enrol_infant': 'sum',
    'enrol_child': 'sum',
    'enrol_adult': 'sum'
}).reset_index()

# Merge all three
district_daily_df = district_daily.merge(bio_daily, on=['date', 'state', 'district'], how='outer')
district_daily_df = district_daily_df.merge(enrol_daily, on=['date', 'state', 'district'], how='outer')
district_daily_df = district_daily_df.fillna(0)

print(f"✓ District daily aggregation: {len(district_daily_df):,} records")
print(f"  Date range: {district_daily_df['date'].min()} to {district_daily_df['date'].max()}")
print(f"  States: {district_daily_df['state'].nunique()}")
print(f"  Districts: {district_daily_df['district'].nunique()}")

# ============================================================================
# STEP 4: Create aggregated views for faster loading
# ============================================================================
print("\n[STEP 4] Creating aggregated views...")

# State-level summary
state_summary = district_daily_df.groupby('state').agg({
    'demo_child': 'sum',
    'demo_adult': 'sum',
    'bio_child': 'sum',
    'bio_adult': 'sum',
    'enrol_infant': 'sum',
    'enrol_child': 'sum',
    'enrol_adult': 'sum',
}).reset_index()

export_to_json(state_summary, 'state_summary.json', compress=True)

# District-level summary
district_summary = district_daily_df.groupby(['state', 'district']).agg({
    'demo_child': 'sum',
    'demo_adult': 'sum',
    'bio_child': 'sum',
    'bio_adult': 'sum',
    'enrol_infant': 'sum',
    'enrol_child': 'sum',
    'enrol_adult': 'sum',
}).reset_index()

export_to_json(district_summary, 'district_summary.json', compress=True)

# Time-series (monthly aggregation for faster loading)
district_daily_df['month'] = district_daily_df['date'].dt.to_period('M').astype(str)

monthly_summary = district_daily_df.groupby(['state', 'district', 'month']).agg({
    'demo_child': 'sum',
    'demo_adult': 'sum',
    'bio_child': 'sum',
    'bio_adult': 'sum',
    'enrol_infant': 'sum',
    'enrol_child': 'sum',
    'enrol_adult': 'sum',
}).reset_index()

export_to_json(monthly_summary, 'monthly_summary.json', compress=True)

# Full district daily (compressed - sample if too large)
district_daily_compressed = compress_dataframe(
    district_daily_df.copy(), 
    max_records=100000  # Increased limit for more data
)
export_to_json(district_daily_compressed, 'district_daily.json', compress=True)

# ============================================================================
# STEP 5: Export metadata
# ============================================================================
print("\n[STEP 5] Creating metadata...")

metadata = {
    'generated_at': pd.Timestamp.now().isoformat(),
    'datasets': {
        'state_summary': {
            'records': len(state_summary),
            'columns': list(state_summary.columns),
            'description': 'State-level aggregated metrics'
        },
        'district_summary': {
            'records': len(district_summary),
            'columns': list(district_summary.columns),
            'description': 'District-level aggregated metrics'
        },
        'monthly_summary': {
            'records': len(monthly_summary),
            'columns': list(monthly_summary.columns),
            'description': 'Monthly time-series by district'
        },
        'district_daily': {
            'records': len(district_daily_compressed),
            'columns': list(district_daily_compressed.columns),
            'description': 'Daily district-level data (sampled if >50k records)'
        }
    },
    'date_range': {
        'start': district_daily_df['date'].min().isoformat(),
        'end': district_daily_df['date'].max().isoformat()
    },
    'coverage': {
        'states': int(district_daily_df['state'].nunique()),
        'districts': int(district_daily_df['district'].nunique()),
        'total_records': int(len(district_daily_df))
    }
}

with open(OUTPUT_DIR / 'metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print(f"  ✓ metadata.json")

# ============================================================================
# STEP 4: Summary
# ============================================================================
print("\n" + "="*70)
print("✅ DATA PREPARATION COMPLETE")
print("="*70)
print(f"\nOutput directory: {OUTPUT_DIR}")
print(f"Total files created: 5")
print(f"\nNext steps:")
print(f"  1. Copy the 'public' folder to your Next.js project")
print(f"  2. Run: npm install")
print(f"  3. Run: npm run dev")
print(f"  4. Open: http://localhost:3000")
print("="*70)
