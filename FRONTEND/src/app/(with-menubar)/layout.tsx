// app/(with-menubar)/layout.tsx
"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Menubar from "@/components/Menubar";

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isDoneMenuPage =
    /^\/feed\/\d+$/.test(pathname) || // /feed/123
    /^\/feed\/brand\/[^/]+$/.test(pathname) || // /feed/brand/1
    /^\/album\/[^/]+$/.test(pathname) || // /album/3
    /^\/people\/\d+$/.test(pathname); // /people/30

  return (
    <div>
      {!isDoneMenuPage && <Menubar />}
      {children}
    </div>
  );
}
