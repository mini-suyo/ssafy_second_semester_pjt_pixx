// 브랜드별 피드 목록

import FeedBrandMoreList from "@/components/feed/FeedBrandMoreList";

export default async function Page({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;

  return (
    <main>
      <FeedBrandMoreList brandId={Number(brandId)} />
    </main>
  );
}
