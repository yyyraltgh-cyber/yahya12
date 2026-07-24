import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { LocaleProvider } from "@/lib/i18n/locale-context";

export const metadata: Metadata = {
  title: "Personal OS",
  description: "Your personal operating system for tasks, notes, habits, routines, and more.",
  applicationName: "Personal OS",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Personal OS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b0d10",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        <LocaleProvider>
          {children}
          <ServiceWorkerRegister />
        </LocaleProvider>
      </body>
    </html>
  );
}
