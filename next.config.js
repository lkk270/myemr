/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["myemrs3.s3.us-east-2.amazonaws.com"],
  },
  experimental: {
    // …
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

module.exports = nextConfig;
