'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, TrendingUp } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { loadPyodide } from '@/lib/pyodide-loader';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ThreatIntelligencePage() {
  const [data, setData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    // Load data
    Promise.all([
      fetch('/data/state_summary.json').then(res => res.json()),
      fetch('/data/district_daily.json').then(res => res.json())
    ]).then(([stateSummary, districtDaily]) => {
      setData({ stateSummary, districtDaily });
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load data:', err);
      setLoading(false);
    });
  }, []);

  const calculateCompositeRisk = async () => {
    if (!data) return;
    
    setCalculating(true);
    try {
      const pyodide = await loadPyodide();
      pyodide.globals.set('data_json', JSON.stringify(data.districtDaily));
      
      const code = `
import pandas as pd
import numpy as np
import json

# Install sklearn if not available
try:
    from sklearn.preprocessing import MinMaxScaler
except ImportError:
    import micropip
    await micropip.install('scikit-learn')
    from sklearn.preprocessing import MinMaxScaler

df = pd.DataFrame(json.loads(data_json))
states = df['state'].unique()
results = []

for state in states:
    state_df = df[df['state'] == state]
    
    # BAI
    total_demo = state_df['demo_child'].sum() + state_df['demo_adult'].sum()
    total_bio = state_df['bio_child'].sum() + state_df['bio_adult'].sum()
    bai = total_demo / (total_bio + 1)
    
    # GFI
    total_enrol = state_df['enrol_infant'].sum() + state_df['enrol_child'].sum() + state_df['enrol_adult'].sum()
    total_updates = total_demo + total_bio
    gfi = total_enrol / (total_updates + 1)
    
    # DPI (simplified)
    state_df['date'] = pd.to_datetime(state_df['date'])
    state_df = state_df.sort_values('date')
    state_df['total_updates'] = state_df['demo_child'] + state_df['demo_adult']
    
    monthly = state_df.groupby(state_df['date'].dt.to_period('M'))['total_updates'].sum()
    if len(monthly) > 10:
        first_80_end = int(len(monthly) * 0.8)
        last_10_start = int(len(monthly) * 0.9)
        dpi = monthly.iloc[last_10_start:].mean() / monthly.iloc[:first_80_end].mean() if monthly.iloc[:first_80_end].mean() > 0 else 0
    else:
        dpi = 1.0
    
    # CCI (approximation)
    unique_districts = state_df['district'].nunique()
    total_ops = total_updates + total_enrol
    cci = total_ops / (unique_districts * 5)  # Approximate pincodes
    
    results.append({
        'state': state,
        'bai': float(bai),
        'gfi': float(gfi),
        'dpi': float(dpi),
        'cci': float(cci),
        'total_activity': int(total_ops)
    })

results_df = pd.DataFrame(results)

# Normalize
scaler = MinMaxScaler()
results_df[['bai_norm', 'gfi_norm', 'dpi_norm', 'cci_norm']] = scaler.fit_transform(
    results_df[['bai', 'gfi', 'dpi', 'cci']]
)

# Composite risk
results_df['composite_risk'] = (
    results_df['bai_norm'] * 0.3 +  # Border anxiety (30%)
    results_df['gfi_norm'] * 0.2 +  # Ghost IDs (20%)
    results_df['dpi_norm'] * 0.2 +  # Deadline panic (20%)
    results_df['cci_norm'] * 0.3    # Infrastructure stress (30%)
)

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
results_df = results_df.sort_values('composite_risk', ascending=False)

results_df.to_dict('records')
      `;
      
      const result = await pyodide.runPythonAsync(code);
      console.log('Risk calculation result:', result);
      console.log('Result type:', typeof result);
      
      // Convert Pyodide proxy to JS array
      let jsResult;
      if (result.toJs) {
        jsResult = result.toJs({ dict_converter: Object.fromEntries });
      } else if (Array.isArray(result)) {
        jsResult = result;
      } else {
        jsResult = JSON.parse(JSON.stringify(result));
      }
      
      console.log('Converted result:', jsResult);
      setRiskData(Array.isArray(jsResult) ? jsResult : [jsResult]);
      
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (data && !riskData) {
      calculateCompositeRisk();
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner text="Loading threat intelligence data..." />
      </div>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-900 text-white';
      case 'HIGH': return 'bg-orange-600 text-white';
      case 'MODERATE': return 'bg-yellow-500 text-gray-900';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <h1 className="text-5xl font-bold text-white">
              National Threat Intelligence
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            Composite Risk Assessment Across Indian States
          </p>
          <p className="text-gray-400">
            Combining 4 dimensions: Border Anxiety + Ghost IDs + Deadline Panic + Infrastructure Stress
          </p>
        </div>

        {/* Methodology */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-gray-800 border border-red-500 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Risk Calculation Methodology</h2>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-red-400 font-bold mb-1">BAI (30%)</div>
                <div className="text-gray-300">Border anxiety & identity verification patterns</div>
              </div>
              <div>
                <div className="text-orange-400 font-bold mb-1">GFI (20%)</div>
                <div className="text-gray-300">Ghost ID risk & user engagement</div>
              </div>
              <div>
                <div className="text-yellow-400 font-bold mb-1">DPI (20%)</div>
                <div className="text-gray-300">Deadline panic & compliance stress</div>
              </div>
              <div>
                <div className="text-teal-400 font-bold mb-1">CCI (30%)</div>
                <div className="text-gray-300">Infrastructure congestion & fraud risk</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        {calculating && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-gray-800 border border-yellow-500 rounded-xl p-8 text-center">
              <LoadingSpinner text="Calculating composite risk scores across all states..." />
              <p className="text-gray-400 mt-4">This may take 10-15 seconds...</p>
              <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
                <span>✓ Loading Pyodide</span>
                <span>✓ Installing scikit-learn</span>
                <span>⏳ Normalizing metrics</span>
                <span>⏳ Computing composite scores</span>
              </div>
            </div>
          </div>
        )}

        {riskData && !calculating && (
          <>
            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid md:grid-cols-4 gap-4">
                {['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(level => {
                  const count = riskData.filter(d => d.risk_level === level).length;
                  return (
                    <div key={level} className={`${getRiskColor(level)} rounded-lg p-6 text-center`}>
                      <div className="text-4xl font-bold mb-2">{count}</div>
                      <div className="font-semibold">{level} RISK</div>
                      <div className="text-sm opacity-80">States/UTs</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 20 High-Risk States */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <MapPin className="text-red-500" />
                  Top 20 High-Risk States
                </h2>
                
                <div className="space-y-2">
                  {riskData.slice(0, 20).map((state, idx) => (
                    <div 
                      key={state.state}
                      className="bg-gray-900 rounded-lg p-4 border-l-4"
                      style={{ 
                        borderLeftColor: state.composite_risk > 0.75 ? '#DC2626' : 
                                        state.composite_risk > 0.5 ? '#F97316' : 
                                        state.composite_risk > 0.25 ? '#FBBF24' : '#10B981'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-gray-500 w-8">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">
                              {state.state}
                            </div>
                            <div className="text-sm text-gray-400">
                              BAI: {state.bai?.toFixed(2) || 'N/A'} | GFI: {state.gfi?.toFixed(2) || 'N/A'} | DPI: {state.dpi?.toFixed(2) || 'N/A'} | CCI: {state.cci?.toFixed(0) || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white mb-1">
                            {state.composite_risk ? (state.composite_risk * 100).toFixed(0) : '0'}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(state.risk_level)}`}>
                            {state.risk_level || 'UNKNOWN'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Risk bar */}
                      <div className="mt-3 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"
                          style={{ width: `${state.composite_risk ? state.composite_risk * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Heatmap Chart */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="text-red-500" />
                  Composite Risk Score Distribution
                </h2>
                
                <Plot
                  data={[{
                    x: riskData.map(d => d.state),
                    y: riskData.map(d => d.composite_risk * 100),
                    type: 'bar',
                    marker: {
                      color: riskData.map(d => 
                        d.composite_risk > 0.75 ? '#DC2626' :
                        d.composite_risk > 0.5 ? '#F97316' :
                        d.composite_risk > 0.25 ? '#FBBF24' : '#10B981'
                      )
                    },
                    text: riskData.map(d => d.risk_level),
                    textposition: 'outside'
                  }]}
                  layout={{
                    title: 'State-wise Composite Risk Scores',
                    xaxis: { 
                      title: 'State',
                      tickangle: -45,
                      color: '#fff'
                    },
                    yaxis: { 
                      title: 'Risk Score (0-100)',
                      color: '#fff'
                    },
                    paper_bgcolor: '#1F2937',
                    plot_bgcolor: '#111827',
                    font: { color: '#fff' },
                    margin: { b: 150 },
                    shapes: [
                      { type: 'line', y0: 75, y1: 75, x0: -1, x1: riskData.length, line: { color: '#DC2626', width: 2, dash: 'dash' } },
                      { type: 'line', y0: 50, y1: 50, x0: -1, x1: riskData.length, line: { color: '#F97316', width: 2, dash: 'dash' } },
                      { type: 'line', y0: 25, y1: 25, x0: -1, x1: riskData.length, line: { color: '#FBBF24', width: 2, dash: 'dash' } }
                    ]
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '600px' }}
                />
              </div>
            </div>
          </>
        )}

        {calculating && (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Calculating composite risk scores..." />
          </div>
        )}
      </div>
    </div>
  );
}
