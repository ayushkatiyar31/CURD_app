import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";

export const metadata: Metadata = {
  title: "JSONPlaceholder Users CRUD",
  description: "A Next.js App Router CRUD app with optimistic updates.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
