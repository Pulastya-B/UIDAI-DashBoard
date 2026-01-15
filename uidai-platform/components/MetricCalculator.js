'use client';

import { useState } from 'react';
import { loadPyodide } from '@/lib/pyodide-loader';
import LoadingSpinner from './LoadingSpinner';
import { Download } from 'lucide-react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function MetricCalculator({ metricId, data }) {
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const states = data?.stateSummary ? [...new Set(data.stateSummary.map(d => d.state))].sort() : [];
  const districts = state && data?.districtDaily 
    ? [...new Set(data.districtDaily.filter(d => d.state === state).map(d => d.district))].sort()
    : [];

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const pyodide = await loadPyodide();
      
      const dataToUse = state ? data.districtDaily.filter(d => d.state === state) : data.districtDaily;
      pyodide.globals.set('data_json', JSON.stringify(dataToUse));
      pyodide.globals.set('state_filter', state || null);
      pyodide.globals.set('district_filter', district || null);

      const normalizeStateCode = `
def normalize_state_name(name):
    if pd.isna(name):
        return name
    name = str(name).strip()
    
    # Normalize to uppercase first, remove extra spaces
    name_upper = ' '.join(name.upper().split())
    
    # Master mappings
    mappings = {
        'WEST BENGAL': 'West Bengal',
        'WESTBENGAL': 'West Bengal',
        'WEST BANGAL': 'West Bengal',
        'WESTBANGAL': 'West Bengal',
        'WEST BENGLI': 'West Bengal',
        'WESTBENGLI': 'West Bengal',
        'ANDHRA PRADESH': 'Andhra Pradesh',
        'ANDHRAPRADESH': 'Andhra Pradesh',
        'MADHYA PRADESH': 'Madhya Pradesh',
        'MADHYAPRADESH': 'Madhya Pradesh',
        'HIMACHAL PRADESH': 'Himachal Pradesh',
        'HIMACHALPRADESH': 'Himachal Pradesh',
        'UTTAR PRADESH': 'Uttar Pradesh',
        'UTTARPRADESH': 'Uttar Pradesh',
        'TAMIL NADU': 'Tamil Nadu',
        'TAMILNADU': 'Tamil Nadu',
        'ARUNACHAL PRADESH': 'Arunachal Pradesh',
        'ARUNACHALPRADESH': 'Arunachal Pradesh',
        'JAMMU AND KASHMIR': 'Jammu and Kashmir',
        'JAMMUANDKASHMIR': 'Jammu and Kashmir',
        'DADRA AND NAGAR HAVELI': 'Dadra and Nagar Haveli',
        'DAMAN AND DIU': 'Daman and Diu'
    }
    
    if name_upper in mappings:
        return mappings[name_upper]
    
    # If not in mappings, return title case
    return name.title()
`;

      let code = '';
      
      if (metricId === 'dpi') {
        code = normalizeStateCode + `
import pandas as pd
import numpy as np
import json

df = pd.DataFrame(json.loads(data_json))
df['date'] = pd.to_datetime(df['date'])
df['state'] = df['state'].apply(normalize_state_name)

if state_filter:
    df = df[df['state'] == normalize_state_name(state_filter)]
if district_filter:
    df = df[df['district'] == district_filter]

df = df.sort_values('date')
df['total_updates'] = df['demo_child'] + df['demo_adult']
df['month'] = df['date'].dt.to_period('M')
monthly = df.groupby('month')['total_updates'].sum().reset_index()

total_months = len(monthly)
first_80_end = int(total_months * 0.8)
last_10_start = int(total_months * 0.9)
first_80_avg = monthly['total_updates'].iloc[:first_80_end].mean() if first_80_end > 0 else 0
last_10_avg = monthly['total_updates'].iloc[last_10_start:].mean() if last_10_start < len(monthly) else 0
dpi = (last_10_avg / first_80_avg) if first_80_avg > 0 else 0

result = {
    'dpi': float(dpi), 'first_80_avg': float(first_80_avg), 'last_10_avg': float(last_10_avg),
    'total_months': int(total_months),
    'interpretation': 'Severe Panic' if dpi > 5 else ('Moderate Panic' if dpi > 2 else 'Normal'),
    'chart_data': {'months': monthly['month'].astype(str).tolist(), 'values': monthly['total_updates'].tolist(), 'type': 'dpi'}
}
json.dumps(result)
`;
      } else if (metricId === 'bai') {
        code = normalizeStateCode + `
import pandas as pd
import json

df = pd.DataFrame(json.loads(data_json))
df['state'] = df['state'].apply(normalize_state_name)

if state_filter:
    df = df[df['state'] == normalize_state_name(state_filter)]
if district_filter:
    df = df[df['district'] == district_filter]

if not state_filter:
    state_bai = df.groupby('state').agg({'demo_child': 'sum', 'demo_adult': 'sum', 'bio_child': 'sum', 'bio_adult': 'sum'}).reset_index()
    state_bai['total_demo'] = state_bai['demo_child'] + state_bai['demo_adult']
    state_bai['total_bio'] = state_bai['bio_child'] + state_bai['bio_adult']
    state_bai['bai'] = state_bai['total_demo'] / (state_bai['total_bio'] + 1)
    state_bai = state_bai.sort_values('bai', ascending=False).head(15)
    chart_data = {'states': state_bai['state'].tolist(), 'values': state_bai['bai'].round(2).tolist(), 'type': 'bai'}
else:
    chart_data = None

total_demo = df['demo_child'].sum() + df['demo_adult'].sum()
total_bio = df['bio_child'].sum() + df['bio_adult'].sum()
bai = total_demo / (total_bio + 1)

result = {
    'bai': float(bai), 'total_demo': int(total_demo), 'total_bio': int(total_bio), 'ratio': f"{bai:.2f}:1",
    'risk_level': 'Critical' if bai > 3.0 else ('Moderate' if bai > 1.5 else 'Normal'), 'chart_data': chart_data
}
json.dumps(result)
`;
      } else if (metricId === 'sur') {
        code = normalizeStateCode + `
import pandas as pd
import json

df = pd.DataFrame(json.loads(data_json))
df['state'] = df['state'].apply(normalize_state_name)

if state_filter:
    df = df[df['state'] == normalize_state_name(state_filter)]
if district_filter:
    df = df[df['district'] == district_filter]

population = {'Uttar Pradesh': 200000000, 'Maharashtra': 112000000, 'Bihar': 104000000, 'West Bengal': 91000000,
              'Madhya Pradesh': 72000000, 'Tamil Nadu': 72000000, 'Rajasthan': 68000000, 'Karnataka': 61000000,
              'Gujarat': 60000000, 'Andhra Pradesh': 49000000}

if not state_filter:
    state_updates = df.groupby('state').agg({'demo_child': 'sum', 'demo_adult': 'sum', 'bio_child': 'sum', 'bio_adult': 'sum'}).reset_index()
    state_updates['total_updates'] = state_updates['demo_child'] + state_updates['demo_adult'] + state_updates['bio_child'] + state_updates['bio_adult']
    state_updates['population'] = state_updates['state'].map(population)
    state_updates = state_updates[state_updates['population'].notna()]
    state_updates['sur'] = state_updates['total_updates'] / state_updates['population']
    state_updates = state_updates.sort_values('sur', ascending=False)
    chart_data = {'states': state_updates['state'].tolist(), 'values': state_updates['sur'].round(4).tolist(), 'type': 'sur'}
    total_updates = df['demo_child'].sum() + df['demo_adult'].sum() + df['bio_child'].sum() + df['bio_adult'].sum()
    avg_sur = state_updates['sur'].mean()
else:
    total_updates = df['demo_child'].sum() + df['demo_adult'].sum() + df['bio_child'].sum() + df['bio_adult'].sum()
    state_pop = population.get(normalize_state_name(state_filter), 50000000)
    avg_sur = total_updates / state_pop
    chart_data = None

classification = 'Welfare State' if avg_sur > 0.15 else ('Mixed Economy' if avg_sur > 0.08 else 'Low Engagement')
result = {'sur': float(avg_sur), 'total_updates': int(total_updates), 'classification': classification, 'chart_data': chart_data}
json.dumps(result)
`;
      } else if (metricId === 'gfi') {
        code = normalizeStateCode + `
import pandas as pd
import json

df = pd.DataFrame(json.loads(data_json))
df['state'] = df['state'].apply(normalize_state_name)

if state_filter:
    df = df[df['state'] == normalize_state_name(state_filter)]
if district_filter:
    df = df[df['district'] == district_filter]

if not state_filter:
    state_gfi = df.groupby('state').agg({'enrol_infant': 'sum', 'enrol_child': 'sum', 'enrol_adult': 'sum',
                                         'demo_child': 'sum', 'demo_adult': 'sum', 'bio_child': 'sum', 'bio_adult': 'sum'}).reset_index()
    state_gfi['total_enrol'] = state_gfi['enrol_infant'] + state_gfi['enrol_child'] + state_gfi['enrol_adult']
    state_gfi['total_updates'] = state_gfi['demo_child'] + state_gfi['demo_adult'] + state_gfi['bio_child'] + state_gfi['bio_adult']
    state_gfi['gfi'] = state_gfi['total_enrol'] / (state_gfi['total_updates'] + 1)
    state_gfi = state_gfi.sort_values('gfi', ascending=False).head(15)
    chart_data = {'states': state_gfi['state'].tolist(), 'values': state_gfi['gfi'].round(2).tolist(), 'type': 'gfi'}
else:
    chart_data = None

total_enrol = df['enrol_infant'].sum() + df['enrol_child'].sum() + df['enrol_adult'].sum()
total_updates = df['demo_child'].sum() + df['demo_adult'].sum() + df['bio_child'].sum() + df['bio_adult'].sum()
gfi = total_enrol / (total_updates + 1)

result = {'gfi': float(gfi), 'total_enrol': int(total_enrol), 'total_updates': int(total_updates), 'ratio': f"{gfi:.2f}:1",
          'ghost_risk': 'Ghost Territory' if gfi > 5.0 else ('Moderate' if gfi > 2.0 else 'Active'), 'chart_data': chart_data}
json.dumps(result)
`;
      } else if (metricId === 'cci') {
        code = normalizeStateCode + `
import pandas as pd
import json

df = pd.DataFrame(json.loads(data_json))
df['state'] = df['state'].apply(normalize_state_name)

if state_filter:
    df = df[df['state'] == normalize_state_name(state_filter)]
if district_filter:
    df = df[df['district'] == district_filter]

if not state_filter:
    state_cci = df.groupby('state').agg({'demo_child': 'sum', 'demo_adult': 'sum', 'bio_child': 'sum', 'bio_adult': 'sum', 'district': 'nunique'}).reset_index()
    state_cci['total_ops'] = state_cci['demo_child'] + state_cci['demo_adult'] + state_cci['bio_child'] + state_cci['bio_adult']
    state_cci['approx_pincodes'] = state_cci['district'] * 5
    state_cci['cci'] = state_cci['total_ops'] / state_cci['approx_pincodes']
    state_cci = state_cci.sort_values('cci', ascending=False).head(15)
    chart_data = {'states': state_cci['state'].tolist(), 'values': state_cci['cci'].round(1).tolist(), 'type': 'cci'}
else:
    chart_data = None

total_ops = df['demo_child'].sum() + df['demo_adult'].sum() + df['bio_child'].sum() + df['bio_adult'].sum()
unique_districts = df['district'].nunique()
approx_pincodes = unique_districts * 5
cci = total_ops / approx_pincodes if approx_pincodes > 0 else 0

result = {'cci': float(cci), 'total_ops': int(total_ops), 'approx_pincodes': int(approx_pincodes),
          'congestion_level': 'Critical' if cci > 300 else ('High' if cci > 100 else 'Moderate'), 'chart_data': chart_data}
json.dumps(result)
`;
      } else if (metricId === 'mobility') {
        code = normalizeStateCode + `
import pandas as pd
import json

df = pd.DataFrame(json.loads(data_json))
df['state'] = df['state'].apply(normalize_state_name)

if state_filter:
    df = df[df['state'] == normalize_state_name(state_filter)]
if district_filter:
    df = df[df['district'] == district_filter]

if not state_filter:
    state_mobility = df.groupby('state').agg({'demo_child': 'sum', 'demo_adult': 'sum', 'bio_child': 'sum', 'bio_adult': 'sum',
                                              'enrol_infant': 'sum', 'enrol_child': 'sum', 'enrol_adult': 'sum'}).reset_index()
    state_mobility['demo_updates'] = state_mobility['demo_child'] + state_mobility['demo_adult']
    state_mobility['total_updates'] = state_mobility['demo_updates'] + state_mobility['bio_child'] + state_mobility['bio_adult']
    state_mobility['total_enrol'] = state_mobility['enrol_infant'] + state_mobility['enrol_child'] + state_mobility['enrol_adult']
    state_mobility['total_activity'] = state_mobility['total_updates'] + state_mobility['total_enrol']
    state_mobility['mobility'] = state_mobility['demo_updates'] / state_mobility['total_activity']
    state_mobility = state_mobility.sort_values('mobility', ascending=False).head(15)
    chart_data = {'states': state_mobility['state'].tolist(), 'values': (state_mobility['mobility'] * 100).round(1).tolist(), 'type': 'mobility'}
else:
    chart_data = None

demo_updates = df['demo_child'].sum() + df['demo_adult'].sum()
total_enrol = df['enrol_infant'].sum() + df['enrol_child'].sum() + df['enrol_adult'].sum()
total_updates = demo_updates + df['bio_child'].sum() + df['bio_adult'].sum()
total_activity = total_enrol + total_updates
mobility = demo_updates / total_activity if total_activity > 0 else 0

result = {'mobility_ratio': float(mobility), 'demo_updates': int(demo_updates), 'total_activity': int(total_activity),
          'percentage': f"{mobility * 100:.1f}%", 'migration_level': 'High Churn' if mobility > 0.7 else ('Moderate' if mobility > 0.4 else 'Stable'),
          'chart_data': chart_data}
json.dumps(result)
`;
      }

      const calculatedResult = await pyodide.runPythonAsync(code);
      const jsResult = typeof calculatedResult === 'string' ? JSON.parse(calculatedResult) : calculatedResult;
      setResult(jsResult);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">State (Optional)</label>
          <select value={state} onChange={(e) => { setState(e.target.value); setDistrict(''); setResult(null); }}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {state && (
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">District (Optional)</label>
            <select value={district} onChange={(e) => { setDistrict(e.target.value); setResult(null); }}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}
        <div className="flex items-end">
          <button onClick={handleCalculate} disabled={loading}
                  className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Calculating...' : 'Calculate Metric'}
          </button>
        </div>
      </div>

      {loading && <div className="flex justify-center py-8"><LoadingSpinner text="Running Python calculation..." /></div>}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-semibold">Calculation Error:</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {result && !loading && (
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-lg p-6 border-2 border-cyan-500 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">✅ Calculation Complete</h3>
          <p className="text-gray-600 mb-4">Results for {state || 'All States'}{district ? ` - ${district}` : ''}</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(result).map(([key, value]) => {
              if (key === 'chart_data') return null;
              return (
                <div key={key} className="bg-white rounded-lg p-4 shadow">
                  <p className="text-sm text-gray-600 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toFixed(2) : value}</p>
                </div>
              );
            })}
          </div>

          {result.chart_data && result.chart_data.type && (
            <div className="bg-white rounded-lg p-4 mt-4">
              <h4 className="font-bold mb-2">
                {result.chart_data.type === 'dpi' ? 'Temporal Pattern' : `Top 15 States by ${metricId.toUpperCase()}`}
              </h4>
              <Plot
                data={[{
                  x: result.chart_data.type === 'dpi' || ['bai', 'cci'].includes(result.chart_data.type) ? 
                     (result.chart_data.type === 'dpi' ? result.chart_data.months : result.chart_data.states) : 
                     result.chart_data.values,
                  y: result.chart_data.type === 'dpi' || ['bai', 'cci'].includes(result.chart_data.type) ? 
                     result.chart_data.values : 
                     result.chart_data.states,
                  type: result.chart_data.type === 'dpi' ? 'scatter' : 'bar',
                  mode: result.chart_data.type === 'dpi' ? 'lines+markers' : undefined,
                  orientation: ['bai', 'cci'].includes(result.chart_data.type) || result.chart_data.type === 'dpi' ? 'v' : 'h',
                  marker: { 
                    color: result.chart_data.type === 'bai' ? '#DC2626' : 
                           result.chart_data.type === 'sur' ? '#16A34A' :
                           result.chart_data.type === 'gfi' ? '#CA8A04' :
                           result.chart_data.type === 'cci' ? '#EA580C' :
                           result.chart_data.type === 'mobility' ? '#2563EB' : '#3B82F6'
                  },
                  line: result.chart_data.type === 'dpi' ? { width: 2 } : undefined
                }]}
                layout={{
                  autosize: true,
                  title: result.chart_data.type === 'dpi' ? 'Monthly Update Activity' : null,
                  xaxis: { 
                    title: result.chart_data.type === 'dpi' ? 'Month' : 
                           ['bai', 'cci'].includes(result.chart_data.type) ? 'State' : 
                           (result.chart_data.type === 'bai' ? 'BAI Score' :
                            result.chart_data.type === 'sur' ? 'SUR' :
                            result.chart_data.type === 'gfi' ? 'GFI Ratio' :
                            result.chart_data.type === 'cci' ? 'CCI Score' : 'Mobility %'),
                    tickangle: result.chart_data.type === 'dpi' || ['bai', 'cci'].includes(result.chart_data.type) ? 
                              (result.chart_data.type === 'dpi' ? 0 : -45) : 0
                  },
                  yaxis: { 
                    title: result.chart_data.type === 'dpi' ? 'Total Updates' : 
                           ['bai', 'cci'].includes(result.chart_data.type) ? 
                           (result.chart_data.type === 'bai' ? 'BAI Score' : 'CCI Score') : 'State'
                  },
                  margin: { t: 40, r: 20, b: ['bai', 'cci'].includes(result.chart_data.type) || result.chart_data.type === 'dpi' ? 100 : 60, l: 150 }
                }}
                useResizeHandler
                style={{ width: '100%', height: '500px' }}
              />
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${metricId}_result.json`;
                a.click();
              }}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              <Download size={18} />
              Download Result
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
