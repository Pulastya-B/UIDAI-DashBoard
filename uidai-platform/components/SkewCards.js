'use client';

import React from 'react';
import Link from 'next/link';

const cards = [
  {
    title: 'Interactive Metrics',
    desc: 'Calculate and visualize all 6 UIDAI metrics in real-time with adjustable parameters. Explore state-level and district-level patterns with Python-powered analytics.',
    gradientFrom: '#06b6d4', // cyan-500
    gradientTo: '#14b8a6',   // teal-500
    link: '/metrics',
  },
  {
    title: 'Threat Intelligence',
    desc: 'Advanced border security analysis combining multiple indicators. Identify high-risk regions with our composite threat scoring system and geographic heat maps.',
    gradientFrom: '#ef4444', // red-500
    gradientTo: '#ec4899',   // pink-500
    link: '/threat-intelligence',
  },
  {
    title: 'Dataset Explorer',
    desc: 'Access raw UIDAI data with full transparency. Download original CSVs, inspect data quality, and understand the foundation of every calculation.',
    gradientFrom: '#10b981', // emerald-500
    gradientTo: '#0891b2',   // cyan-600
    link: '/datasets',
  },
];

export default function SkewCards() {
  return (
    <div className="flex justify-center items-center flex-wrap py-10 min-h-fit">
      {cards.map(({ title, desc, gradientFrom, gradientTo, link }, idx) => (
        <div
          key={idx}
          className="group relative w-[320px] h-[400px] m-[40px_30px] transition-all duration-500"
        >
          {/* Skewed gradient panels */}
          <span
            className="absolute top-0 left-[50px] w-1/2 h-full rounded-lg transform skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-90px)]"
            style={{
              background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
            }}
          />
          <span
            className="absolute top-0 left-[50px] w-1/2 h-full rounded-lg transform skew-x-[15deg] blur-[30px] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-90px)]"
            style={{
              background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
            }}
          />

          {/* Animated blurs */}
          <span className="pointer-events-none absolute inset-0 z-10">
            <span className="absolute top-0 left-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-100 animate-blob group-hover:top-[-50px] group-hover:left-[50px] group-hover:w-[100px] group-hover:h-[100px] group-hover:opacity-100" />
            <span className="absolute bottom-0 right-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-500 animate-blob animation-delay-1000 group-hover:bottom-[-50px] group-hover:right-[50px] group-hover:w-[100px] group-hover:h-[100px] group-hover:opacity-100" />
          </span>

          {/* Content with gradient overlay */}
          <div 
            className="relative z-20 left-0 p-[20px_40px] backdrop-blur-[10px] shadow-lg rounded-lg text-white transition-all duration-500 group-hover:left-[-25px] group-hover:p-[60px_40px] h-full flex flex-col justify-between overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}15, ${gradientTo}25)`,
            }}
          >
            {/* Gradient overlay that intensifies on hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${gradientFrom}40, ${gradientTo}40)`,
              }}
            />
            
            <div className="relative z-10">
              <h2 className="text-2xl mb-4 font-bold">{title}</h2>
              <p className="text-base leading-relaxed mb-4 text-gray-100">{desc}</p>
            </div>
            <Link
              href={link}
              className="relative z-10 inline-block text-base font-bold text-gray-900 bg-white px-4 py-2.5 rounded-lg hover:bg-white hover:shadow-lg transition-all transform hover:scale-105 w-fit"
              style={{
                backgroundColor: 'white',
              }}
            >
              Explore →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
