import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

const crystal = localFont({
  src: [
    {
      path: "../public/fonts/CrystalRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/CrystalBold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-crystal",
});

export const metadata: Metadata = {
  title: "ConverseAI",
  description: "A conversational AI platform that enables seamless communication between humans and machines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${crystal.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
