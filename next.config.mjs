/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingIncludes: { "/design/files/*": ["./design-assets/**/*"] },
};
export default nextConfig;
