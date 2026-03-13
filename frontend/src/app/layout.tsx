import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "La Agenda - Medio Digital Económico de RD",
    template: "%s | La Agenda"
  },
  description: "Portal económico confiable con tasa oficial, precios de combustibles y análisis de alto valor en la República Dominicana.",
  keywords: ["economía", "República Dominicana", "tasa de cambio", "dólar RD", "combustibles RD", "noticias económicas", "diario digital"],
  authors: [{ name: "La Agenda" }],
  creator: "La Agenda",
  publisher: "La Agenda",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-id', // User can replace this later
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground dark:bg-background dark:text-foreground min-h-screen flex flex-col transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          
          <main className="flex-1 w-full flex justify-center">
            {children}
          </main>

          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
