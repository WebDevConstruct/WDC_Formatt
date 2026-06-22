
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Metadata } from 'next';
import { ContextProvider } from './Context';




export const metadata : Metadata = {
  metadataBase : new URL("https://formatt.webdevconstruct.tech"),
  title : {default : "Research with Formatt", template : "Formatt - Your Research Powered AI Assistant"},
  description : "Formatt is your research-powered AI assistant that helps you navigate the vast landscape of academic literature.",
  alternates: {
    canonical: 'https://formatt.webdevconstruct.tech',
    languages: {
      'en-US': 'https://formatt.webdevconstruct.tech/en-US',
      'de-DE': 'https://formatt.webdevconstruct.tech/de-DE'
    }
  },
  openGraph: {
    title: 'WDC | Formatt',
    description: 'Formatt is your research-powered AI assistant that helps you navigate the vast landscape of academic literature.',
    url: 'https://formatt.webdevconstruct.tech',
    siteName: 'Formatt',
}
}


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ContextProvider>
        {children}
        </ContextProvider>

      
  {/* <SignInButton mode="modal" /> 
  <SignUpButton mode="modal" /> */}

       
          
       
      </body>
   
    </html>
    </ClerkProvider>
  )
}