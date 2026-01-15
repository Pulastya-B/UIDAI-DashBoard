'use client';

import { useState, useEffect } from 'react';
import { Plane, Calendar as CalendarIcon, Tractor } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { loadPyodide } from '@/lib/pyodide-loader';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const SEASONAL_EVENTS = [
  {
    id: 'diwali',
    name: 'Diwali Migration',
    icon: Plane,
    months: [10, 11], // Oct-Nov
    description: 'Urban → Rural migration during festival season',
    color: '#F97316'
  },
  {
    id: 'school',
    name: 'School Enrollment',
    icon: CalendarIcon,
    months: [6, 7], // June-July
    description: 'New academic year triggers address updates',
    color: '#3B82F6'
  },
  {
    id: 'harvest',
    name: 'Agricultural Calendar',
    icon: Tractor,
    months: [3, 4, 9, 10], // Rabi & Kharif seasons
    description: 'Seasonal labor movement patterns',
    color: '#10B981'
  }
];

export default function MigrationLabPage() {
  const [data, setData] = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(SEASONAL_EVENTS[0]);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetch('/data/monthly_summary.json')
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

  const analyzePattern = async (pattern) => {
    if (!data) return;
    
    setCalculating(true);
    setSelectedPattern(pattern);
    
    try {
      const pyodide = await loadPyodide();
      pyodide.globals.set('data_json', JSON.stringify(data));
      pyodide.globals.set('target_months', JSON.stringify(pattern.months));
      
      const code = `
import pandas as pd
import numpy as np
import json

df = pd.DataFrame(json.loads(data_json))
df['date'] = pd.to_datetime(df['date'])
target_months_list = json.loads(target_months)

# Extract month
df['month'] = df['date'].dt.month
df['year'] = df['date'].dt.year

# Calculate mobility (demo updates / total activity)
df['demo_total'] = df['demo_child'] + df['demo_adult']
df['bio_total'] = df['bio_child'] + df['bio_adult']
df['mobility'] = df['demo_total'] / (df['demo_total'] + df['bio_total'] + 1)

# Compare target months vs other months
df_target = df[df['month'].isin(target_months_list)]
df_other = df[~df['month'].isin(target_months_list)]

target_mobility = df_target['mobility'].mean()
other_mobility = df_other['mobility'].mean()
spike_factor = target_mobility / other_mobility if other_mobility > 0 else 1

# Monthly pattern
monthly = df.groupby('month').agg({
    'mobility': 'mean',
    'demo_total': 'sum'
}).reset_index()

json.dumps({
    'target_mobility': float(target_mobility),
    'baseline_mobility': float(other_mobility),
    'spike_factor': float(spike_factor),
    'pattern_detected': spike_factor > 1.2,
    'chart_data': {
        'months': monthly['month'].tolist(),
        'mobility': monthly['mobility'].tolist(),
        'volume': monthly['demo_total'].tolist()
    }
})
      `;
      
      const result = await pyodide.runPythonAsync(code);
      const jsResult = typeof result === 'string' ? JSON.parse(result) : result;
      setAnalysisData(jsResult);
      
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (data && !analysisData) {
      analyzePattern(selectedPattern);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner text="Loading migration data..." />
      </div>
    );
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-12 h-12 text-green-400" />
            <h1 className="text-5xl font-bold text-white">
              Migration Lab
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            Seasonal Movement Patterns Across India
          </p>
          <p className="text-gray-400">
            Festival, School, and Agricultural Calendar Correlations
          </p>
        </div>

        {/* Pattern Selector */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            {SEASONAL_EVENTS.map((event) => {
              const Icon = event.icon;
              return (
                <button
                  key={event.id}
                  onClick={() => analyzePattern(event)}
                  className={`p-6 rounded-xl transition-all ${
                    selectedPattern.id === event.id
                      ? 'bg-gradient-to-br from-green-600 to-teal-600 shadow-xl scale-105'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-12 h-12 mb-4 mx-auto" style={{ color: event.color }} />
                  <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                  <p className="text-gray-300 text-sm mb-3">{event.description}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {event.months.map(m => (
                      <span key={m} className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm text-white">
                        {monthNames[m - 1]}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {calculating && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <LoadingSpinner text="Analyzing seasonal patterns..." />
            </div>
          </div>
        )}

        {analysisData && !calculating && (
          <>
            {/* Analysis Summary */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-600 rounded-lg p-6 text-center">
                  <div className="text-sm text-blue-200 mb-2">Target Period Mobility</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {(analysisData.target_mobility * 100).toFixed(1)}%
                  </div>
                  <div className="text-blue-200">Demographic Update Rate</div>
                </div>

                <div className="bg-gray-600 rounded-lg p-6 text-center">
                  <div className="text-sm text-gray-200 mb-2">Baseline Mobility</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {(analysisData.baseline_mobility * 100).toFixed(1)}%
                  </div>
                  <div className="text-gray-200">Other Months Average</div>
                </div>

                <div className={`rounded-lg p-6 text-center ${
                  analysisData.spike_factor > 1.5 ? 'bg-green-600' :
                  analysisData.spike_factor > 1.2 ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  <div className="text-sm opacity-90 mb-2">Spike Factor</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {analysisData.spike_factor.toFixed(2)}×
                  </div>
                  <div className="opacity-90">
                    {analysisData.pattern_detected ? '✓ Pattern Detected' : '✗ No Clear Pattern'}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Pattern Chart */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Annual Mobility Pattern
                </h2>
                
                <Plot
                  data={[
                    {
                      x: analysisData.chart_data.months.map(m => monthNames[m - 1]),
                      y: analysisData.chart_data.mobility.map(v => v * 100),
                      type: 'bar',
                      marker: {
                        color: analysisData.chart_data.months.map(m => 
                          selectedPattern.months.includes(m) ? selectedPattern.color : '#6B7280'
                        )
                      },
                      name: 'Mobility Rate'
                    }
                  ]}
                  layout={{
                    title: `${selectedPattern.name} - Monthly Mobility Pattern`,
                    xaxis: { 
                      title: 'Month',
                      color: '#fff'
                    },
                    yaxis: { 
                      title: 'Mobility Rate (%)',
                      color: '#fff',
                      gridcolor: '#374151'
                    },
                    paper_bgcolor: '#1F2937',
                    plot_bgcolor: '#111827',
                    font: { color: '#fff' },
                    showlegend: false
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '400px' }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
