import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PBL Portal",
  description: "Project-Based Learning Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="font-sans min-h-full flex flex-col">{children}</body>
    </html>
  );
}
