// this file is the root layout
// it is required and must contain the <html> and <body> tags
import "./globals.css"
import Navbar from "@/components/Navbar"

export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    )
}