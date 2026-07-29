import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const basePath = "/homesafe";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-display", subsets: ["latin"] });

export const dynamic = "force-static";

export const metadata: Metadata = {
  metadataBase: new URL("https://edricked.github.io/homesafe/"),
  title: "HomeSafe — Know the next safe step",
  description: "An offline-first household emergency plan with clear guidance and prepared check-ins.",
  manifest: `${basePath}/manifest.webmanifest`,
  icons: { icon: `${basePath}/favicon.svg`, apple: `${basePath}/favicon.svg` },
  openGraph: {
    title: "HomeSafe",
    description: "Know the next safe step.",
    type: "website",
    images: [{ url: `${basePath}/og.png`, width: 1733, height: 909, alt: "HomeSafe — Know the next safe step." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeSafe",
    description: "Know the next safe step.",
    images: [`${basePath}/og.png`],
  },
};

export const viewport: Viewport = {
  themeColor: "#173d35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${newsreader.variable}`}>{children}</body>
    </html>
  );
}
