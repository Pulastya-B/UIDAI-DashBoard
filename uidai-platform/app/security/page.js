'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Map } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { loadPyodide } from '@/lib/pyodide-loader';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const BORDER_STATES = [
  'West Bengal', 'Assam', 'Jammu and Kashmir', 'Punjab', 
  'Rajasthan', 'Tripura', 'Meghalaya', 'Manipur'
];

export default function SecurityDashboardPage() {
  const [data, setData] = useState(null);
  const [securityMetrics, setSecurityMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/data/state_summary.json').then(res => res.json()),
      fetch('/data/district_summary.json').then(res => res.json())
    ]).then(([stateSummary, districtSummary]) => {
      setData({ stateSummary, districtSummary });
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load data:', err);
      setLoading(false);
    });
  }, []);

  const calculateSecurityMetrics = async () => {
    if (!data) return;
    
    setCalculating(true);
    try {
      const pyodide = await loadPyodide();
      pyodide.globals.set('data_json', JSON.stringify(data.districtSummary));
      pyodide.globals.set('border_states', JSON.stringify(BORDER_STATES));
      
      const code = `
import pandas as pd
import json

df = pd.DataFrame(json.loads(data_json))
border_states_list = json.loads(border_states)

results = []

for state in df['state'].unique():
    state_df = df[df['state'] == state]
    
    total_demo = state_df['demo_child'].sum() + state_df['demo_adult'].sum()
    total_bio = state_df['bio_child'].sum() + state_df['bio_adult'].sum()
    total_enrol = state_df['enrol_infant'].sum() + state_df['enrol_child'].sum() + state_df['enrol_adult'].sum()
    
    bai = total_demo / (total_bio + 1)
    gfi = total_enrol / ((total_demo + total_bio) + 1)
    
    is_border = state in border_states_list
    risk_score = (bai * 0.6 + gfi * 0.4) * (1.5 if is_border else 1.0)
    
    results.append({
        'state': state,
        'bai': float(bai),
        'gfi': float(gfi),
        'risk_score': float(risk_score),
        'is_border': is_border,
        'total_demo': int(total_demo),
        'total_bio': int(total_bio),
        'total_enrol': int(total_enrol)
    })

results_df = pd.DataFrame(results)
results_df = results_df.sort_values('risk_score', ascending=False)

json.dumps(results_df.to_dict('records'))
      `;
      
      const result = await pyodide.runPythonAsync(code);
      const jsResult = typeof result === 'string' ? JSON.parse(result) : result;
      setSecurityMetrics(jsResult);
      
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (data && !securityMetrics) {
      calculateSecurityMetrics();
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner text="Loading security data..." />
      </div>
    );
  }

  const getRiskColor = (score) => {
    if (score > 3) return 'bg-red-600';
    if (score > 2) return 'bg-orange-600';
    if (score > 1) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-red-400" />
            <h1 className="text-5xl font-bold text-white">
              National Security Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            Border State Monitoring & Identity Verification Analysis
          </p>
          <p className="text-gray-400">
            BAI (Border Anxiety) + GFI (Ghost ID Factor) = Composite Risk Score
          </p>
        </div>

        {calculating && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <LoadingSpinner text="Calculating security metrics..." />
            </div>
          </div>
        )}

        {securityMetrics && !calculating && (
          <>
            {/* Border States Alert */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-red-900 border border-red-600 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Border State Priority</h3>
                    <p className="text-red-200 mb-3">
                      {BORDER_STATES.length} states with international borders receive 1.5× risk multiplier due to heightened security concerns.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {BORDER_STATES.map(state => (
                        <span key={state} className="bg-red-800 text-red-100 px-3 py-1 rounded-full text-sm">
                          {state}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top 20 High-Risk States */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Map className="text-red-400" />
                  Top 20 Security Hotspots
                </h2>
                
                <div className="space-y-3">
                  {securityMetrics.slice(0, 20).map((state, idx) => (
                    <div 
                      key={state.state}
                      className="bg-gray-900 rounded-lg p-4 border-l-4"
                      style={{ borderLeftColor: state.risk_score > 3 ? '#DC2626' : state.risk_score > 2 ? '#F97316' : '#FBBF24' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-gray-500 w-8">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-white">{state.state}</span>
                              {state.is_border && (
                                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                                  BORDER
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              BAI: {state.bai.toFixed(2)} | GFI: {state.gfi.toFixed(2)} | Demo: {state.total_demo.toLocaleString()} | Bio: {state.total_bio.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white mb-1">
                            {state.risk_score.toFixed(2)}
                          </div>
                          <div className={`${getRiskColor(state.risk_score)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                            {state.risk_score > 3 ? 'CRITICAL' : state.risk_score > 2 ? 'HIGH' : 'MODERATE'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Risk bar */}
                      <div className="mt-3 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"
                          style={{ width: `${Math.min(state.risk_score / 5 * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BAI vs GFI Scatter Plot */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  BAI vs GFI Correlation
                </h2>
                
                <Plot
                  data={[{
                    x: securityMetrics.map(d => d.bai),
                    y: securityMetrics.map(d => d.gfi),
                    mode: 'markers',
                    type: 'scatter',
                    marker: {
                      size: 12,
                      color: securityMetrics.map(d => d.is_border ? '#DC2626' : '#3B82F6'),
                      line: { color: '#fff', width: 1 }
                    },
                    text: securityMetrics.map(d => d.state),
                    hovertemplate: '<b>%{text}</b><br>BAI: %{x:.2f}<br>GFI: %{y:.2f}<extra></extra>'
                  }]}
                  layout={{
                    title: 'Security Risk Matrix',
                    xaxis: { 
                      title: 'BAI (Border Anxiety Index)',
                      color: '#fff',
                      gridcolor: '#374151'
                    },
                    yaxis: { 
                      title: 'GFI (Ghost ID Factor)',
                      color: '#fff',
                      gridcolor: '#374151'
                    },
                    paper_bgcolor: '#1F2937',
                    plot_bgcolor: '#111827',
                    font: { color: '#fff' },
                    showlegend: false
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '500px' }}
                />
                
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-600"></div>
                    <span className="text-gray-300">Border States</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                    <span className="text-gray-300">Interior States</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
