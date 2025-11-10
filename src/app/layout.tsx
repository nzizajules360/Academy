import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import DeactivatedNotice from '@/components/DeactivatedNotice';
import NotificationsListener from '@/components/NotificationsListener';
import MaintenanceNotice from '@/components/MaintenanceNotice';

export const metadata: Metadata = {
  title: 'CampusConnect',
  description: 'A management system for College Baptista.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background/50 min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-background dark:to-background/90">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FirebaseClientProvider>
            <div className="relative">
              {/* Decorative elements */}
              <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-1/2 h-1/2 rounded-full bg-primary/5 blur-[100px]" />
                <div className="absolute -bottom-1/2 -left-1/2 w-1/2 h-1/2 rounded-full bg-primary/5 blur-[100px]" />
              </div>
              
              {/* Main content */}
              <main className="relative">
                {children}
              </main>
              <DeactivatedNotice />
              <NotificationsListener />
              <MaintenanceNotice />
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
