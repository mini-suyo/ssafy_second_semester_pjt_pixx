// app/(with-menubar)/layout.tsx
"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Menubar from "@/components/Menubar";

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // feed/:id, feed/brand/:id, album/:id, people/:id
  const isDetailPage = /^\/(feed\/\d+|feed\/brand\/[^/]+|album\/[^/]+|people\/[^/]+)$/.test(pathname);

  return (
    <div>
      {!isDetailPage && <Menubar />}
      {children}
    </div>
  );
}
