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
    // Enable modern React features
    optimizePackageImports: ['lucide-react'],
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
  
  // Webpack configuration to help with debugging and handle local modules
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Add source maps for better debugging
      config.devtool = 'eval-source-map';
    }
    
    // Handle local modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@pixie': '/local_modules/pixie',
    };
    
    // Handle UMD modules
    config.module.rules.push({
      test: /\.umd\.js$/,
      type: 'asset/resource',
    });
    
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
  
  // Copy Pixie assets to public directory
  async rewrites() {
    return [
      {
        source: '/pixie-assets/:path*',
        destination: '/local_modules/pixie/assets/:path*',
      },
    ];
  },
};

export default nextConfig;
