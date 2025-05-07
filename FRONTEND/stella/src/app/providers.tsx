// app/providers.tsx
// React Query 적용을 위한 provider

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  //컴포넌트가 처음 렌더링될 때 QueryClient 객체를 딱 한 번 생성해서 상태에 저장*
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
