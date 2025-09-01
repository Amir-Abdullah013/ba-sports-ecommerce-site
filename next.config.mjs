/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase API body size limit for image uploads
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // Image optimization settings
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
