import "./globals.css";
import { MSWProvider } from "./MSWProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeScript = `
    (function() {
      try {
        var theme = localStorage.getItem('fleetops-theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        }
      } catch (_) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-screen bg-background text-foreground">
        <MSWProvider>{children}</MSWProvider>
      </body>
    </html>
  );
}
