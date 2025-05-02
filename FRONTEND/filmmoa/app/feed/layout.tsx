// 피드 전체 목록 레이아웃

import { ReactNode } from "react";

export default function Layout({children} : {children : ReactNode}) {
    return(
        <div>{children}</div>
    )
}