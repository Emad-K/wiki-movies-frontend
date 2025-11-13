import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Import env to validate environment variables at app startup
import '@/lib/env';
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wiki Movies - AI-Powered Movie Search",
  description: "Discover and search for movies with Wiki Movies - AI-powered semantic search, advanced filters, and comprehensive movie information",
  openGraph: {
    title: "Wiki Movies - AI-Powered Movie Search",
    description: "Discover and search for movies with Wiki Movies - AI-powered semantic search, advanced filters, and comprehensive movie information",
    siteName: "Wiki Movies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wiki Movies - AI-Powered Movie Search",
    description: "Discover and search for movies with Wiki Movies - AI-powered semantic search, advanced filters, and comprehensive movie information",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
