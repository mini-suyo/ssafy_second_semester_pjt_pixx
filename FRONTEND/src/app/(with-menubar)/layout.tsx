// app/(with-menubar)/layout.tsx
"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Menubar from "@/components/Menubar";

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDetailPage = /^\/(feed|album)\/[^/]+$/.test(pathname); // feed 또는 album 디테일 페이지

  return (
    <div>
      {!isDetailPage && <Menubar />}
      {children}
    </div>
  );
}
