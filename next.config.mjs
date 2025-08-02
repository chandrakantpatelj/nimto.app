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
  
  // Webpack configuration to help with debugging
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Add source maps for better debugging
      config.devtool = 'eval-source-map';
    }
    return config;
  },
};

export default nextConfig;
