'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gray-900/80 backdrop-blur-lg shadow-lg shadow-blue-500/10 border-b border-gray-800' 
        : 'bg-gray-900 shadow-md shadow-blue-500/10'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-3 py-1 rounded-lg font-bold text-xl transform group-hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30">
              UIDAI
            </div>
            <span className="font-semibold text-gray-200 hidden md:block group-hover:text-blue-400 transition-colors">
              Analytical Platform
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-blue-400 font-medium transition-colors relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <Link href="/datasets" className="text-gray-300 hover:text-blue-400 font-medium transition-colors relative group">
              Datasets
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <Link href="/metrics" className="text-gray-300 hover:text-blue-400 font-medium transition-colors relative group">
              Metrics
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <DropdownMenu
              title="Analysis"
              items={[
                { label: 'Policy Shock', href: '/policy-shock' },
                { label: 'Migration Lab', href: '/migration' },
                { label: 'Security & Border', href: '/security' },
                { label: 'Economic Segmentation', href: '/economic' },
                { label: 'Infrastructure', href: '/infrastructure' },
                { label: 'Anomaly Detection', href: '/anomaly' },
              ]}
            />
            
            <Link 
              href="/threat-intelligence" 
              className="relative text-red-400 hover:text-red-300 font-bold transition-colors group"
            >
              <span className="relative z-10">Threat Intelligence</span>
              <span className="absolute inset-0 bg-red-500/20 rounded-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50"></span>
            </Link>
            
            <Link href="/methodology" className="text-gray-300 hover:text-blue-400 font-medium transition-colors relative group">
              Methodology
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 space-y-2 bg-gray-800/50 backdrop-blur-lg border-t border-gray-700 mt-4 pt-4">
            <MobileLink href="/" onClick={() => setIsOpen(false)}>Home</MobileLink>
            <MobileLink href="/datasets" onClick={() => setIsOpen(false)}>Datasets</MobileLink>
            <MobileLink href="/metrics" onClick={() => setIsOpen(false)}>Metrics</MobileLink>
            <MobileLink href="/policy-shock" onClick={() => setIsOpen(false)}>Policy Shock</MobileLink>
            <MobileLink href="/migration" onClick={() => setIsOpen(false)}>Migration Lab</MobileLink>
            <MobileLink href="/security" onClick={() => setIsOpen(false)}>Security</MobileLink>
            <MobileLink href="/economic" onClick={() => setIsOpen(false)}>Economic</MobileLink>
            <MobileLink href="/infrastructure" onClick={() => setIsOpen(false)}>Infrastructure</MobileLink>
            <MobileLink href="/anomaly" onClick={() => setIsOpen(false)}>Anomaly</MobileLink>
            <MobileLink href="/threat-intelligence" onClick={() => setIsOpen(false)}>
              Threat Intelligence
            </MobileLink>
            <MobileLink href="/methodology" onClick={() => setIsOpen(false)}>Methodology</MobileLink>
          </div>
        )}
      </div>
    </nav>
  );
}

function DropdownMenu({ title, items }) {
  const [isOpen, setIsOpen] = useState(false);
  let closeTimeout;

  const handleMouseEnter = () => {
    if (closeTimeout) clearTimeout(closeTimeout);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="text-gray-300 hover:text-blue-400 font-medium flex items-center gap-1 py-2 relative group transition-colors">
        {title}
        <ChevronDown size={16} className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 pt-1 -mt-1 animate-fade-in-up">
          <div className="bg-gray-800/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10 rounded-xl py-2 min-w-[220px] border border-gray-700"
               style={{
                 boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
               }}>
            {items.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="block px-5 py-3 text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-700 hover:text-blue-400 transition-all group"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex items-center justify-between">
                  {item.label}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileLink({ href, children, onClick }) {
  return (
    <Link 
      href={href} 
      className="block py-2 text-gray-300 hover:text-blue-400 font-medium transition-colors"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
