/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // /en/programs → рендира се от app/programs/page.tsx, но URL-ът в
      // браузъра остава /en/programs. Компонентите четат usePathname()
      // и разпознават префикса "/en", за да покажат английския текст.
      { source: "/en", destination: "/" },
      { source: "/en/:path*", destination: "/:path*" },
    ];
  },
};

export default nextConfig;
