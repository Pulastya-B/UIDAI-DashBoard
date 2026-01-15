'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Shield, Users, Building, MapPin } from 'lucide-react';
import MetricCalculator from '@/components/MetricCalculator';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MetricsPage() {
  const [activeMetric, setActiveMetric] = useState('dpi');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data on mount
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

  const metrics = [
    {
      id: 'dpi',
      name: 'Deadline Panic Index (DPI)',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-teal-600',
      description: 'Measures procrastination behavior - ratio of activity in final 10% vs first 80% of time window',
      interpretation: {
        high: '> 5: Severe procrastination',
        moderate: '2-5: Moderate deadline panic',
        low: '< 2: Normal behavior'
      }
    },
    {
      id: 'bai',
      name: 'Border Anxiety Index (BAI)',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-red-600',
      description: 'Identity anxiety indicator - ratio of demographic updates to biometric updates',
      interpretation: {
        critical: '> 3.0: Critical security concern',
        moderate: '1.5-3.0: Moderate concern',
        normal: '< 1.5: Normal verification pattern'
      }
    },
    {
      id: 'sur',
      name: 'Subsistence Update Ratio (SUR)',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-600',
      description: 'Welfare dependency proxy - rural updates divided by total updates',
      interpretation: {
        high: '> 0.7: High welfare dependency',
        mixed: '0.4-0.7: Mixed economy',
        urban: '< 0.4: Urban-dominated'
      }
    },
    {
      id: 'gfi',
      name: 'Ghost Friction Index (GFI)',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-yellow-600',
      description: 'Enroll and forget behavior - ratio of enrolments to updates',
      interpretation: {
        ghost: '> 5.0: Ghost territory',
        moderate: '2.0-5.0: Moderate disengagement',
        active: '< 2.0: Active user base'
      }
    },
    {
      id: 'cci',
      name: 'Center Congestion Index (CCI)',
      icon: <Building className="w-6 h-6" />,
      color: 'bg-orange-600',
      description: 'Infrastructure stress - operations per pincode',
      interpretation: {
        critical: '> 300: Critical congestion/fraud risk',
        high: '100-300: High stress',
        moderate: '< 100: Moderate levels'
      }
    },
    {
      id: 'mobility',
      name: 'Mobility Ratio',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-blue-600',
      description: 'Migration intensity - demographic updates as proportion of total activity',
      interpretation: {
        high: '> 0.7: High identity churn',
        moderate: '0.4-0.7: Moderate mobility',
        stable: '< 0.4: Stable population'
      }
    }
  ];

  const selectedMetric = metrics.find(m => m.id === activeMetric);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LoadingSpinner text="Loading data..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-bold text-xl mb-2">Failed to load data</p>
          <p className="text-gray-400">Please ensure data files are in public/data/</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2 rounded-full mb-6 shadow-lg shadow-cyan-500/20">
            <Calculator size={16} />
            <span className="text-sm font-semibold">Live Metric Calculation</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            Metrics Explorer
          </h1>
          <p className="text-lg text-gray-300">
            Interactive calculation of all 6 core indicators with adjustable parameters
          </p>
        </div>

        {/* Metric Selector */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-105 hover:shadow-2xl ${
                  activeMetric === metric.id
                    ? `${metric.color} text-white border-transparent shadow-xl`
                    : 'bg-gray-800/50 backdrop-blur-sm text-gray-200 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    activeMetric === metric.id 
                      ? 'bg-white/20' 
                      : metric.color
                  }`}>
                    {metric.icon}
                  </div>
                  <span className="font-bold text-lg">{metric.name}</span>
                </div>
                <p className={`text-sm leading-relaxed ${
                  activeMetric === metric.id ? 'text-white/90' : 'text-gray-400'
                }`}>
                  {metric.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Metric Details */}
        {selectedMetric && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-500/10 p-8 mb-8 border border-gray-700">
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-4 rounded-xl ${selectedMetric.color} text-white shadow-lg transform hover:scale-110 transition-transform`}>
                  {selectedMetric.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-100 mb-2">
                    {selectedMetric.name}
                  </h2>
                  <p className="text-gray-300 text-lg">{selectedMetric.description}</p>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
                <h3 className="font-bold text-gray-100 mb-4 text-lg flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-teal-500 rounded"></span>
                  Interpretation Guide
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedMetric.interpretation).map(([level, desc]) => (
                    <div key={level} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 mt-2"></span>
                      <span className="font-mono text-sm text-gray-300 bg-gray-700/50 px-3 py-1.5 rounded-lg flex-1">
                        {desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculator Component */}
              <MetricCalculator 
                metricId={selectedMetric.id}
                data={data}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
