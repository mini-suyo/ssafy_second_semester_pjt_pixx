//app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleTagManager } from "@next/third-parties/google";

export default function Page() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (token) {
      router.push("/feed");
    } else {
      router.push("/welcome");
    }
  }, [router, token]);

  return <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID!} />;
}
