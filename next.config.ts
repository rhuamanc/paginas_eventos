import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Avatares de Google (foto de perfil OAuth)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Imagenes subidas a Google Drive
      { protocol: "https", hostname: "drive.google.com" },
      // Fotos de Unsplash (galeria por defecto)
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
