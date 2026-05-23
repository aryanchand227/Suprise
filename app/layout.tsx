import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Thoughts — A Secret Memory Book",
  description: "An intimate, private memory book crafted with love. Only those who know the memories may enter.",
  keywords: ["memory book", "love letter", "private", "emotional"],
  openGraph: {
    title: "My Thoughts",
    description: "Some words I never stopped carrying.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Dancing+Script:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
