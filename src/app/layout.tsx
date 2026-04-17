import { MSWProvider } from './MSWProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MSWProvider>
          {children}
        </MSWProvider>
      </body>
    </html>
  )
}