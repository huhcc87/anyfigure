import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "AnyFigure Scientific Figures (V1)",
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
    <ClerkProvider>
      <html
        lang="en"
        className={`${plexSans.variable} ${sourceSerif.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#eef2f7] text-slate-900">
          {children}
          <Toaster position="bottom-center" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
