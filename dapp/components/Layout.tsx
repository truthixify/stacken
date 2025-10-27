import React from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Stacken — Build, Earn, Repeat',
  description = 'Join bounty missions on Stacks. Build amazing projects, earn crypto rewards, and grow with the community.',
  ogImage = '/stacken.png',
  ogUrl,
  ogType = 'website',
}) => {
  // Ensure ogImage is an absolute URL for social media crawlers
  const absoluteOgImage = ogImage.startsWith('http')
    ? ogImage
    : `${process.env.NEXTAUTH_URL || 'https://stacken.vercel.app'}${ogImage}`;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content={ogType} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {ogUrl && <meta property="og:url" content={ogUrl} />}
        <meta property="og:image" content={absoluteOgImage} />
        <meta property="og:site_name" content="Stacken" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={absoluteOgImage} />

        {/* Additional meta tags for better sharing */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:type"
          content={absoluteOgImage.endsWith('.svg') ? 'image/svg+xml' : 'image/png'}
        />
      </Head>

      <div className="min-h-screen bg-background flex flex-col bg-gray-950/95">
        <Toaster
          position="top-right"
          gutter={16}
          containerClassName="toast-container"
          toastOptions={{
            duration: 4000,
            className: 'toast-enter',
            style: {
              background: 'rgba(31, 41, 55, 0.98)', // gray-800 with higher opacity
              color: '#f9fafb', // gray-50
              border: '1px solid rgba(75, 85, 99, 0.4)', // gray-600 with opacity
              borderRadius: '16px',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)', // Safari support
              boxShadow:
                '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              fontSize: '14px',
              fontWeight: '500',
              padding: '18px 24px',
              maxWidth: '440px',
              minHeight: '64px',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.5',
              letterSpacing: '-0.01em',
              transition: 'all 0.2s ease',
            },
            success: {
              duration: 3500,
              className: 'toast-enter',
              style: {
                background: 'rgba(31, 41, 55, 0.98)',
                color: '#f9fafb',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                boxShadow:
                  '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(34, 197, 94, 0.15), 0 0 32px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f9fafb',
              },
            },
            error: {
              duration: 6000,
              className: 'toast-enter',
              style: {
                background: 'rgba(31, 41, 55, 0.98)',
                color: '#f9fafb',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                boxShadow:
                  '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.15), 0 0 32px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f9fafb',
              },
            },
            loading: {
              className: 'toast-enter',
              style: {
                background: 'rgba(31, 41, 55, 0.98)',
                color: '#f9fafb',
                border: '1px solid rgba(234, 88, 12, 0.4)',
                boxShadow:
                  '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(234, 88, 12, 0.15), 0 0 32px rgba(234, 88, 12, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              },
              iconTheme: {
                primary: '#ea580c',
                secondary: '#f9fafb',
              },
            },
          }}
        />
        <Navbar />

        <main className="flex-1 mt-48">{children}</main>

        <Footer />
      </div>
    </>
  );
};

export default Layout;
