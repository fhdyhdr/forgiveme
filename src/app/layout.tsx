import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maafin Aku Ya",
  description: "Website kecil untuk minta maaf dengan cara yang lucu dan manis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}