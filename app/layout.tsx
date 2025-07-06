import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Veritas - Factual News Aggregation",
  description: "Combat information overload with factual, multi-sourced summaries of current events",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  icons: [
    { rel: "icon", url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { rel: "icon", url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm sticky top-0 z-30">
            <div className="container mx-auto px-4 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <span className="text-xl sm:text-2xl font-bold">Veritas</span>
                </Link>
                
                <nav className="flex items-center space-x-2 sm:space-x-4">
                  <Link href="/login">
                    <Button variant="outline" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                      <span className="hidden sm:inline">Sign In</span>
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                      <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </Button>
                  </Link>
                  <ThemeToggle />
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
