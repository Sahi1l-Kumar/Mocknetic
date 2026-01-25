import CodeEditorClient from "@/components/CodeEditorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Editor - Online Compiler & IDE",
  description:
    "Practice coding with our online code editor supporting multiple languages. Write, compile, and execute code instantly with syntax highlighting and real-time feedback.",
  keywords: [
    "online code editor",
    "code compiler online",
    "online IDE",
    "programming editor",
    "multi-language compiler",
    "coding practice editor",
    "browser IDE",
    "run code online",
  ],
  openGraph: {
    title: "Code Editor - Online Compiler & IDE | Mocknetic",
    description:
      "Practice coding with our online code editor. Write, compile, and execute code instantly.",
    url: "https://mocknetic.com/code-editor",
    siteName: "Mocknetic",
    type: "website",
    images: [
      {
        url: "https://mocknetic.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mocknetic Code Editor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Code Editor | Mocknetic",
    description:
      "Practice coding with our online code editor supporting multiple languages.",
    images: ["https://mocknetic.com/og-image.png"],
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
  alternates: {
    canonical: "https://mocknetic.com/code-editor",
  },
};

export default function Page() {
  return <CodeEditorClient />;
}
