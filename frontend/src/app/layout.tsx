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
    default: "D' Agenda con Nelson Gómez | DAgendaNG",
    template: "%s | DAgendaNG"
  },
  description: "Portal económico confiable con tasa oficial, precios de combustibles y análisis de alto valor en la República Dominicana.",
  keywords: ["economía", "República Dominicana", "tasa de cambio", "dólar RD", "combustibles RD", "noticias económicas", "diario digital"],
  authors: [{ name: "Nelson Gómez" }],
  creator: "DAgendaNG",
  publisher: "DAgendaNG",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://dagendang.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "D' Agenda con Nelson Gómez | DAgendaNG",
    description: "Portal económico confiable con tasa oficial, precios de combustibles y análisis de alto valor en la República Dominicana.",
    url: 'https://dagendang.com',
    siteName: 'DAgendaNG',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "D' Agenda con Nelson Gómez",
      },
    ],
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "D' Agenda con Nelson Gómez | DAgendaNG",
    description: "Portal económico confiable con tasa oficial, precios de combustibles y análisis de alto valor en la República Dominicana.",
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
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
    <html lang="es" suppressHydrationWarning>
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
