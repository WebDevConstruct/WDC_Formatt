import React from 'react'
import { SignIn } from '@clerk/nextjs'
const Signin = () => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F5F5DC] p-4">
      <div className="w-full max-w-[450px]">
        <SignIn
        forceRedirectUrl={"/dashboard"}
          
          path="/signin"
          appearance={{
            layout: {
              shimmer: true,
              logoPlacement: "inside",
              
            },
           
            elements: {
              rootBox: "w-full", 
              card: "w-full shadow-md border border-[#D2B48C] rounded-xl", 
              formButtonPrimary: 
                "bg-[#8B0000] hover:bg-[#A52A2A] text-sm normal-case", 
              footerActionLink: "text-[#8B0000] hover:text-[#A52A2A]",
              identityPreviewEditButton: "text-[#8B0000]",
            },
          }}
        />
      </div>
    </main>
  )
}

export default Signin