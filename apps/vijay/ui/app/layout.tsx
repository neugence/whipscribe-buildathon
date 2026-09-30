import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/components/auth/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CallBrief — Turn Client Calls into Structured Project Briefs",
  description:
    "CallBrief turns client conversations into clear requirements, tasks, estimates, and client-ready work.",
  keywords: [
    "freelancer tool",
    "client calls",
    "project brief",
    "meeting notes",
    "scope estimation",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <AuthProvider>
            {children}
            <AuthModal />
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
