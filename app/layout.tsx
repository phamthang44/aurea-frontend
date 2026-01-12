import type { Metadata } from "next";
import { Poppins, Be_Vietnam_Pro, Geist_Mono, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { GoogleOAuthProviderWrapper } from "@/components/providers/GoogleOAuthProvider";
import { SuppressCOOPWarnings } from "@/components/providers/SuppressCOOPWarnings";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthInitProvider } from "@/components/providers/AuthInitProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { LangUpdater } from "@/components/providers/LangUpdater";
// CartProvider moved to storefront layout
import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
    <html lang="vi" className="luxury-dark" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${beVietnamPro.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased scrollbar-luxury`}
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <I18nProvider>
            <LangUpdater />
            <QueryProvider>
              <GoogleOAuthProviderWrapper>
                <ReduxProvider>
                  <AuthInitProvider>
                    {children}
                    <Toaster position="top-center" richColors />
                  </AuthInitProvider>
                </ReduxProvider>
              </GoogleOAuthProviderWrapper>
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


