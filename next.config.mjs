/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Suppress hydration warnings in development
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
  // Experimental features that might help with hydration
  experimental: {
    // Enable concurrent features
    concurrentFeatures: true,
  },
  
  // Add timeout configurations
  serverRuntimeConfig: {
    // Increase timeout for server-side operations
    timeout: 30000, // 30 seconds
  },
  
  publicRuntimeConfig: {
    // Increase timeout for client-side operations
    timeout: 30000, // 30 seconds
  },
  
  // Webpack configuration to help with debugging
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Add source maps for better debugging
      config.devtool = 'eval-source-map';
    }
    return config;
  },
  
  // Add API timeout handling
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Response-Time',
            value: '30000',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
