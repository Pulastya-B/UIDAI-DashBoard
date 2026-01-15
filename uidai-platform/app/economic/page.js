'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Users, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { loadPyodide } from '@/lib/pyodide-loader';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function EconomicPage() {
  const [data, setData] = useState(null);
  const [economicData, setEconomicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetch('/data/state_summary.json')
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

  const calculateEconomic = async () => {
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

# Assumed state populations (millions) - simplified
population_map = {
    'Uttar Pradesh': 200, 'Maharashtra': 112, 'Bihar': 104,
    'West Bengal': 91, 'Madhya Pradesh': 73, 'Tamil Nadu': 72,
    'Rajasthan': 69, 'Karnataka': 61, 'Gujarat': 60,
    'Andhra Pradesh': 49, 'Odisha': 42, 'Telangana': 35,
    'Kerala': 33, 'Jharkhand': 33, 'Assam': 31,
    'Punjab': 28, 'Chhattisgarh': 26, 'Haryana': 25,
    'Delhi': 17, 'Jammu and Kashmir': 13, 'Uttarakhand': 10,
    'Himachal Pradesh': 7, 'Tripura': 4, 'Meghalaya': 3,
    'Manipur': 3, 'Nagaland': 2, 'Goa': 1.5, 'Arunachal Pradesh': 1.4,
    'Mizoram': 1.1, 'Sikkim': 0.6, 'Puducherry': 1.2, 'Chandigarh': 1
}

results = []

for _, row in df.iterrows():
    state = row['state']
    pop = population_map.get(state, 50) * 1000000  # Default 50M
    
    total_updates = row['demo_child'] + row['demo_adult'] + row['bio_child'] + row['bio_adult']
    sur = total_updates / pop  # Per capita update rate
    
    # TWD (Total Workforce Density) - approximation
    twd = (row['demo_adult'] + row['bio_adult']) / pop
    
    # Exclusion score (inverse of engagement)
    exclusion = 1 - min(sur, 1)
    
    results.append({
        'state': state,
        'sur': float(sur),
        'twd': float(twd),
        'exclusion': float(exclusion),
        'total_updates': int(total_updates),
        'population': int(pop),
        'classification': 'Welfare State' if sur > 0.15 else ('Mixed' if sur > 0.08 else 'Low Engagement')
    })

results_df = pd.DataFrame(results)
results_df = results_df.sort_values('sur', ascending=False)

json.dumps(results_df.to_dict('records'))
      `;
      
      const result = await pyodide.runPythonAsync(code);
      const jsResult = typeof result === 'string' ? JSON.parse(result) : result;
      setEconomicData(jsResult);
      
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (data && !economicData) {
      calculateEconomic();
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner text="Loading economic data..." />
      </div>
    );
  }

  const getClassColor = (classification) => {
    if (classification === 'Welfare State') return 'bg-green-600';
    if (classification === 'Mixed') return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <DollarSign className="w-12 h-12 text-blue-400" />
            <h1 className="text-5xl font-bold text-white">
              Economic Segmentation
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            State Update Rate & Workforce Density Analysis
          </p>
          <p className="text-gray-400">
            SUR (State Update Rate) as a proxy for government-citizen digital engagement
          </p>
        </div>

        {calculating && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <LoadingSpinner text="Calculating economic metrics..." />
            </div>
          </div>
        )}

        {economicData && !calculating && (
          <>
            {/* Classification Summary */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                {['Welfare State', 'Mixed', 'Low Engagement'].map(category => {
                  const count = economicData.filter(d => d.classification === category).length;
                  return (
                    <div key={category} className={`${getClassColor(category)} rounded-lg p-6 text-center text-white`}>
                      <div className="text-4xl font-bold mb-2">{count}</div>
                      <div className="font-semibold">{category}</div>
                      <div className="text-sm opacity-90 mt-2">
                        {category === 'Welfare State' && 'SUR > 0.15'}
                        {category === 'Mixed' && '0.08 < SUR < 0.15'}
                        {category === 'Low Engagement' && 'SUR < 0.08'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top States by SUR */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Users className="text-blue-400" />
                  Top 20 States by Engagement (SUR)
                </h2>
                
                <div className="space-y-3">
                  {economicData.slice(0, 20).map((state, idx) => (
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
                            <div className="text-lg font-bold text-white mb-1">{state.state}</div>
                            <div className="text-sm text-gray-400">
                              TWD: {state.twd.toFixed(4)} | Exclusion: {(state.exclusion * 100).toFixed(1)}% | Pop: {(state.population / 1000000).toFixed(1)}M
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white mb-1">
                            {state.sur.toFixed(3)}
                          </div>
                          <div className={`${getClassColor(state.classification)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                            {state.classification}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SUR Distribution Chart */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  State Update Rate Distribution
                </h2>
                
                <Plot
                  data={[{
                    x: economicData.map(d => d.state),
                    y: economicData.map(d => d.sur),
                    type: 'bar',
                    marker: {
                      color: economicData.map(d => 
                        d.classification === 'Welfare State' ? '#10B981' :
                        d.classification === 'Mixed' ? '#FBBF24' : '#EF4444'
                      )
                    }
                  }]}
                  layout={{
                    title: 'Per-Capita Update Rate by State',
                    xaxis: { 
                      title: 'State',
                      tickangle: -45,
                      color: '#fff'
                    },
                    yaxis: { 
                      title: 'SUR (Updates per Capita)',
                      color: '#fff',
                      gridcolor: '#374151'
                    },
                    paper_bgcolor: '#1F2937',
                    plot_bgcolor: '#111827',
                    font: { color: '#fff' },
                    margin: { b: 150 },
                    shapes: [
                      { type: 'line', y0: 0.15, y1: 0.15, x0: -1, x1: economicData.length, line: { color: '#10B981', width: 2, dash: 'dash' } },
                      { type: 'line', y0: 0.08, y1: 0.08, x0: -1, x1: economicData.length, line: { color: '#FBBF24', width: 2, dash: 'dash' } }
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
