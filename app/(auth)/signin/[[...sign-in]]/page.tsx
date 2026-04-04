import React from 'react'
import { SignIn } from '@clerk/nextjs'
const SignUpPage = () => {
  return (
  <main className="flex min-h-screen w-full items-center justify-center bg-[#F5F5DC] p-4">
      <div className="w-full max-w-[450px]">
        <SignIn 
          path="/signin"
          forceRedirectUrl={"/dashboard"}
        
          appearance={{
            layout: {
              shimmer: true,
              logoPlacement: "inside",
            },
            elements: {
              rootBox: "w-full", // Forces the outer Clerk box to fill the div
              card: "w-full shadow-md border border-[#D2B48C] rounded-xl", // Maroon-friendly border
              formButtonPrimary: 
                "bg-[#8B0000] hover:bg-[#A52A2A] text-sm normal-case", // The Maroon Button
              footerActionLink: "text-[#8B0000] hover:text-[#A52A2A]",
            },
          }}
        />
      </div>
    </main>
  )
}

export default SignUpPage