import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AnyFigure AI — Scientific Figure Platform for Researchers",
  description:
    "Generate publication-ready biomedical figures from natural language prompts. AI-powered scientific figure studio for cancer biologists, genomics researchers, and clinicians.",
  keywords: [
    "scientific figures",
    "biomedical visualization",
    "AI figure generator",
    "graphical abstract",
    "research figures",
    "BioRender alternative",
    "pathway diagram",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080C1C]">{children}</body>
    </html>
  );
}
