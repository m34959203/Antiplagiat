import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Antiplagiat - Проверка текста на уникальность за 30 секунд',
  description: 'AI-powered проверка на плагиат. Точность 94%. Быстро, просто, бесплатно.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {children}
      </body>
    </html>
  )
}