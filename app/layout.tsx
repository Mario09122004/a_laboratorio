import Script from 'next/script';
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css'

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import { ConvexClientProvider } from "./ConvexClientProvider";
import { AuthorizationProvider } from './auth/userauth';

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from '@/components/bottonmode';
import { esES } from "@clerk/localizations";

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Laboratorio',
  description: 'Gestor de muestras de laboratorio clínico',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html 
        lang="es" 
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <AuthorizationProvider>
                
                <SidebarProvider>
                  <AppSidebar />
                  <main className="flex-1">
                      <header className="flex h-16 items-center justify-between border-b bg-background px-4 sticky top-0 z-10">
                      
                      <SidebarTrigger />

                      <div className="flex items-center gap-4">
                        <ModeToggle />
                      </div>

                    </header>
                    <div className='p-4'>
                      {children}
                    </div>
                  </main>
                </SidebarProvider>

              </AuthorizationProvider>

              <Toaster richColors position="top-right" />

            </ConvexClientProvider>

            <Script
              src="https://w.appzi.io/w.js?token=XYtKn"
              strategy="afterInteractive"
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}