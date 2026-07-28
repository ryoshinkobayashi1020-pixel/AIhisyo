/** @type {import('next').NextConfig} */
const nextConfig = {
  // sharp is loaded by the invoice API at runtime. Vercel's output tracer can
  // otherwise omit libvips' Linux shared libraries from the serverless bundle.
  outputFileTracingIncludes: {
    "/api/accounting/invoice": [
      "./node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*",
      "./assets/invoice-template.png",
      "./assets/fonts/**/*",
    ],
  },
};

export default nextConfig;
