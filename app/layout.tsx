import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"WorkTime — 출퇴근 관리",description:"팀의 시간을 더 명확하게 관리하는 출퇴근 데모",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body className="antialiased">{children}</body></html>}

