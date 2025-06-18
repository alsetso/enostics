import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "enostics - Your Personal Health Data Port",
  description: "Create programmable API endpoints to receive health data from providers. Take control of your health intelligence with secure, real-time data access.",
  keywords: ["health data", "API endpoints", "healthcare", "patient data", "health intelligence"],
  authors: [{ name: "Alset Platform" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
