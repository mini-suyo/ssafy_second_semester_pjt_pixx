//app/(with-menubar)/layout.tsx
import { ReactNode } from "react";
import Menubar from "@/components/header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Menubar />
      {children}
    </div>
  );
}
