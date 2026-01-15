'use client';

import { BookOpen, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-12 h-12 text-teal-400" />
            <h1 className="text-5xl font-bold text-white">
              Methodology & Ethics
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Transparency, Limitations, and Ethical Framework
          </p>
        </div>

        {/* Ethical Commitment */}
        <div className="bg-gradient-to-r from-green-900 to-teal-900 border border-green-600 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <CheckCircle className="text-green-400" />
            Our Ethical Commitments
          </h2>
          <div className="space-y-4 text-green-100">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <strong>Aggregate-Only Analysis:</strong> We work exclusively with state and district-level summaries. 
                No individual Aadhaar records are analyzed or stored.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <strong>Transparent Methodology:</strong> Every metric calculation is documented with source code. 
                All analysis steps are reproducible.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <strong>Public Good Focus:</strong> Our goal is to support UIDAI's mission of inclusive identity services, 
                not to expose vulnerabilities for exploitation.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <strong>Responsible Disclosure:</strong> Security findings are framed as "signals requiring investigation," 
                not definitive accusations.
              </div>
            </div>
          </div>
        </div>

        {/* Proxy Justifications */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Proxy Metrics Justification</h2>
          
          <div className="space-y-6">
            <ProxyCard
              title="Pincode Density = Rural/Urban Classification"
              rationale="Pincodes in dense areas typically correlate with urban centers. We use pincode-per-district ratios to approximate population distribution patterns."
              limitation="Not all dense pincodes are urban (e.g., industrial zones), and some rural areas have high pincode counts."
            />
            
            <ProxyCard
              title="Demo/Bio Ratio (BAI) = Identity Verification Anxiety"
              rationale="Higher demographic update rates relative to biometric updates suggest citizens prioritizing address/name changes over fingerprint verification, a pattern observed in border states."
              limitation="Could also reflect legitimate migration, marriage name changes, or differential service availability."
            />
            
            <ProxyCard
              title="Enrollment/Update Ratio (GFI) = Ghost ID Risk"
              rationale="When new enrollments vastly exceed update activity, it may indicate inactive/duplicate accounts. Active users typically update periodically."
              limitation="New population centers (upcoming cities) naturally show high enrollment-to-update ratios."
            />
            
            <ProxyCard
              title="Update Rate (SUR) = Digital Governance Engagement"
              rationale="States with higher per-capita Aadhaar activity tend to have robust welfare programs requiring frequent identity verification."
              limitation="Could reflect enforcement policies rather than organic citizen engagement."
            />
          </div>
        </div>

        {/* What We DON'T Claim */}
        <div className="bg-gradient-to-r from-red-900 to-orange-900 border border-red-600 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <XCircle className="text-red-400" />
            What We DON'T Claim
          </h2>
          <div className="space-y-4 text-red-100">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div>
                <strong>NOT Fraud Detection:</strong> Our anomaly signals identify statistical outliers, not confirmed fraud. 
                Multiple legitimate factors can cause unusual patterns.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div>
                <strong>NOT Predictive:</strong> We analyze historical patterns (2017-2018 data). 
                Current conditions may differ significantly.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div>
                <strong>NOT Causation:</strong> Correlations (e.g., Diwali migration spikes) don't prove causation. 
                Multiple factors influence Aadhaar activity simultaneously.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div>
                <strong>NOT Ground Truth:</strong> Our population estimates and rural/urban classifications are approximations. 
                Official census data should be used for policy decisions.
              </div>
            </div>
          </div>
        </div>

        {/* Technical Methodology */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Technical Methodology</h2>
          
          <div className="space-y-6">
            <MethodCard
              step="1"
              title="Data Ingestion"
              description="12 CSV files (4 biometric + 5 demographic + 3 enrolment) totaling ~5M records. Merged on (Date, State, District, Pincode) using pandas."
            />
            
            <MethodCard
              step="2"
              title="Aggregation"
              description="Summed to district-daily level to reduce noise and protect individual privacy. Created 4 JSON files: state_summary, district_summary, monthly_summary, district_daily."
            />
            
            <MethodCard
              step="3"
              title="Metric Calculation"
              description="6 core metrics (DPI, BAI, SUR, GFI, CCI, Mobility) calculated using Python in browser via Pyodide (WebAssembly). No backend server required."
            />
            
            <MethodCard
              step="4"
              title="Anomaly Detection"
              description="Z-score method with adjustable thresholds (1σ, 2σ, 3σ). Flags states with ≥1 metric beyond threshold."
            />
            
            <MethodCard
              step="5"
              title="Risk Scoring"
              description="Composite risk = weighted combination of normalized BAI (30%), CCI (30%), GFI (20%), DPI (20%). Scikit-learn MinMaxScaler for normalization."
            />
          </div>
        </div>

        {/* Reproducibility */}
        <div className="bg-gradient-to-r from-cyan-900 to-teal-900 border border-cyan-600 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Reproducibility Guide</h2>
          <div className="text-blue-100 space-y-3">
            <p>
              <strong>1. Data Preparation:</strong> Run <code className="bg-blue-800 px-2 py-1 rounded">python scripts/prepare_data.py</code> 
              to convert 12 CSVs to 4 optimized JSON files.
            </p>
            <p>
              <strong>2. Launch Platform:</strong> <code className="bg-blue-800 px-2 py-1 rounded">npm run dev</code> starts 
              Next.js server with Pyodide integration.
            </p>
            <p>
              <strong>3. Inspect Code:</strong> All metric calculations in <code className="bg-blue-800 px-2 py-1 rounded">components/MetricCalculator.js</code> 
              use inline Python code (visible in browser console).
            </p>
            <p>
              <strong>4. Verify Results:</strong> Every metric page includes "Download JSON" button to export raw calculation results.
            </p>
            <p className="mt-4 pt-4 border-t border-blue-700">
              <strong>Source Code:</strong> Complete platform available on GitHub (link to be added). 
              MIT License – fork, audit, improve!
            </p>
          </div>
        </div>

        {/* Bibliography */}
        <div className="bg-gray-800 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">References & Inspirations</h2>
          <div className="space-y-4 text-gray-300">
            <BibItem
              authors="UIDAI"
              title="Aadhaar Public Datasets (2025)"
              source="Provided for hackathon analysis"
            />
            <BibItem
              authors="Census of India"
              title="Population estimates by state (2011 Census)"
              source="Used for per-capita normalization"
            />
            <BibItem
              authors="Various"
              title="Policy event timeline"
              source="Assam NRC (2017), PAN-Aadhaar linkage (2018), MBU drive (2018)"
            />
            <BibItem
              authors="Z-Score Method"
              title="Standard deviation-based outlier detection"
              source="Classical statistical method for anomaly identification"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>Built with transparency, analyzed with rigor, presented with humility.</p>
          <p className="mt-2">UIDAI Aadhaar Hackathon 2024</p>
        </div>
      </div>
    </div>
  );
}

function ProxyCard({ title, rationale, limitation }) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border-l-4 border-teal-500">
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <div className="space-y-2 text-gray-300">
        <p><strong className="text-green-400">Rationale:</strong> {rationale}</p>
        <p><strong className="text-yellow-400">Limitation:</strong> {limitation}</p>
      </div>
    </div>
  );
}

function MethodCard({ step, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
        {step}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
}

function BibItem({ authors, title, source }) {
  return (
    <div className="pl-4 border-l-2 border-gray-700">
      <p className="text-white font-semibold">{authors}</p>
      <p className="text-gray-300 italic">{title}</p>
      <p className="text-gray-500 text-sm">{source}</p>
    </div>
  );
}
