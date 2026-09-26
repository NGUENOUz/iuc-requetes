import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IUC Requêtes - Plateforme de Gestion des Requêtes",
  description: "Plateforme institutionnelle de traitement des requêtes académiques et administratives",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-150">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
