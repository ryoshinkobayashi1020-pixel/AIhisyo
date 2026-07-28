/** @type {import('next').NextConfig} */
const nextConfig = {
  // sharp is loaded by the invoice API at runtime. Vercel's output tracer can
  // otherwise omit libvips' Linux shared libraries from the serverless bundle.
  outputFileTracingIncludes: {
    "/api/accounting/invoice": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/**/*",
      "./assets/invoice-template.png",
      "./assets/fonts/**/*",
    ],
  },
};

export default nextConfig;
