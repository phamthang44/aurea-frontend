import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { GoogleOAuthProviderWrapper } from "@/components/providers/GoogleOAuthProvider";
import { SuppressCOOPWarnings } from "@/components/providers/SuppressCOOPWarnings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aurea - Luxury Fashion",
  description: "Modern luxury fashion ecommerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="suppress-coop-warnings"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalWarn = console.warn;
                const originalError = console.error;
                
                const isCOOPWarning = (msg) => {
                  const str = String(msg || '');
                  return str.includes('Cross-Origin-Opener-Policy') ||
                         str.includes('window.closed') ||
                         str.includes('COOP') ||
                         str.includes('would block the window.closed call');
                };
                
                console.warn = function(...args) {
                  if (!isCOOPWarning(args[0])) {
                    originalWarn.apply(console, args);
                  }
                };
                
                console.error = function(...args) {
                  if (!isCOOPWarning(args[0])) {
                    originalError.apply(console, args);
                  }
                };
              })();
            `,
          }}
        />
        <SuppressCOOPWarnings />
        <GoogleOAuthProviderWrapper>
          <ReduxProvider>{children}</ReduxProvider>
        </GoogleOAuthProviderWrapper>
      </body>
    </html>
  );
}
