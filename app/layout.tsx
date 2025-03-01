import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/app/components/ThemeRegistry";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Social Media Analysis Dashboard",
  description: "Analyze and visualize social media data to uncover insights and trends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
} 