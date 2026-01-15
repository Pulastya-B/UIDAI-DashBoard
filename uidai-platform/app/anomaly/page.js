'use client';

import { useState, useEffect } from 'react';
import { AlertOctagon, Search, Filter } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { loadPyodide } from '@/lib/pyodide-loader';

export default function AnomalyPage() {
  const [data, setData] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [threshold, setThreshold] = useState(2);
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

  const detectAnomalies = async (sigmaThreshold) => {
    if (!data) return;
    
    setCalculating(true);
    setThreshold(sigmaThreshold);
    
    try {
      const pyodide = await loadPyodide();
      pyodide.globals.set('data_json', JSON.stringify(data));
      pyodide.globals.set('threshold', sigmaThreshold);
      
      const code = `
import pandas as pd
import numpy as np
import json

df = pd.DataFrame(json.loads(data_json))

# Calculate metrics for each state
df['total_demo'] = df['demo_child'] + df['demo_adult']
df['total_bio'] = df['bio_child'] + df['bio_adult']
df['total_enrol'] = df['enrol_infant'] + df['enrol_child'] + df['enrol_adult']
df['total_ops'] = df['total_demo'] + df['total_bio']

# Z-scores
df['demo_zscore'] = (df['total_demo'] - df['total_demo'].mean()) / df['total_demo'].std()
df['bio_zscore'] = (df['total_bio'] - df['total_bio'].mean()) / df['total_bio'].std()
df['enrol_zscore'] = (df['total_enrol'] - df['total_enrol'].mean()) / df['total_enrol'].std()

# BAI Z-score
df['bai'] = df['total_demo'] / (df['total_bio'] + 1)
df['bai_zscore'] = (df['bai'] - df['bai'].mean()) / df['bai'].std()

# Detect anomalies
df['is_anomaly'] = (
    (abs(df['demo_zscore']) > threshold) |
    (abs(df['bio_zscore']) > threshold) |
    (abs(df['enrol_zscore']) > threshold) |
    (abs(df['bai_zscore']) > threshold)
)

df['anomaly_count'] = (
    (abs(df['demo_zscore']) > threshold).astype(int) +
    (abs(df['bio_zscore']) > threshold).astype(int) +
    (abs(df['enrol_zscore']) > threshold).astype(int) +
    (abs(df['bai_zscore']) > threshold).astype(int)
)

df['max_zscore'] = df[['demo_zscore', 'bio_zscore', 'enrol_zscore', 'bai_zscore']].abs().max(axis=1)

# Filter anomalies
anomalies_df = df[df['is_anomaly']].copy()
anomalies_df = anomalies_df.sort_values('anomaly_count', ascending=False)

json.dumps({
    'anomalies': anomalies_df[['state', 'demo_zscore', 'bio_zscore', 'enrol_zscore', 'bai_zscore', 
                                'anomaly_count', 'max_zscore', 'total_ops']].to_dict('records'),
    'total_states': len(df),
    'anomaly_count': int(anomalies_df['is_anomaly'].sum()),
    'stats': {
        'demo_mean': float(df['total_demo'].mean()),
        'demo_std': float(df['total_demo'].std()),
        'bio_mean': float(df['total_bio'].mean()),
        'bio_std': float(df['total_bio'].std())
    }
})
      `;
      
      const result = await pyodide.runPythonAsync(code);
      const jsResult = typeof result === 'string' ? JSON.parse(result) : result;
      setAnomalies(jsResult);
      
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (data && !anomalies) {
      detectAnomalies(2);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner text="Loading anomaly detection data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertOctagon className="w-12 h-12 text-orange-400" />
            <h1 className="text-5xl font-bold text-white">
              Anomaly Detection
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            Multi-Metric Outlier Analysis Using Z-Score Method
          </p>
          <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mt-6">
            <p className="text-yellow-200 font-semibold">
              ⚠️ IMPORTANT: Signals ≠ Fraud
            </p>
            <p className="text-yellow-300 text-sm mt-2">
              Statistical anomalies indicate unusual patterns requiring further investigation. 
              They do NOT constitute proof of fraudulent activity.
            </p>
          </div>
        </div>

        {/* Threshold Selector */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <Filter className="text-orange-400" size={24} />
              <div className="flex-1">
                <label className="text-white font-semibold mb-2 block">
                  Detection Sensitivity (σ threshold)
                </label>
                <div className="flex gap-4">
                  {[1, 2, 3].map(sigma => (
                    <button
                      key={sigma}
                      onClick={() => detectAnomalies(sigma)}
                      className={`px-6 py-3 rounded-lg font-semibold transition ${
                        threshold === sigma
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {sigma}σ {sigma === 1 ? '(Sensitive)' : sigma === 2 ? '(Balanced)' : '(Conservative)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {calculating && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <LoadingSpinner text="Detecting anomalies..." />
            </div>
          </div>
        )}

        {anomalies && !calculating && (
          <>
            {/* Summary Stats */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-600 rounded-lg p-6 text-center text-white">
                  <div className="text-4xl font-bold mb-2">{anomalies.total_states}</div>
                  <div className="font-semibold">Total States</div>
                </div>
                <div className="bg-orange-600 rounded-lg p-6 text-center text-white">
                  <div className="text-4xl font-bold mb-2">{anomalies.anomaly_count}</div>
                  <div className="font-semibold">Flagged States</div>
                  <div className="text-sm opacity-90 mt-1">{threshold}σ threshold</div>
                </div>
                <div className="bg-green-600 rounded-lg p-6 text-center text-white">
                  <div className="text-4xl font-bold mb-2">{anomalies.total_states - anomalies.anomaly_count}</div>
                  <div className="font-semibold">Normal States</div>
                  <div className="text-sm opacity-90 mt-1">Within expected range</div>
                </div>
              </div>
            </div>

            {/* Anomaly List */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Search className="text-orange-400" />
                  Detected Anomalies ({anomalies.anomaly_count} states)
                </h2>
                
                {anomalies.anomalies.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-2">✓ No anomalies detected at {threshold}σ threshold</p>
                    <p className="text-sm">All states within expected statistical range</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {anomalies.anomalies.map((state, idx) => (
                      <div 
                        key={state.state}
                        className="bg-gray-900 rounded-lg p-6 border-l-4 border-orange-500"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">{state.state}</h3>
                            <div className="flex items-center gap-4">
                              <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                {state.anomaly_count} Signals
                              </span>
                              <span className="text-gray-400 text-sm">
                                Max Z-score: {state.max_zscore.toFixed(2)}σ
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {state.total_ops.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-400">Total Ops</div>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className={`p-3 rounded ${Math.abs(state.demo_zscore) > threshold ? 'bg-red-900' : 'bg-gray-800'}`}>
                            <div className="text-xs text-gray-400 mb-1">Demo Z-score</div>
                            <div className="text-lg font-bold text-white">{state.demo_zscore.toFixed(2)}σ</div>
                          </div>
                          <div className={`p-3 rounded ${Math.abs(state.bio_zscore) > threshold ? 'bg-red-900' : 'bg-gray-800'}`}>
                            <div className="text-xs text-gray-400 mb-1">Bio Z-score</div>
                            <div className="text-lg font-bold text-white">{state.bio_zscore.toFixed(2)}σ</div>
                          </div>
                          <div className={`p-3 rounded ${Math.abs(state.enrol_zscore) > threshold ? 'bg-red-900' : 'bg-gray-800'}`}>
                            <div className="text-xs text-gray-400 mb-1">Enrol Z-score</div>
                            <div className="text-lg font-bold text-white">{state.enrol_zscore.toFixed(2)}σ</div>
                          </div>
                          <div className={`p-3 rounded ${Math.abs(state.bai_zscore) > threshold ? 'bg-red-900' : 'bg-gray-800'}`}>
                            <div className="text-xs text-gray-400 mb-1">BAI Z-score</div>
                            <div className="text-lg font-bold text-white">{state.bai_zscore.toFixed(2)}σ</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
