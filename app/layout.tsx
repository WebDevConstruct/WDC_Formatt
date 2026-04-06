"use client"
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { ContextProvider } from './Context';

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