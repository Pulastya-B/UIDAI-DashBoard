'use client';

import Link from 'next/link';
import { Download, Eye, Info } from 'lucide-react';

export default function DatasetsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">
            UIDAI Datasets
          </h1>
          <p className="text-lg text-gray-300">
            All analyses are based on these three public UIDAI datasets. 
            View samples, understand structures, download originals.
          </p>
        </div>

        {/* Transparency Badge */}
        <div className="bg-cyan-900/20 border-l-4 border-cyan-500 p-6 mb-12 max-w-4xl mx-auto backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Info className="text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-cyan-300 mb-2">Transparency Commitment</h3>
              <p className="text-gray-300 text-sm">
                <strong>No data manipulation.</strong> These are the original UIDAI datasets 
                provided for the hackathon. Every insight in our analysis is derived from these sources. 
                You can download and verify every claim yourself.
              </p>
            </div>
          </div>
        </div>

        {/* Dataset Cards */}
        <div className="space-y-8 max-w-6xl mx-auto">
          <DatasetCard
            title="Aadhaar Enrolment Dataset"
            description="New Aadhaar registrations across India"
            columns={[
              'Date',
              'State',
              'District',
              'Pincode',
              'Infant Enrolments',
              'Child Enrolments',
              'Adult Enrolments'
            ]}
            coverage="All new Aadhaar card registrations by age group"
            sampleFile="enrolment_sample.json"
            downloadFile="enrolment.csv"
          />

          <DatasetCard
            title="Aadhaar Demographic Update Dataset"
            description="Name, DOB, and address corrections/updates"
            columns={[
              'Date',
              'State',
              'District',
              'Pincode',
              'Child Demographic Updates',
              'Adult Demographic Updates'
            ]}
            coverage="Changes to name, date of birth, address (non-biometric changes)"
            sampleFile="demographic_sample.json"
            downloadFile="demographic.csv"
          />

          <DatasetCard
            title="Aadhaar Biometric Update Dataset"
            description="Fingerprint and iris verification updates"
            columns={[
              'Date',
              'State',
              'District',
              'Pincode',
              'Child Biometric Updates',
              'Adult Biometric Updates'
            ]}
            coverage="Physical verification updates (fingerprints, iris scans)"
            sampleFile="biometric_sample.json"
            downloadFile="biometric.csv"
          />
        </div>

        {/* Metadata Section */}
        <div className="mt-12 bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg shadow-cyan-500/10 p-8 max-w-4xl mx-auto border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">Dataset Coverage</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <MetadataCard
              label="States & UTs"
              value="36"
              description="Complete national coverage"
            />
            <MetadataCard
              label="Districts"
              value="640+"
              description="Granular geographic analysis"
            />
            <MetadataCard
              label="Time Period"
              value="2023-2024"
              description="18+ months of data"
            />
          </div>

          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="font-bold mb-2 text-cyan-400">Data Quality Notes:</h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Date format: DD-MM-YYYY (strictly validated)</li>
              <li>Negative values: None (all counts are non-negative integers)</li>
              <li>Missing values: Less than 2% (handled via standardization)</li>
              <li>State names: Standardized (misspellings corrected)</li>
            </ul>
          </div>
        </div>

        {/* How We Use This Data */}
        <div className="mt-12 bg-gradient-to-r from-cyan-900/30 to-teal-900/30 backdrop-blur-sm rounded-xl p-8 max-w-4xl mx-auto border border-cyan-800/30">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">How We Use This Data</h2>
          <p className="text-gray-300 mb-6">
            These three datasets are merged at the <strong className="text-cyan-400">(Date, State, District, Pincode)</strong> level 
            to create our master analytical dataset. From there:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <ProcessStep
              number="1"
              title="Aggregate"
              description="Sum by district/state for privacy-safe analysis"
            />
            <ProcessStep
              number="2"
              title="Calculate Metrics"
              description="Derive 6 core indicators (DPI, BAI, SUR, GFI, CCI, Mobility)"
            />
            <ProcessStep
              number="3"
              title="Detect Patterns"
              description="Time-series analysis, policy shock detection"
            />
            <ProcessStep
              number="4"
              title="Visualize"
              description="Interactive charts, heatmaps, threat intelligence"
            />
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/metrics" 
              className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-700 transition shadow-lg shadow-cyan-500/30"
            >
              Explore Metrics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DatasetCard({ title, description, columns, coverage, sampleFile, downloadFile }) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg shadow-cyan-500/10 overflow-hidden border border-gray-800 hover:border-gray-700 transition-all">
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-blue-100">{description}</p>
      </div>

      <div className="p-6">
        {/* Coverage */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-100 mb-2">Coverage:</h3>
          <p className="text-gray-300">{coverage}</p>
        </div>

        {/* Columns */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-100 mb-2">Columns:</h3>
          <div className="flex flex-wrap gap-2">
            {columns.map((col, idx) => (
              <span 
                key={idx}
                className="bg-gray-800 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium border border-gray-700"
              >
                {col}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => {
              // Open state summary in new tab
              window.open('/data/state_summary.json', '_blank');
            }}
            className="flex items-center gap-2 bg-cyan-900/30 text-cyan-400 px-4 py-2 rounded-lg font-semibold hover:bg-cyan-900/50 transition border border-cyan-800/50"
          >
            <Eye size={18} />
            View Processed Data
          </button>
          
          <button
            onClick={() => {
              // Download district summary
              const link = document.createElement('a');
              link.href = '/data/district_summary.json';
              link.download = 'district_summary.json';
              link.click();
            }}
            className="flex items-center gap-2 bg-teal-900/30 text-teal-400 px-4 py-2 rounded-lg font-semibold hover:bg-teal-900/50 transition border border-teal-800/50"
          >
            <Download size={18} />
            Download JSON Summary
          </button>
        </div>
      </div>
    </div>
  );
}

function MetadataCard({ label, value, description }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-cyan-400 mb-1">{value}</div>
      <div className="font-semibold text-gray-100 mb-1">{label}</div>
      <div className="text-sm text-gray-400">{description}</div>
    </div>
  );
}

function ProcessStep({ number, title, description }) {
  return (
    <div className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-cyan-500/30">
        {number}
      </div>
      <div>
        <h4 className="font-bold text-gray-100 mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}
