import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Ensure Turbo-pack compatibility with Next's module loading
  // See https://github.com/vercel/next.js/issues/64472#issuecomment-2077483493
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // Logs outbounds requests, including ones restored from the HMR cache
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
};

export default nextConfig;
