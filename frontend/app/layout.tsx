export const metadata = {
  title: 'Antiplagiat - Plagiarism Detection',
  description: 'Production-grade plagiarism detection platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
