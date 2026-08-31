import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebWave Business Pvt. Ltd. — HRMS',
  description: 'Professional HRMS for WebWave Business Pvt. Ltd.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo2.jpeg" type="image/jpeg" />
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
