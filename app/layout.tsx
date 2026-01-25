import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Mocknetic | AI-Powered Learning Platform for Coding & Interviews",
    template: "%s | Mocknetic",
  },
  description:
    "Ace Your Interview. Excel in Class. Practice coding problems, take AI mock interviews, skill assessments, and join teacher's classes for personalized learning.",

  keywords: [
    "mocknetic",
    "online learning platform",
    "AI mock interview",
    "coding practice",
    "skill assessment",
    "virtual classroom",
    "technical interview prep",
    "coding interview preparation",
    "student learning portal",
    "online code editor",
    "DSA practice platform",
  ],

  authors: [{ name: "Mocknetic Team" }],
  creator: "Mocknetic",
  publisher: "Mocknetic",

  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://mocknetic.com",
  ),

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mocknetic.com",
    siteName: "Mocknetic",
    title: "Mocknetic | AI-Powered Learning Platform",
    description:
      "Ace Your Interview. Excel in Class. Practice coding, take AI mock interviews, and join virtual classrooms.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mocknetic - AI-Powered Learning Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Mocknetic | AI-Powered Learning Platform",
    description:
      "Ace Your Interview. Excel in Class. Practice coding and take AI mock interviews.",
    images: ["/og-image.png"],
    creator: "@mocknetic",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  applicationName: "Mocknetic",
  category: "Education",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mocknetic",
  },

  manifest: "/manifest.json",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await auth();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://mocknetic.com/#organization",
        name: "Mocknetic",
        url: "https://mocknetic.com",
        logo: {
          "@type": "ImageObject",
          url: "https://mocknetic.com/icon-512.png",
        },
        sameAs: [],
        description: "AI-Powered Learning Platform for Coding & Interviews",
      },
      {
        "@type": "WebSite",
        "@id": "https://mocknetic.com/#website",
        url: "https://mocknetic.com",
        name: "Mocknetic",
        publisher: {
          "@id": "https://mocknetic.com/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://mocknetic.com/?search={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Mocknetic",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "850",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <SessionProvider session={session}>
          {children}
          <Analytics />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
