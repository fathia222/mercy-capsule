// ============================================================
// WHAT THIS FILE DOES
// The outer shell of every page (page title, fonts, mobile screen settings).
// Next.js REQUIRES this exact name, so it can't be renamed.
// ============================================================

import "./globals.css";

export const metadata = {
  title: "Birthday Memory Capsule",
};

// Lets the page sit under the phone's notch/status bar (the CSS handles the spacing)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}