import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Site links are written as /section/page/ (matching the original static build).
  trailingSlash: true,
  // Pages read templates/ and content/ from disk when they are rendered.
  outputFileTracingIncludes: { '/**': ['./templates/**', './content/*.json'] },
};

export default nextConfig;
