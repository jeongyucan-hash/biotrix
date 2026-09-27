import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://biotrix.co.kr"),
  title: {
    default: "BIOTRIX",
    template: "%s | BIOTRIX",
  },
  description: "BIOTRIX Commerce — Fresh, Wellness, Beauty",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
