import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/lib/CurrencyContext";
import { BlackFridayProvider } from "@/lib/BlackFridayContext";
import { DarkModeProvider } from "@/lib/DarkModeContext";

import { Hind_Siliguri, Anek_Bangla } from "next/font/google";
import ConditionalLayout from "@/components/ConditionalLayout";
import { AuthProvider } from "@/lib/context/AuthContext";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "700"],
  variable: "--font-hind",
});

const anekBangla = Anek_Bangla({
  subsets: ["bengali"],
  weight: ["400", "700"],
  variable: "--font-anek",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MEC Computer Club",
  description:
    "Official website of MEC Computer Club — Learn, Build, Share. Coding, Robotics, AI/ML, Workshops, Projects and Events at Mymensingh Engineering College.",
  keywords: [
    "MEC Computer Club",
    "MEC",
    "Computer Club",
    "Programming",
    "Robotics",
    "AI",
    "ML",
    "Workshops",
    "Hackathon",
    "Bangladesh",
  ],
  authors: [{ name: "MEC Computer Club" }],
  icons: {
    icon: "favicon.ico",
    apple: "favicon.ico",
  },
  openGraph: {
    title: "MEC Computer Club",
    description: "Learn, Build, Share — the tech community at Mymensingh Engineering College.",
    url: "https://meccomputerclub.org",
    siteName: "MEC Computer Club",
    images: [
      {
        url: "/img/flexohost-meta.png",
        width: 1200,
        height: 630,
        alt: "MEC Computer Club",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MEC Computer Club",
    description: "Learn, Build, Share — the tech community at Mymensingh Engineering College.",
    images: ["/img/flexohost-meta.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${anekBangla.variable}`}
      suppressHydrationWarning={true}
    >
      <body
        className={` ${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <NextTopLoader color="#2563eb" showSpinner={false} />
        <CurrencyProvider>
          <DarkModeProvider>
            <BlackFridayProvider>
              <AuthProvider>
                <ConditionalLayout>{children}</ConditionalLayout>
              </AuthProvider>
            </BlackFridayProvider>
          </DarkModeProvider>
        </CurrencyProvider>

        {/* Facebook Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "YOUR_PIXEL_ID"}');
              fbq('track', 'PageView');
              
              // Enhanced tracking with Conversions API
              window.fbq('trackCustom', 'PageViewEnhanced', {
                pixel_id: '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "YOUR_PIXEL_ID"}',
                timestamp: Math.floor(Date.now() / 1000)
              });
            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${
              process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "YOUR_PIXEL_ID"
            }&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        {/* Live chat script removed */}
      </body>
    </html>
  );
}
