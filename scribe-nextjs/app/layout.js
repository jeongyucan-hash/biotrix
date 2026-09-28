import "./globals.css";

export const metadata = {
  title: "BIOTRIX Scribe",
  description: "YouTube, lecture and seminar transcription workspace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
