'use client';

import Link from 'next/link';
import { Database, BarChart3, Shield, TrendingUp, MapPin, AlertTriangle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import SkewCards from '@/components/SkewCards';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2 rounded-full mb-6 animate-bounce shadow-lg shadow-cyan-500/20">
            <Sparkles size={16} />
            <span className="text-sm font-semibold">Interactive Research Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent mb-6 leading-tight">
            UIDAI Analytical Platform
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-4 font-medium">
            An Interactive Research Sandbox for Aadhaar Flow Data
          </p>
          <p className="text-base sm:text-lg text-gray-400 mb-8 flex items-center justify-center gap-3 flex-wrap">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
            Transparent • Reproducible • Testable
          </p>

          <div className="bg-gradient-to-r from-gray-800/80 to-gray-800/60 border-l-4 border-gradient-to-b from-cyan-500 to-teal-500 p-4 sm:p-6 md:p-8 mb-10 text-left rounded-r-2xl shadow-2xl backdrop-blur-sm transform hover:scale-[1.02] transition-transform">
            <p className="text-gray-200 leading-relaxed text-base sm:text-lg">
              <strong className="text-blue-400">Not a dashboard.</strong> This is a reproducible research lab built on UIDAI's public datasets. 
              Explore the raw data, inspect our calculations, adjust assumptions, and watch patterns emerge. 
              Every metric is transparent. Every insight is testable. Every conclusion is auditable.
            </p>
          </div>

          <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
            <Link
              href="/datasets"
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 hover:shadow-2xl flex items-center gap-2 text-sm sm:text-base">
              <Database size={18} className="sm:w-5 sm:h-5" />
              View Datasets
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/metrics"
              className="group bg-white text-teal-600 border-2 border-teal-600 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-teal-50 transition-all transform hover:scale-105 hover:shadow-2xl flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 size={18} className="sm:w-5 sm:h-5" />
              Explore Metrics
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/threat-intelligence"
              className="group bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all transform hover:scale-105 hover:shadow-2xl flex items-center gap-2 animate-pulse text-sm sm:text-base">
              <AlertTriangle size={18} className="sm:w-5 sm:h-5" />
              National Threat Map
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Skew Cards Section */}
      <section className="container mx-auto px-4 py-12 relative z-10">
        <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Explore Key Features
          </h2>
          <p className="text-center text-gray-400 mb-8 text-base sm:text-lg">
            Interactive tools for data-driven insights
          </p>
          <SkewCards />
        </div>
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Platform Features
          </h2>
          <p className="text-center text-gray-400 mb-12 text-base sm:text-lg">
            Explore powerful analytical tools and insights
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Database className="w-12 h-12" />}
              title="Dataset Transparency"
              description="View raw data, download original CSVs, inspect all 3 UIDAI datasets used in our analysis."
              link="/datasets"
              gradient="from-blue-500 to-cyan-500"
              delay="delay-100"
            />
            
            <FeatureCard
              icon={<BarChart3 className="w-12 h-12" />}
              title="6 Core Metrics"
              description="DPI, BAI, SUR, GFI, CCI, Mobility Ratio - all recalculated live with adjustable parameters."
              link="/metrics"
              gradient="from-green-500 to-emerald-500"
              delay="delay-200"
            />
            
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12" />}
              title="Policy Shock Analysis"
              description="Explore deadline panic, PAN-Aadhaar linking, Assam freeze impacts through interactive timelines."
              link="/policy-shock"
              gradient="from-teal-500 to-emerald-500"
              delay="delay-300"
            />
            
            <FeatureCard
              icon={<MapPin className="w-12 h-12" />}
              title="Migration Lab"
              description="Festival migration, school sync, harvest seasons - detect mobility patterns in update data."
              link="/migration"
              gradient="from-orange-500 to-red-500"
              delay="delay-400"
            />
            
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title="Border Security"
              description="BAI tracking, ghost ID detection, verification patterns across sensitive districts."
              link="/security"
              gradient="from-red-500 to-rose-500"
              delay="delay-500"
            />
            
            <FeatureCard
              icon={<AlertTriangle className="w-12 h-12" />}
              title="Threat Intelligence"
              description="Composite risk heatmap combining 4 dimensions - the Red Belt visualization."
              link="/threat-intelligence"
              gradient="from-yellow-500 to-orange-500"
              delay="delay-600"
            />
          </div>
        </div>
      </section>

      {/* Dataset Overview */}
      <section className="bg-gradient-to-br from-black via-gray-950 to-black py-20 relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className={`container mx-auto px-4 relative z-10 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-white">
            Data Coverage
          </h2>
          <p className="text-center text-gray-400 mb-12 text-base sm:text-lg">
            Comprehensive nationwide analysis
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StatCard
              number="36"
              label="States & UTs"
              sublabel="Geographic Coverage"
              delay="delay-100"
            />
            <StatCard
              number="640+"
              label="Districts"
              sublabel="Granular Analysis"
              delay="delay-300"
            />
            <StatCard
              number="2.5M+"
              label="Records"
              sublabel="Data Points Analyzed"
              delay="delay-500"
            />
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className={`max-w-3xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Our Approach
          </h2>
          <p className="text-center text-gray-400 mb-12 text-base sm:text-lg">
            Built on transparency and reproducibility
          </p>
          
          <div className="space-y-6">
            <MethodologyStep
              number="1"
              title="Fixed Dataset"
              description="UIDAI public datasets (enrolment, demographic updates, biometric updates) - unchanged, downloadable."
              color="from-blue-500 to-cyan-500"
            />
            <MethodologyStep
              number="2"
              title="Transparent Metrics"
              description="All 6 core indicators (DPI, BAI, SUR, GFI, CCI, Mobility) calculated client-side using Python via Pyodide."
              color="from-teal-500 to-emerald-500"
            />
            <MethodologyStep
              number="3"
              title="Adjustable Parameters"
              description="Time windows, thresholds, geographic filters - see how assumptions change conclusions."
              color="from-green-500 to-emerald-500"
            />
            <MethodologyStep
              number="4"
              title="Ethical Framework"
              description="Aggregate-only analysis. No individual inference. No enforcement recommendations. Signals, not verdicts."
              color="from-orange-500 to-red-500"
            />
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Link
              href="/methodology"
              className="group inline-flex items-center gap-2 text-cyan-400 font-semibold hover:text-teal-400 transition-colors text-base sm:text-lg">
              Read Full Methodology & Ethics 
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, link, gradient, delay }) {
  return (
    <Link href={link}>
      <div className={`group bg-gray-800/50 backdrop-blur-sm p-5 sm:p-6 md:p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 cursor-pointer h-full border border-gray-700 hover:border-cyan-500/50 hover:-translate-y-2 ${delay} animate-fade-in-up`}>
        <div className={`mb-4 sm:mb-6 inline-block p-3 sm:p-4 rounded-xl bg-gradient-to-br ${gradient} text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-cyan-400 group-hover:to-teal-400 transition-all">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{description}</p>
        <div className="mt-3 sm:mt-4 flex items-center text-cyan-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-sm sm:text-base">
          Explore <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}

function StatCard({ number, label, sublabel, delay }) {
  return (
    <div className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-5 sm:p-6 md:p-8 rounded-2xl shadow-2xl text-center border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-cyan-500/20 ${delay} animate-fade-in-up`}>
      <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2 sm:mb-3 animate-pulse">
        {number}
      </div>
      <div className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">{label}</div>
      <div className="text-xs sm:text-sm text-gray-400">{sublabel}</div>
    </div>
  );
}

function MethodologyStep({ number, title, description, color }) {
  return (
    <div className="group flex gap-4 sm:gap-6 p-4 sm:p-5 md:p-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl hover:bg-gray-800/60 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 border border-gray-700 hover:border-gray-600">
      <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br ${color} text-white rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
        {number}
      </div>
      <div>
        <h3 className="font-bold text-lg sm:text-xl mb-1 sm:mb-2 text-gray-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-cyan-400 group-hover:to-teal-400 transition-all">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
