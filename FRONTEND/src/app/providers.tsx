// app/providers.tsx
// React Query 및 GA 적용을 위한 provider

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import GTM from "@/components/common/GTM";
import LayoutClient from "./LayoutClient";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <GTM />
      <LayoutClient>{children}</LayoutClient>
    </QueryClientProvider>
  );
}
