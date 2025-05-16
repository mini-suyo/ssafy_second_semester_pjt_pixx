"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import StarBackground from "@/components/StarBackground";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcomePage = pathname === "/welcome";

  return (
    <div className="app-container">
      {!isWelcomePage && <Header />}
      <StarBackground />
      <main className="main-content">{children}</main>
      {!isWelcomePage && <Navbar />}
    </div>
  );
}
