import React, { ReactNode } from "react";

import Navbar from "@/components/Navbar";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="min-h-screen bg-slate-50 relative">
      <Navbar />
      <div className="pt-15">{children}</div>
    </main>
  );
};

export default RootLayout;
