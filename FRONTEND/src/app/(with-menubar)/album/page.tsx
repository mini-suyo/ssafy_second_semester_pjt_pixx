// app/(with-menubar)/album/page.tsx
// 앨범 목록

import AlbumList from "@/components/album/AlbumList";
import AlbumLoadingWrapper from "@/components/album/AlbumLoadingWrapper";

export default function Page() {
  return (
    <AlbumLoadingWrapper>
      <AlbumList />
    </AlbumLoadingWrapper>
  );
}
