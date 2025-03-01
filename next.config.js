/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Set up rewrites to proxy API requests to backend server in development
  // This is needed because Next.js has a built-in server and we need to forward /api requests
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', // Proxy to backend API
      },
    ];
  },
  // Disable specific module prefetching that could cause issues
  webpack: (config) => {
    // Fix issues with specific packages that might not be compatible with webpack 5
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      path: false,
      child_process: false,
    };

    return config;
  },
  // Transpile specific problematic modules
  transpilePackages: [
    'plotly.js',
    'react-plotly.js',
    'react-force-graph-2d',
    'react-force-graph-3d',
    'three',
    'd3',
  ],
};

module.exports = nextConfig; 