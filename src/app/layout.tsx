
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./provider";
import { OpenPanelComponent } from '@openpanel/nextjs';


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OpenCare | Healthcare Platform",
  description:
    "OpenCare streamlines healthcare coordination for practitioners and teams.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} font-sans antialiased`}>
        <Providers>
        <>
      <OpenPanelComponent
        clientId={process.env.OPENPANEL_API_KEY!}
        trackScreenViews={true}
        // trackAttributes={true}
        // trackOutgoingLinks={true}
      />
      {children}
    </>
        </Providers>
      </body>
    </html>
  );
}
