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
      <body>{children}</body>
    </html>
  );
}
