import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('mode') || 'dark';
                  const root = document.documentElement;
                  const body = document.body;
                  
                  if (root && root.classList) {
                    root.classList.remove('dark', 'light');
                    if (savedTheme === 'dark') {
                      root.classList.add('dark');
                      root.style.colorScheme = 'dark';
                    } else {
                      root.classList.add('light');
                      root.style.colorScheme = 'light';
                    }
                  }
                  
                  if (body && body.classList) {
                    body.classList.remove('dark', 'light');
                    if (savedTheme === 'dark') {
                      body.classList.add('dark');
                    } else {
                      body.classList.add('light');
                    }
                  }
                } catch (e) {
                  console.warn('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen">
        <div className="min-h-full">
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </div>
      </body>
    </html>
  );
}
