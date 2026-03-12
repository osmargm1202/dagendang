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
  title: "La Agenda - Medio Digital Económico de RD",
  description: "Portal económico confiable con tasa oficial, precios de combustibles y análisis de alto valor.",
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
