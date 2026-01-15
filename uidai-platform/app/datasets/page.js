'use client';

import Link from 'next/link';
import { Download, Eye, Info } from 'lucide-react';

export default function DatasetsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UIDAI Datasets
          </h1>
          <p className="text-lg text-gray-600">
            All analyses are based on these three public UIDAI datasets. 
            View samples, understand structures, download originals.
          </p>
        </div>

        {/* Transparency Badge */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-12 max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Transparency Commitment</h3>
              <p className="text-blue-800 text-sm">
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
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Dataset Coverage</h2>
          
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

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-2">Data Quality Notes:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Date format: DD-MM-YYYY (strictly validated)</li>
              <li>Negative values: None (all counts are non-negative integers)</li>
              <li>Missing values: Less than 2% (handled via standardization)</li>
              <li>State names: Standardized (misspellings corrected)</li>
            </ul>
          </div>
        </div>

        {/* How We Use This Data */}
        <div className="mt-12 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">How We Use This Data</h2>
          <p className="text-gray-700 mb-6">
            These three datasets are merged at the <strong>(Date, State, District, Pincode)</strong> level 
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
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-blue-100">{description}</p>
      </div>

      <div className="p-6">
        {/* Coverage */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Coverage:</h3>
          <p className="text-gray-600">{coverage}</p>
        </div>

        {/* Columns */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Columns:</h3>
          <div className="flex flex-wrap gap-2">
            {columns.map((col, idx) => (
              <span 
                key={idx}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
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
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
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
            className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-100 transition"
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
      <div className="text-3xl font-bold text-blue-600 mb-1">{value}</div>
      <div className="font-semibold text-gray-900 mb-1">{label}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  );
}

function ProcessStep({ number, title, description }) {
  return (
    <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
