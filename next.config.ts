
import type {NextConfig} from 'next';
import type { Configuration as WebpackConfiguration } from 'webpack';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  webpack: (
    config: WebpackConfiguration,
    // options: { buildId: string; dev: boolean; isServer: boolean; defaultLoaders: any; nextRuntime?: string; totalPages?: number }
  ) => {
    // Handlebars uses `require.extensions` which is not supported by Webpack.
    // Adding it to `noParse` tells Webpack not to parse this file for Node.js specific constructs.
    const newNoParseRule = /node_modules\/handlebars\/lib\/index\.js$/;
    const existingNoParse = config.module?.noParse;

    if (Array.isArray(existingNoParse)) {
      config.module.noParse = [...existingNoParse, newNoParseRule];
    } else if (existingNoParse) { // it's a single RegExp
      config.module.noParse = [existingNoParse, newNoParseRule];
    } else {
      config.module.noParse = [newNoParseRule];
    }

    return config;
  },
};

export default nextConfig;
