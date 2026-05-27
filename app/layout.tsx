import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const siteUrl = "https://brandfit-design.netlify.app";
const repositoryUrl = "https://github.com/PixelProLab/BrandFit";
const productName = "BrandFit by Pixel Pro Lab";
const seoDescription =
  "BrandFit by Pixel Pro Lab is a zero-server batch logo resizer for sponsor logo grid cleanup, optical padding control, batch exports, and local design ops.";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BrandFit by Pixel Pro Lab",
  applicationCategory: "DesignApplication, WebApplication",
  operatingSystem: "All",
  browserRequirements: "Requires HTML5 Canvas API",
  url: `${siteUrl}/`,
  downloadUrl: repositoryUrl,
  softwareVersion: "1.0.0",
  description:
    "An open-source, privacy-first automated batch image resizer and padding utility. BrandFit by Pixel Pro Lab optically balances and standardizes sponsor logo grids, partner walls, and corporate brand assets locally in the browser.",
  author: {
    "@type": "Organization",
    name: "Pixel Pro Lab",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  keywords:
    "batch logo resizer, optical balance logo grid, sponsor logo wall tool, transparent whitespace trimmer, local image padding utility, open source asset normalization",
};

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: productName,
  metadataBase: new URL(siteUrl),
  title: "BrandFit | Open-Source Logo Grid & Batch Resizer by Pixel Pro Lab",
  description: seoDescription,
  keywords: [
    "BrandFit by Pixel Pro Lab",
    "Pixel Pro Lab",
    "batch logo resizer",
    "optical balance logo grid",
    "sponsor logo grid",
    "sponsor logo wall tool",
    "transparent whitespace trimmer",
    "zero-server image utility",
  ],
  authors: [{ name: "Pixel Pro Lab", url: "https://github.com/PixelProLab" }],
  creator: "Pixel Pro Lab",
  publisher: "Pixel Pro Lab",
  category: "Design software",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: productName,
    title: "BrandFit by Pixel Pro Lab | Open-Source Logo Grid & Batch Resizer",
    description: seoDescription,
    images: [
      {
        url: "/BrandFit GitHub Social Preview.png",
        width: 1280,
        height: 640,
        alt: "BrandFit by Pixel Pro Lab social preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandFit by Pixel Pro Lab | Open-Source Logo Grid & Batch Resizer",
    description: seoDescription,
    images: ["/BrandFit GitHub Social Preview.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/brandfit-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/brandfit-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/brandfit-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [
      {
        url: "/icons/brandfit-apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  other: {
    "msapplication-TileColor": "#000000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          // JSON-LD is static product metadata for search engines and AI agents.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
