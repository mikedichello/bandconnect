/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle so the app runs in a tiny Docker image
  // on any Node host (Railway, Render, Fly, a VPS). Ignored by Vercel, which
  // builds natively.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
