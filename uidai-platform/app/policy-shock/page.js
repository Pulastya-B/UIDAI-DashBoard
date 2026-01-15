'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { loadPyodide } from '@/lib/pyodide-loader';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const POLICY_EVENTS = [
  {
    date: '2017-10-01',
    name: 'Assam NRC Freeze',
    description: 'Assam government freezes Aadhaar enrollments pending NRC verification',
    color: '#DC2626'
  },
  {
    date: '2018-06-30',
    name: 'PAN-Aadhaar Link Deadline',
    description: 'Supreme Court mandates linking PAN with Aadhaar',
    color: '#F97316'
  },
  {
    date: '2018-09-15',
    name: 'Mobile Banking Units (MBU) Drive',
    description: 'Rural banking initiative requires Aadhaar for account opening',
    color: '#FBBF24'
  }
];

export default function PolicyShockPage() {
  const [data, setData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(POLICY_EVENTS[1]);
  const [impactData, setImpactData] = useState(null);
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

  const analyzeImpact = async (event) => {
    if (!data) return;
    
    setCalculating(true);
    setSelectedEvent(event);
    
    try {
      const pyodide = await loadPyodide();
      pyodide.globals.set('data_json', JSON.stringify(data));
      pyodide.globals.set('event_date', event.date);
      
      const code = `
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta

df = pd.DataFrame(json.loads(data_json))
df['date'] = pd.to_datetime(df['date'])

# Event date
event_dt = pd.to_datetime(event_date)

# 60 days before and after
before_start = event_dt - timedelta(days=60)
before_end = event_dt - timedelta(days=1)
after_start = event_dt + timedelta(days=1)
after_end = event_dt + timedelta(days=60)

# Filter data
df_before = df[(df['date'] >= before_start) & (df['date'] <= before_end)]
df_after = df[(df['date'] >= after_start) & (df['date'] <= after_end)]

# Calculate total activity
df_before['total'] = df_before['demo_child'] + df_before['demo_adult']
df_after['total'] = df_after['demo_child'] + df_after['demo_adult']

before_avg = df_before['total'].mean()
after_avg = df_after['total'].mean()

change_pct = ((after_avg - before_avg) / before_avg * 100) if before_avg > 0 else 0

# Daily data for chart
df_window = df[(df['date'] >= before_start) & (df['date'] <= after_end)].copy()
df_window['total'] = df_window['demo_child'] + df_window['demo_adult']
daily = df_window.groupby('date')['total'].sum().reset_index()

json.dumps({
    'before_avg': float(before_avg),
    'after_avg': float(after_avg),
    'change_pct': float(change_pct),
    'impact_level': 'Severe' if abs(change_pct) > 50 else ('Moderate' if abs(change_pct) > 20 else 'Minimal'),
    'chart_data': {
        'dates': daily['date'].dt.strftime('%Y-%m-%d').tolist(),
        'values': daily['total'].tolist()
    }
})
      `;
      
      const result = await pyodide.runPythonAsync(code);
      const jsResult = typeof result === 'string' ? JSON.parse(result) : result;
      setImpactData(jsResult);
      
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (data && !impactData) {
      analyzeImpact(selectedEvent);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner text="Loading policy event data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-12 h-12 text-teal-400" />
            <h1 className="text-5xl font-bold text-white">
              Policy Shock Simulator
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            Before/After Analysis of Major Policy Events
          </p>
          <p className="text-gray-400">
            How did government decisions impact Aadhaar activity across India?
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Major Policy Events (2017-2018)</h2>
            
            <div className="space-y-4">
              {POLICY_EVENTS.map((event, idx) => (
                <button
                  key={idx}
                  onClick={() => analyzeImpact(event)}
                  className={`w-full text-left p-6 rounded-lg transition-all ${
                    selectedEvent.name === event.name
                      ? 'bg-teal-600 shadow-lg scale-105'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: event.color }}
                        ></div>
                        <h3 className="text-xl font-bold text-white">{event.name}</h3>
                      </div>
                      <p className="text-gray-300 mb-2">{event.description}</p>
                      <p className="text-sm text-gray-400">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    {selectedEvent.name === event.name && (
                      <AlertCircle className="text-teal-300 flex-shrink-0" size={24} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {calculating && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <LoadingSpinner text="Analyzing policy impact..." />
            </div>
          </div>
        )}

        {impactData && !calculating && (
          <>
            {/* Impact Summary */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-600 rounded-lg p-6 text-center">
                  <div className="text-sm text-blue-200 mb-2">60 Days BEFORE Event</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {impactData.before_avg.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-blue-200">Avg Daily Updates</div>
                </div>

                <div className="bg-green-600 rounded-lg p-6 text-center">
                  <div className="text-sm text-green-200 mb-2">60 Days AFTER Event</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {impactData.after_avg.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-green-200">Avg Daily Updates</div>
                </div>

                <div className={`rounded-lg p-6 text-center ${
                  Math.abs(impactData.change_pct) > 50 ? 'bg-red-600' :
                  Math.abs(impactData.change_pct) > 20 ? 'bg-orange-600' : 'bg-yellow-600'
                }`}>
                  <div className="text-sm opacity-90 mb-2">Impact Magnitude</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {impactData.change_pct > 0 ? '+' : ''}{impactData.change_pct.toFixed(1)}%
                  </div>
                  <div className="opacity-90">{impactData.impact_level} Change</div>
                </div>
              </div>
            </div>

            {/* Temporal Chart */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="text-teal-400" />
                  Activity Timeline (±60 Days)
                </h2>
                
                <Plot
                  data={[
                    {
                      x: impactData.chart_data.dates,
                      y: impactData.chart_data.values,
                      type: 'scatter',
                      mode: 'lines',
                      line: { color: '#A855F7', width: 2 },
                      fill: 'tozeroy',
                      fillcolor: 'rgba(168, 85, 247, 0.1)'
                    }
                  ]}
                  layout={{
                    title: `${selectedEvent.name} Impact Analysis`,
                    xaxis: { 
                      title: 'Date',
                      color: '#fff',
                      gridcolor: '#374151'
                    },
                    yaxis: { 
                      title: 'Daily Updates',
                      color: '#fff',
                      gridcolor: '#374151'
                    },
                    paper_bgcolor: '#1F2937',
                    plot_bgcolor: '#111827',
                    font: { color: '#fff' },
                    shapes: [{
                      type: 'line',
                      x0: selectedEvent.date,
                      x1: selectedEvent.date,
                      y0: 0,
                      y1: 1,
                      yref: 'paper',
                      line: {
                        color: selectedEvent.color,
                        width: 3,
                        dash: 'dash'
                      }
                    }],
                    annotations: [{
                      x: selectedEvent.date,
                      y: 1,
                      yref: 'paper',
                      text: selectedEvent.name,
                      showarrow: true,
                      arrowhead: 2,
                      arrowcolor: selectedEvent.color,
                      font: { color: '#fff', size: 12 },
                      bgcolor: selectedEvent.color,
                      borderpad: 4
                    }]
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '500px' }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
