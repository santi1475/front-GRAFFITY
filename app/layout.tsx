import { Geist, Geist_Mono, Instrument_Sans } from "next/font/google"

import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/layouts/components/theme-provider"


const instrumentSans = Instrument_Sans({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", instrumentSans.variable)}
    >
      <body>
        <TooltipProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </TooltipProvider>
        </body>
    </html>
  )
}
