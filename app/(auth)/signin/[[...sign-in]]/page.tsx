"use client"
import React from 'react'
// app/(auth)/sign-in/page.tsx
import {OAuthStrategy} from "@clerk/shared/types"
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Googlecallback from "@/app/components/Googlecallback"
import {Alert} from "@/app/components/Alert";
import { Loader } from '@/app/components/LoadingState';
import {useUser} from "@clerk/nextjs";

export default function SignInPage({children} : {children : React.ReactNode}) {
  const { signIn, errors, fetchStatus} = useSignIn();
  const router = useRouter();
 
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const {isSignedIn} = useUser();
  const [alert, setAlert] = useState<AlertState>(null);
 // console.log(signIn?.status)
type AlertState = {
  variant: AlertVariant;
  title: string;
  message?: string;
  primaryAction ? : {label : string, onClick : ()=> void}
} | null;
//prompt(isSignedIn ? "Yes, I am truly Signed In" : "NO I Arent")
if(isSignedIn) return router?.replace("/dashboard")


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
//    if (!isLoaded) return;
    setLoading(true);
    setError('');

    try {
      setLoading(true)
  const response =  await signIn.password({
        emailAddress : email,
        password,
      });
   const {error : ErrorResponse} = response;
   const {message : errorMessage} = ErrorResponse || {}

   // prompt(errorMessage);
      // if(response?.error && errorMessage === "Enter Password."){
      // prompt(response?.error?.message);
      //   setAlert({variant : "error", title : errorMessage, message : "Your Password Field is Empty, Please enter your password"})
      // }

     if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          setAlert({variant : "progress", title : "Finalizing SignIn...", message : "Almost There"})
          // Handle pending session tasks
          // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
          if (session?.currentTask) {
            console.log(session?.currentTask)
            return;
          }

          // If no session tasks, navigate the signed-in user to the home page
          setAlert({variant : "success", title : "Successfully Signed In😎", 
            message : "Redirecting you to your Dashboard😤"})
          const url = decorateUrl('/dashboard')
          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            router.push(url)
          }
        },
      })
     
     // console.log(errors)
      if(errors?.fields?.code){
        console.log(errors?.fields?.code?.longMessage)
     setAlert(({variant : "error", title : ",An Error Occured", message : errors?.fields?.code?.message}))
      }
    }else if(signIn?.status === "needs_first_factor"){
 if(response?.error && errorMessage === "Enter password."){
  //  prompt(response?.error?.message);
        setAlert({variant : "error", title : errorMessage || "",
           message : "Your Password Field is Empty, Please enter your password"})
           //Incorrect Password
     }else if(errorMessage === "Password is incorrect. Try again, or use another method."){
     setAlert({variant : "error", title : "Password Incorrect",
           message : errorMessage})
     }else{
      setAlert({variant : "error", title : "Unexpected Error Occured", message : errorMessage })
     }
    } else if (signIn.status === 'needs_second_factor') {
      await signIn.mfa.sendPhoneCode()
    } else if (signIn.status === 'needs_client_trust') {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
    }else if(signIn?.status === "needs_identifier"){
if(errorMessage === "Couldn't find your account."){
      setAlert({variant : "error", title : "Account Not Found",
            message : errorMessage})
     }else if(errorMessage === "You're already signed in."){
      setAlert({variant : "error", title : "Active Session", message : errorMessage})
     }
    } else {
      // Check why the sign-in is not complete
  
    
     // console.log(errors?.fields?.code?.message)
      // setAlert({variant : "error", title : "Unexpected error occured", message : errorMessage})
      // prompt(signIn?.status);
    //  console.log(errors);
    }
  }catch(error){
      
     console.log(errors?.fields?.code?.message)
     setAlert(({variant : "error", title : ",An Error Occured", message : "Empty Jor" }))
      
    throw new Error("Error Occureed while trying to sign in:" + error)
  }finally{
    setLoading(false);
  }
}




  const handleMFAVerification = async (formData: FormData) => {
    const code = formData.get('code') as string
    const useBackupCode = formData.get('useBackupCode') === 'on'

    if (useBackupCode) {
      await signIn.mfa.verifyBackupCode({ code })
    } else {
      await signIn.mfa.verifyPhoneCode({ code })
      // If you're using the authenticator app strategy, use the following method instead:
      // await signIn.mfa.verifyTOTP({ code })
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          // Handle pending session tasks
          // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
          if (session?.currentTask) {
            console.log(session?.currentTask)
            return
          }

          // If no session tasks, navigate the signed-in user to the home page
          const url = decorateUrl('/')
          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            router.push(url)
          }
        },
      })
    }
  }

  // Step 2 UI: Display the MFA verification form
  if (signIn.status === 'needs_second_factor') {
    return (
      <div>
        <h1>Verify your account</h1>
        <form action={handleMFAVerification}>
          <div>
            <label htmlFor="code">Code</label>
            <input id="code" name="code" type="text" />
            {errors.fields.code && <p>{errors.fields.code.message}</p>}
          </div>
          <div>
            <label>
              Use backup code
              <input type="checkbox" name="useBackupCode" />
            </label>
          </div>
          <button type="submit" disabled={fetchStatus === 'fetching'}>
            Verify
          </button>
        </form>
      </div>
    )
  }


  //GOOGLE OAUTH

  const signInWith = async (strategy: OAuthStrategy) => {
    const { error } = await signIn.sso({
      strategy,
      redirectCallbackUrl: 'https://clerk.formatt.webdevconstruct.tech/v1/oauth_callback',
      redirectUrl: '/sign-in', // Learn more about session tasks at https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
    })
    if (error) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.log(error)
     // console.error(JSON.stringify(error, null, 2))
      return
    }

    if (signIn.status === 'needs_second_factor') {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === 'needs_client_trust') {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
    } else {
      // Check why the sign-in is not complete
      console.error('Sign-in attempt not complete:', signIn)
    }
  }

  return (
    <main className="flex min-h-screen font-serif items-center justify-center bg-[#F5EDD8] px-4">
      <div className="flex w-full max-w-3xl overflow-hidden rounded-xl shadow-sm">

        {/* ── Left panel ── */}
        <div className="hidden w-72 shrink-0 flex-col justify-between bg-[#2C2417] p-10 md:flex">
          <span className="text-xl font-medium tracking-tight text-[#F5EDD8]">
            Formatt<span className="text-[#C4915A]">.</span>
          </span>

          <div className="space-y-3">
            <p className="font-serif text-sm italic leading-relaxed text-[#D4C4A8]">
             {`Documents that speak with the authority of a published author — not the noise of a prompt.`}
            </p>
            <p className="text-xs leading-relaxed text-[#9A8A74]">
              AI-structured documents,<br />publication-ready.
            </p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex flex-1 flex-col justify-center bg-white px-10 py-12">
          <h1 className="text-[30px] leading-[40px] font-medium text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to continue to Formatt</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>

            <div className="space-y-1.5">
              <label htmlFor="email"
                className="block text-[11px] font-medium uppercase tracking-widest text-gray-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#C4915A] focus:outline-none focus:ring-2 focus:ring-[#C4915A]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password"
                className="block text-[11px] font-medium uppercase tracking-widest text-gray-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#C4915A] focus:outline-none focus:ring-2 focus:ring-[#C4915A]/20"
              />
              <div className="flex justify-end">
                <a href="/forgot-password"
                  className="text-xs text-[#C4915A] hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <button
              type="submit"
            //  disabled={loading}
              className="w-full rounded-lg bg-[#2C2417] py-2.5 text-sm font-medium text-[#F5EDD8]
               transition-colors hover:bg-[#3D3020] disabled:cursor-not-allowed disabled:opacity-60"
            >
             Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Google */}
  <div>
    <Googlecallback/>
  </div>
 

          <p className="mt-6 text-center text-xs  text-gray-400">
           {`Don't have an account? `} {' '}
            <a href="/sign-up" className="font-medium text-[#C4915A] hover:underline">
              Create one
            </a>
          </p>
        </div>
      </div>
      {alert && (<Alert isOpen={alert?.variant?.length}
       autoDismiss={alert?.variant === "success"}
       variant={alert.variant} 
       title={alert.title} 
       message={alert.message}
       onDismiss={()=> setAlert(null)} />
       )}
       {/* SIGNIN STATE */}
       <Loader isOpen={loading}
        title ={"Getting You Ready"}
         message ={"Patience is a Virtue"}/>
    </main>
  );
}

