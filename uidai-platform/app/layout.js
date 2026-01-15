import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata = {
  title: 'UIDAI Analytical Platform - Interactive Research Sandbox',
  description: 'Transparent, reproducible analysis of Aadhaar enrolment and update patterns using UIDAI public datasets',
  keywords: 'UIDAI, Aadhaar, Data Analysis, Policy Research, Border Security, Migration, Infrastructure',
  authors: [{ name: 'Your Team Name' }],
  openGraph: {
    title: 'UIDAI Analytical Platform',
    description: 'Interactive analytical sandbox for exploring Aadhaar flow patterns',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
