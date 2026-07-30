
import "dotenv/config"
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useEffect } from 'react';


// Add clerk to Window to avoid type errors
declare global {
  interface Window {
    google: any
  }
}

export function CustomGoogleOneTap({ children }: { children: React.ReactNode }) {
  const clerk = useClerk()
  const router = useRouter()

  useEffect(() => {
    // Will show the One Tap UI after two seconds
    const timeout = setTimeout(() => oneTap(), 2000)
    return () => {
      clearTimeout(timeout)
    }
  }, [])

  const oneTap = () => {
    const { google } = window
    if (google) {
      google.accounts.id.initialize({
        // Add your Google Client ID here.
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||  "",
        callback: async (response: any) => {
          // Here we call our provider with the token provided by Google
          call(response.credential)
        },
      })

      // Uncomment below to show the One Tap UI without
      // logging any notifications.
      // return google.accounts.id.prompt() // without listening to notification

      // Display the One Tap UI, and log any errors that occur.
      return google.accounts.id.prompt((notification: any) => {
        console.log('Notification ::', notification)
        if (notification.isNotDisplayed()) {
          console.log('getNotDisplayedReason ::', notification.getNotDisplayedReason())
        } else if (notification.isSkippedMoment()) {
          console.log('getSkippedReason  ::', notification.getSkippedReason())
        } else if (notification.isDismissedMoment()) {
          console.log('getDismissedReason ::', notification.getDismissedReason())
        }
      })
    }
  }

  const call = async (token: any) => {
    try {
      const res = await clerk.authenticateWithGoogleOneTap({
        token,
      })

      await clerk.handleGoogleOneTapCallback(res, {
        signInFallbackRedirectUrl: process.env.AuthorizedDevRedirectUrl || "",
      })
    } catch (error) {
      router.push('/sign-in')
    }
  }

  return (


   <div className="w-full flex p-2 gap-5 justify-center items-center border-2 bordrer-gray-300 rounded-md">
  
          <Script  src="https://accounts.google.com/gsi/client" 
         id = "Google OAuth" strategy="lazyOnload" 
     />
           
        
     {children}
      </div>
  
  )
}