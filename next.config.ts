import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Artwork files live on IPFS; cards render them straight from the gateways listed in
    // lib/domain/config/ipfs.ts, which retries the next host when one refuses.
    remotePatterns: [
      { protocol: 'https', hostname: 'gateway.pinata.cloud' },
      { protocol: 'https', hostname: 'w3s.link' },
      { protocol: 'https', hostname: 'dweb.link' },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
