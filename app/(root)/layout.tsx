import React, { ReactNode } from "react";

import Navbar from "@/components/Navbar";
import FeedbackWidget from "@/components/FeedbackWidget";

const RootLayout = ({ children }: { children: ReactNode }) => {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mocknetic.com",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <Navbar />
      <div className="pt-15">{children}</div>
      <FeedbackWidget />
    </main>
  );
};

export default RootLayout;
