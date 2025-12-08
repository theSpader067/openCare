import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Increase request body size limit for OCR image uploads
  // Default is 1MB, we need more for base64 encoded images
  // 10MB supports high-quality medical images
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default nextConfig;
