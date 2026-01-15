/**
 * Python-based metric calculations using Pyodide
 * These functions mirror your notebook logic exactly
 */

import { loadPyodide, runPython } from '../pyodide-loader';

/**
 * Calculate Deadline Panic Index (DPI)
 * Formula: Avg daily updates in final 10% / Avg daily updates in first 80%
 */
export async function calculateDPI(data, state = null, timeWindow = 'monthly') {
  const pyodide = await loadPyodide();
  
  pyodide.globals.set('data_json', JSON.stringify(data));
  pyodide.globals.set('state_filter', state);
  pyodide.globals.set('time_window', timeWindow);
  
  const code = `
import pandas as pd
import numpy as np
import json

# Load data
df = pd.DataFrame(json.loads(data_json))
df['date'] = pd.to_datetime(df['date'])

# Filter by state if specified
if state_filter:
    df = df[df['state'] == state_filter]

# Sort by date
df = df.sort_values('date')

# Calculate total updates
df['total_updates'] = df['demo_child'] + df['demo_adult']

# Group by time window
if time_window == 'monthly':
    df['period'] = df['date'].dt.to_period('M')
    grouped = df.groupby('period')['total_updates'].sum().reset_index()
elif time_window == 'quarterly':
    df['period'] = df['date'].dt.to_period('Q')
    grouped = df.groupby('period')['total_updates'].sum().reset_index()
else:  # daily
    grouped = df.groupby('date')['total_updates'].sum().reset_index()
    grouped.columns = ['period', 'total_updates']

# Calculate DPI
total_periods = len(grouped)
first_80_end = int(total_periods * 0.8)
last_10_start = int(total_periods * 0.9)

first_80_avg = grouped['total_updates'].iloc[:first_80_end].mean()
last_10_avg = grouped['total_updates'].iloc[last_10_start:].mean()

dpi = last_10_avg / first_80_avg if first_80_avg > 0 else 0

# Prepare result
result = {
    'dpi': float(dpi),
    'first_80_avg': float(first_80_avg),
    'last_10_avg': float(last_10_avg),
    'total_periods': int(total_periods),
    'interpretation': 'Severe Panic' if dpi > 5 else ('Moderate Panic' if dpi > 2 else 'Normal')
}

result
  `;
  
  return await runPython(code);
}

/**
 * Calculate Border Anxiety Index (BAI)
 * Formula: Total demographic updates / Total biometric updates
 */
export async function calculateBAI(data, state = null, district = null) {
  const pyodide = await loadPyodide();
  
  pyodide.globals.set('data_json', JSON.stringify(data));
  pyodide.globals.set('state_filter', state);
  pyodide.globals.set('district_filter', district);
  
  const code = `
import pandas as pd
import json

# Load data
df = pd.DataFrame(json.loads(data_json))

# Filter by state/district if specified
if state_filter:
    df = df[df['state'] == state_filter]
if district_filter:
    df = df[df['district'] == district_filter]

# Calculate totals
total_demo = df['demo_child'].sum() + df['demo_adult'].sum()
total_bio = df['bio_child'].sum() + df['bio_adult'].sum()

# BAI calculation (add 1 to avoid division by zero)
bai = total_demo / (total_bio + 1)

# Prepare result
result = {
    'bai': float(bai),
    'total_demo_updates': int(total_demo),
    'total_bio_updates': int(total_bio),
    'ratio': f"{bai:.2f}:1",
    'risk_level': 'Critical' if bai > 3.0 else ('Moderate' if bai > 1.5 else 'Normal')
}

result
  `;
  
  return await runPython(code);
}

/**
 * Calculate Subsistence Update Ratio (SUR)
 * Formula: Rural updates / Total updates
 */
export async function calculateSUR(data, pincodeThreshold = null) {
  const pyodide = await loadPyodide();
  
  pyodide.globals.set('data_json', JSON.stringify(data));
  pyodide.globals.set('pincode_threshold', pincodeThreshold);
  
  const code = `
import pandas as pd
import json

# Load data
df = pd.DataFrame(json.loads(data_json))

# Calculate pincode density per district
pincode_density = df.groupby(['state', 'district'])['pincode'].nunique().reset_index()
pincode_density.columns = ['state', 'district', 'pincode_count']

# Calculate demographic updates per district
district_demo = df.groupby(['state', 'district']).agg({
    'demo_child': 'sum',
    'demo_adult': 'sum'
}).reset_index()
district_demo['total_demo_updates'] = district_demo['demo_child'] + district_demo['demo_adult']

# Merge
district_profile = pincode_density.merge(district_demo, on=['state', 'district'])

# Determine threshold
if pincode_threshold is None:
    pincode_threshold = district_profile['pincode_count'].median()

# Classify rural/urban
district_profile['rural_urban'] = district_profile['pincode_count'].apply(
    lambda x: 'Rural' if x < pincode_threshold else 'Urban'
)

# Calculate SUR
rural_updates = district_profile[district_profile['rural_urban'] == 'Rural']['total_demo_updates'].sum()
total_updates = district_profile['total_demo_updates'].sum()

sur = rural_updates / total_updates if total_updates > 0 else 0

# Prepare result
result = {
    'sur': float(sur),
    'rural_updates': int(rural_updates),
    'urban_updates': int(total_updates - rural_updates),
    'total_updates': int(total_updates),
    'pincode_threshold': float(pincode_threshold),
    'classification': 'High Welfare' if sur > 0.7 else ('Mixed' if sur > 0.4 else 'Urban Dominant')
}

result
  `;
  
  return await runPython(code);
}

/**
 * Calculate Ghost Friction Index (GFI)
 * Formula: Total enrolments / Total updates
 */
export async function calculateGFI(data, state = null) {
  const pyodide = await loadPyodide();
  
  pyodide.globals.set('data_json', JSON.stringify(data));
  pyodide.globals.set('state_filter', state);
  
  const code = `
import pandas as pd
import json

# Load data
df = pd.DataFrame(json.loads(data_json))

# Filter by state if specified
if state_filter:
    df = df[df['state'] == state_filter]

# Calculate totals
total_enrolments = df['enrol_infant'].sum() + df['enrol_child'].sum() + df['enrol_adult'].sum()
total_updates = df['demo_child'].sum() + df['demo_adult'].sum() + df['bio_child'].sum() + df['bio_adult'].sum()

# GFI calculation
gfi = total_enrolments / (total_updates + 1)

# Prepare result
result = {
    'gfi': float(gfi),
    'total_enrolments': int(total_enrolments),
    'total_updates': int(total_updates),
    'ratio': f"{gfi:.2f}:1",
    'ghost_risk': 'Ghost Territory' if gfi > 5.0 else ('Moderate' if gfi > 2.0 else 'Active')
}

result
  `;
  
  return await runPython(code);
}

/**
 * Calculate Center Congestion Index (CCI)
 * Formula: Operations per pincode (OVA Ratio)
 */
export async function calculateCCI(data, state = null) {
  const pyodide = await loadPyodide();
  
  pyodide.globals.set('data_json', JSON.stringify(data));
  pyodide.globals.set('state_filter', state);
  
  const code = `
import pandas as pd
import json

# Load data
df = pd.DataFrame(json.loads(data_json))

# Filter by state if specified
if state_filter:
    df = df[df['state'] == state_filter]

# Calculate total operations and unique pincodes per district
district_ops = df.groupby(['state', 'district']).agg({
    'demo_child': 'sum',
    'demo_adult': 'sum',
    'bio_child': 'sum',
    'bio_adult': 'sum',
    'pincode': 'nunique'
}).reset_index()

district_ops['total_ops'] = (
    district_ops['demo_child'] + 
    district_ops['demo_adult'] + 
    district_ops['bio_child'] + 
    district_ops['bio_adult']
)

# CCI = Operations per pincode
district_ops['cci'] = district_ops['total_ops'] / (district_ops['pincode'] + 1)

# Overall CCI
total_ops = district_ops['total_ops'].sum()
total_pincodes = df['pincode'].nunique()
overall_cci = total_ops / total_pincodes if total_pincodes > 0 else 0

# Prepare result
result = {
    'cci': float(overall_cci),
    'total_operations': int(total_ops),
    'unique_pincodes': int(total_pincodes),
    'ops_per_pincode': float(overall_cci),
    'congestion_level': 'Critical' if overall_cci > 300 else ('High' if overall_cci > 100 else 'Moderate')
}

result
  `;
  
  return await runPython(code);
}

/**
 * Calculate Mobility Ratio
 * Formula: Demographic updates / Total activity
 */
export async function calculateMobilityRatio(data, state = null) {
  const pyodide = await loadPyodide();
  
  pyodide.globals.set('data_json', JSON.stringify(data));
  pyodide.globals.set('state_filter', state);
  
  const code = `
import pandas as pd
import json

# Load data
df = pd.DataFrame(json.loads(data_json))

# Filter by state if specified
if state_filter:
    df = df[df['state'] == state_filter]

# Calculate components
demo_updates = df['demo_child'].sum() + df['demo_adult'].sum()
total_enrolments = df['enrol_infant'].sum() + df['enrol_child'].sum() + df['enrol_adult'].sum()
total_updates = demo_updates + df['bio_child'].sum() + df['bio_adult'].sum()
total_activity = total_enrolments + total_updates

# Mobility ratio
mobility_ratio = demo_updates / total_activity if total_activity > 0 else 0

# Prepare result
result = {
    'mobility_ratio': float(mobility_ratio),
    'demo_updates': int(demo_updates),
    'total_activity': int(total_activity),
    'percentage': f"{mobility_ratio * 100:.1f}%",
    'migration_level': 'High Churn' if mobility_ratio > 0.7 else ('Moderate' if mobility_ratio > 0.4 else 'Stable')
}

result
  `;
  
  return await runPython(code);
}

/**
 * Calculate Composite Risk Score
 * Combines DPI, BAI, SUR, CCI with equal weighting
 */
export async function calculateCompositeRisk(data, weights = null) {
  const pyodide = await loadPyodide();
  
  pyodide.globals.set('data_json', JSON.stringify(data));
  pyodide.globals.set('weights_json', weights ? JSON.stringify(weights) : null);
  
  const code = `
import pandas as pd
import numpy as np
import json
from sklearn.preprocessing import MinMaxScaler

# Load data
df = pd.DataFrame(json.loads(data_json))

# Calculate all metrics by state
states = df['state'].unique()
results = []

for state in states:
    state_df = df[df['state'] == state]
    
    # DPI calculation (simplified)
    state_df_sorted = state_df.sort_values('date')
    total_periods = len(state_df_sorted)
    first_80_end = int(total_periods * 0.8)
    last_10_start = int(total_periods * 0.9)
    
    state_df_sorted['total_updates'] = state_df_sorted['demo_child'] + state_df_sorted['demo_adult']
    dpi = (state_df_sorted['total_updates'].iloc[last_10_start:].mean() / 
           state_df_sorted['total_updates'].iloc[:first_80_end].mean()) if first_80_end > 0 else 0
    
    # BAI calculation
    total_demo = state_df['demo_child'].sum() + state_df['demo_adult'].sum()
    total_bio = state_df['bio_child'].sum() + state_df['bio_adult'].sum()
    bai = total_demo / (total_bio + 1)
    
    # SUR calculation (pincode density proxy)
    pincode_count = state_df['pincode'].nunique()
    sur = 1.0 / (1.0 + np.log1p(pincode_count))  # Inverse relationship
    
    # CCI calculation
    total_ops = total_demo + total_bio
    cci = total_ops / (pincode_count + 1)
    
    results.append({
        'state': state,
        'dpi': dpi,
        'bai': bai,
        'sur': sur,
        'cci': cci
    })

results_df = pd.DataFrame(results)

# Normalize metrics
scaler = MinMaxScaler()
results_df[['dpi_norm', 'bai_norm', 'sur_norm', 'cci_norm']] = scaler.fit_transform(
    results_df[['dpi', 'bai', 'sur', 'cci']]
)

# Calculate composite risk
if weights_json:
    w = json.loads(weights_json)
    results_df['composite_risk'] = (
        results_df['dpi_norm'] * w.get('dpi', 0.25) +
        results_df['bai_norm'] * w.get('bai', 0.25) +
        results_df['sur_norm'] * w.get('sur', 0.25) +
        results_df['cci_norm'] * w.get('cci', 0.25)
    )
else:
    results_df['composite_risk'] = (
        results_df['dpi_norm'] * 0.25 +
        results_df['bai_norm'] * 0.25 +
        results_df['sur_norm'] * 0.25 +
        results_df['cci_norm'] * 0.25
    )

# Add risk levels
def get_risk_level(score):
    if score > 0.75:
        return 'CRITICAL'
    elif score > 0.5:
        return 'HIGH'
    elif score > 0.25:
        return 'MODERATE'
    else:
        return 'LOW'

results_df['risk_level'] = results_df['composite_risk'].apply(get_risk_level)

# Sort by risk
results_df = results_df.sort_values('composite_risk', ascending=False)

# Convert to dict
results_df.to_dict('records')
  `;
  
  return await runPython(code);
}
