import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://biotrix.co.kr"),
  title: {
    default: "BIOTRIX HQ",
    template: "%s",
  },
  description: "BIOTRIX Company Operating System",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <nav className="workspaceSwitch" aria-label="업무 공간 이동">
          <a href="/" className="workspaceSwitchBrand" aria-current="page">BIOTRIX HQ</a>
          <span className="workspaceSwitchNote">회사 운영 · 커머스 · 지식</span>
          <a href="https://yuchan-os-2026.jeongyucan.chatgpt.site/" className="workspaceSwitchLink" aria-label="유찬 OS로 이동">유찬 OS <span aria-hidden="true">↗</span></a>
        </nav>
        {children}
      </body>
    </html>
  );
}
