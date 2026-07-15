import "./globals.css";

export const metadata = {
  title: "Farmer Jutai",
  description: "प्रीमियम शेत सेवा बुकिंग ऐप",
};

export default function RootLayout({ children }) {
  return (
    <html lang="mr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">{children}</body>
    </html>
  );
}
