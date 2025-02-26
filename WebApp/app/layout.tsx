import ToastWrapper from "@/ToastWrapper";
import ReduxWrapper from "@/components/ReduxWrapper";
import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NoteHound",
  description: "NoteHound",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className={inter.className}>
        <ReduxWrapper>
          <ToastWrapper>
            <div>{children}</div>
          </ToastWrapper>
        </ReduxWrapper>
        <Analytics />
      </body>
    </html>
  );
}
