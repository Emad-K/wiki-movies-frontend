import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Import env to validate environment variables at app startup
import '@/lib/env';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" suppressHydrationWarning className="h-screen overflow-hidden">
      <body
        className={`${inter.className} antialiased h-screen overflow-hidden`}
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
