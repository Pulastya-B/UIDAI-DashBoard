import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">About This Platform</h3>
            <p className="text-sm leading-relaxed">
              An interactive analytical sandbox built for transparent, reproducible research 
              on UIDAI Aadhaar flow data. All datasets are public, all calculations are open, 
              all assumptions are adjustable.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/datasets" className="hover:text-white">View Datasets</Link></li>
              <li><Link href="/metrics" className="hover:text-white">Explore Metrics</Link></li>
              <li><Link href="/threat-intelligence" className="hover:text-white">Threat Intelligence</Link></li>
              <li><Link href="/methodology" className="hover:text-white">Methodology & Ethics</Link></li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Important Notice</h3>
            <p className="text-sm leading-relaxed">
              This is an independent research platform created for educational purposes. 
              Not affiliated with UIDAI. All analyses are aggregate-level only. 
              No individual-level inferences. No enforcement recommendations.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 text-center text-sm">
          <p>© 2026 UIDAI Analytical Platform | Built for Hackathon Submission</p>
          <p className="mt-2">
            <Link href="/methodology" className="hover:text-white">Privacy & Ethics</Link>
            {' • '}
            <Link href="/datasets" className="hover:text-white">Data Sources</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
