/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Vercel deployment
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Configure webpack for Pyodide
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Pyodide needs to be loaded client-side only
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    // Handle CSV files
    config.module.rules.push({
      test: /\.csv$/,
      use: 'raw-loader',
    });
    
    return config;
  },
  
  // Optimize for large data files
  experimental: {
    largePageDataBytes: 128 * 100000, // 12.8MB (increased from default 128KB)
  },
};

module.exports = nextConfig;
