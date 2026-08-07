import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SilaPlan — тренировъчен план, изчислен до килограм",
    short_name: "SilaPlan",
    description: "Персонален генератор и дневник за силови тренировки",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0908",
    theme_color: "#0a0908",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
