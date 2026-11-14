import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/components/auth/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'BridgeMate | Accessible Multilingual Assistant & Live Help',
  description:
    'Accessible, multilingual AI-powered bridge connecting learning to earning for jobseekers with disabilities in Ethiopia. Digital Bridge Accessibility Hackathon 2026.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1D4ED8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-font-scale="100" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-amber-300 selection:text-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
