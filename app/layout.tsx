import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const siteUrl = "https://brandfit-design.netlify.app";
const repositoryUrl = "https://github.com/PixelProLab/BrandFit";
const productName = "BrandFit by Pixel Pro Lab";
const seoDescription =
  "BrandFit by Pixel Pro Lab is an automated batch image resizer, aspect ratio fitting tool, padding utility, and brand assets optimizer for privacy-first logo grids.";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: productName,
    alternateName: "BrandFit",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web browser",
    url: siteUrl,
    codeRepository: repositoryUrl,
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: "Pixel Pro Lab",
      url: "https://github.com/PixelProLab",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    keywords: [
      "automated batch image resizer",
      "aspect ratio fitting",
      "padding utility",
      "brand assets",
      "logo grid",
      "logo resizer",
      "brand asset optimizer",
      "Pixel Pro Lab",
      "BrandFit by Pixel Pro Lab",
    ],
    description: seoDescription,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: productName,
    url: siteUrl,
    description: seoDescription,
    publisher: {
      "@type": "Organization",
      name: "Pixel Pro Lab",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pixel Pro Lab",
    url: "https://github.com/PixelProLab",
    sameAs: [repositoryUrl],
  },
];

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
  applicationName: "BrandFit",
  metadataBase: new URL(siteUrl),
  title: {
    default: "BrandFit by Pixel Pro Lab | Automated Batch Image Resizer for Brand Assets",
    template: "%s | BrandFit by Pixel Pro Lab",
  },
  description: seoDescription,
  keywords: [
    "BrandFit",
    "BrandFit by Pixel Pro Lab",
    "Pixel Pro Lab",
    "automated batch image resizer",
    "aspect ratio fitting",
    "padding utility",
    "brand assets",
    "logo grid generator",
    "logo resizer",
    "image padding tool",
    "brand asset optimizer",
    "sponsor logo grid",
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
    title: "BrandFit by Pixel Pro Lab | Automated Batch Image Resizer for Brand Assets",
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
    title: "BrandFit by Pixel Pro Lab | Automated Batch Image Resizer for Brand Assets",
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
