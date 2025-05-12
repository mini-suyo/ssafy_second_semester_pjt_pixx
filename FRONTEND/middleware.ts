import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken");
  const refreshToken = request.cookies.get("refreshToken");

  console.log("현재 경로:", pathname);
  console.log("액세스 토큰:", accessToken?.value);
  console.log("리프레시 토큰:", refreshToken?.value);

  // welcome 페이지에서 토큰이 있는 경우 메인 페이지로 리다이렉트
  if (pathname === "/welcome" && accessToken && refreshToken) {
    console.log("welcome 페이지에서 메인으로 리다이렉트");
    return NextResponse.redirect(new URL("/main", request.url));
  }

  // welcome 페이지를 제외한 모든 페이지에서 토큰 체크
  if (pathname !== "/welcome" && (!accessToken || !refreshToken)) {
    console.log("인증되지 않은 접근, welcome 페이지로 리다이렉트");
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  console.log("미들웨어 통과, 다음 단계로 진행");
  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    "/(.*)", // 모든 경로에 대해 미들웨어 적용
    "/(api|_next/static|_next/image|favicon.ico)/:path*", // 이 경로들은 제외
  ],
};
