'use client';

import { useState, useEffect } from 'react';
import { Building2, Activity, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { loadPyodide } from '@/lib/pyodide-loader';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function InfrastructurePage() {
  const [data, setData] = useState(null);
  const [infraData, setInfraData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetch('/data/district_summary.json')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, []);

  const calculateInfrastructure = async () => {
    if (!data) return;
    
    setCalculating(true);
    try {
      const pyodide = await loadPyodide();
      pyodide.globals.set('data_json', JSON.stringify(data));
      
      const code = `
import pandas as pd
import numpy as np
import json

df = pd.DataFrame(json.loads(data_json))

results = []

for state in df['state'].unique():
    state_df = df[df['state'] == state]
    
    total_ops = (state_df['demo_child'].sum() + state_df['demo_adult'].sum() + 
                 state_df['bio_child'].sum() + state_df['bio_adult'].sum())
    
    # Maturity Index (total ops / districts)
    num_districts = state_df['district'].nunique()
    maturity = total_ops / (num_districts * 10000) if num_districts > 0 else 0
    
    # CCI (Congestion Index)
    approx_pincodes = num_districts * 5
    cci = total_ops / approx_pincodes if approx_pincodes > 0 else 0
    
    # Risk level
    risk = 'Critical' if cci > 300 else ('High' if cci > 100 else 'Moderate')
    maturity_phase = 'Growth' if maturity < 0.5 else ('Developing' if maturity < 2.0 else 'Mature')
    
    results.append({
        'state': state,
        'maturity_index': float(maturity),
        'cci': float(cci),
        'total_ops': int(total_ops),
        'num_districts': int(num_districts),
        'maturity_phase': maturity_phase,
        'risk_level': risk
    })

results_df = pd.DataFrame(results)
results_df = results_df.sort_values('cci', ascending=False)

json.dumps(results_df.to_dict('records'))
      `;
      
      const result = await pyodide.runPythonAsync(code);
      const jsResult = typeof result === 'string' ? JSON.parse(result) : result;
      setInfraData(jsResult);
      
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (data && !infraData) {
      calculateInfrastructure();
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner text="Loading infrastructure data..." />
      </div>
    );
  }

  const getPhaseColor = (phase) => {
    if (phase === 'Mature') return 'bg-green-600';
    if (phase === 'Developing') return 'bg-blue-600';
    return 'bg-yellow-600';
  };

  const getRiskColor = (risk) => {
    if (risk === 'Critical') return 'bg-red-600';
    if (risk === 'High') return 'bg-orange-600';
    return 'bg-yellow-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-12 h-12 text-teal-400" />
            <h1 className="text-5xl font-bold text-white">
              Infrastructure Analysis
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            Maturity Index & Operational Capacity Assessment
          </p>
          <p className="text-gray-400">
            Understanding state-level infrastructure readiness and congestion patterns
          </p>
        </div>

        {calculating && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <LoadingSpinner text="Calculating infrastructure metrics..." />
            </div>
          </div>
        )}

        {infraData && !calculating && (
          <>
            {/* Maturity Distribution */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                {['Growth', 'Developing', 'Mature'].map(phase => {
                  const count = infraData.filter(d => d.maturity_phase === phase).length;
                  return (
                    <div key={phase} className={`${getPhaseColor(phase)} rounded-lg p-6 text-center text-white`}>
                      <div className="text-4xl font-bold mb-2">{count}</div>
                      <div className="font-semibold">{phase} Phase</div>
                      <div className="text-sm opacity-90 mt-2">
                        {phase === 'Growth' && 'Maturity < 0.5'}
                        {phase === 'Developing' && '0.5 < Maturity < 2.0'}
                        {phase === 'Mature' && 'Maturity > 2.0'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Congested States */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Activity className="text-teal-400" />
                  Top 20 States by Infrastructure Stress (CCI)
                </h2>
                
                <div className="space-y-3">
                  {infraData.slice(0, 20).map((state, idx) => (
                    <div 
                      key={state.state}
                      className="bg-gray-900 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-2xl font-bold text-gray-500 w-8">
                            #{idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-lg font-bold text-white">{state.state}</span>
                              <span className={`${getPhaseColor(state.maturity_phase)} text-white text-xs px-2 py-1 rounded`}>
                                {state.maturity_phase}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">
                              Maturity: {state.maturity_index.toFixed(2)} | Districts: {state.num_districts} | Ops: {state.total_ops.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white mb-1">
                            {state.cci.toFixed(0)}
                          </div>
                          <div className={`${getRiskColor(state.risk_level)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                            {state.risk_level}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Matrix Scatter */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Operational Risk Matrix (Maturity vs CCI)
                </h2>
                
                <Plot
                  data={[{
                    x: infraData.map(d => d.maturity_index),
                    y: infraData.map(d => d.cci),
                    mode: 'markers+text',
                    type: 'scatter',
                    marker: {
                      size: 12,
                      color: infraData.map(d => 
                        d.risk_level === 'Critical' ? '#DC2626' :
                        d.risk_level === 'High' ? '#F97316' : '#FBBF24'
                      ),
                      line: { color: '#fff', width: 1 }
                    },
                    text: infraData.map(d => d.state),
                    textposition: 'top center',
                    textfont: { size: 8, color: '#fff' },
                    hovertemplate: '<b>%{text}</b><br>Maturity: %{x:.2f}<br>CCI: %{y:.0f}<extra></extra>'
                  }]}
                  layout={{
                    title: 'Infrastructure Maturity vs Congestion',
                    xaxis: { 
                      title: 'Maturity Index',
                      color: '#fff',
                      gridcolor: '#374151'
                    },
                    yaxis: { 
                      title: 'CCI (Congestion Index)',
                      color: '#fff',
                      gridcolor: '#374151'
                    },
                    paper_bgcolor: '#1F2937',
                    plot_bgcolor: '#111827',
                    font: { color: '#fff' },
                    showlegend: false,
                    shapes: [
                      { type: 'line', x0: 0.5, x1: 0.5, y0: 0, y1: 1, yref: 'paper', line: { color: '#FBBF24', width: 2, dash: 'dash' } },
                      { type: 'line', x0: 2.0, x1: 2.0, y0: 0, y1: 1, yref: 'paper', line: { color: '#10B981', width: 2, dash: 'dash' } },
                      { type: 'line', y0: 100, y1: 100, x0: 0, x1: 1, xref: 'paper', line: { color: '#F97316', width: 2, dash: 'dash' } },
                      { type: 'line', y0: 300, y1: 300, x0: 0, x1: 1, xref: 'paper', line: { color: '#DC2626', width: 2, dash: 'dash' } }
                    ]
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '600px' }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
