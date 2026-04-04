"use client";

import { useSignUp } from "@clerk/nextjs"; 
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { verifyWaitlistInvite } from "@/lib/actions/waitlist";
import Link from "next/link";

export default function PremiumSignUp() {
  // CLEAN DESTRUCTURING: Only the essentials
  const { signUp, fetchStatus, errors  } = useSignUp(); 
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");
  //const router = useRouter();

  // 1. THE MODERN GUARD: Replacing the old 'isLoaded'
  if (fetchStatus === "fetching") {
    return (
      <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center font-mono text-[10px] text-[#8B0000] uppercase animate-pulse">
        Initializing Secure Connection...
      </div>
    );
  }

  // --- PHASE 1: Institutional Check (Neon) ---
  const handleInitialVerify = async () => {
    setLocalError("");
    try {
      const check = await verifyWaitlistInvite(email);
      if (check.allowed) {
        setStep(2);
      } else {
        setLocalError("Email not authorized for Class of 2027 Pilot.");
      }
    } catch (err) {
      setLocalError("Verification server unreachable.");
    }
  };

  // --- PHASE 2: Create Credentials (Clerk) ---
  const handleEstablishSession = async () => {
    if (!signUp) return;
    try {

    const {error : emailError} = 
      await signUp?.create({ emailAddress : email , username : username  })

      if(emailError){
        console.log("EmailError", emailError)
      setLocalError("Check your email for a verification code.")
      return;
      } 
      const {error :passwordError} = await signUp?.password({password : password});
      if(passwordError){
        
      setLocalError("Password must be atleast 8 digits")
      return;
      }
   await signUp?.verifications?.sendEmailCode();
  
      setStep(3); 
    } catch (err) {
      setLocalError("Initialization failed.");
    }
  };

  // --- PHASE 3: Verify OTP ---
  const handleVerifyOTP = async () => {
    if (!signUp) return;
    try {
      const {error : verificationError} = await signUp?.verifications?.verifyEmailCode({code});
      if(verificationError){
        setLocalError("Invalid verification code.")
      }
    //  console.log("SignUpState", signUp?.status)
    if(!verificationError && fetchStatus === "idle" && signUp.status === "complete"){
       
      console.log(signUp?.status);
     const {error : finalizeError} =  await signUp?.finalize();
     if(finalizeError){
      return;
     }
       return window.location.href = "/dashboard";
    }


      
      
      
    } catch (err) {
      setLocalError("Authorization code rejected.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-6 selection:bg-[#8B0000] selection:text-white font-sans">
      <motion.div 
        layout 
        className="w-full max-w-lg bg-[#FDFCF0] border border-[#8B0000]/20 p-12 relative shadow-[24px_24px_0px_rgba(139,0,0,0.05)]"
      >
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[1px] w-12 bg-[#8B0000]" />
            <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#8B0000]">Step 0{step}</span>
          </div>
          <h1 className="text-4xl font-serif text-[#1A1A1A] italic leading-tight">
            Scholar <br /><span className="not-italic text-[#8B0000]">Authorization</span>
          </h1>
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <input 
                type="email" 
                placeholder="YOUR EMAIL"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-[#8B0000]/20 p-4 outline-none font-mono text-sm bg-transparent focus:border-[#8B0000] transition-all placeholder:text-[#8B0000]/30"
              />
              <button 
                onClick={handleInitialVerify} 
                className="w-full bg-[#1A1A1A] text-white p-5 
                text-[11px] font-black uppercase tracking-widest hover:bg-[#8B0000] transition-colors"
              >
                Verify Identity →
              </button>

              <Link href="/signin" className="text-right mt-3 text-md font-medium text-[#8B0000]">
              Sign in instead
              </Link>

            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="border-l-2 border-[#8B0000] p-4 bg-[#8B0000]/5 flex justify-between items-center">
                <span className="font-mono text-xs text-[#8B0000]">{email}</span>
                <span className="text-[8px] uppercase font-black text-green-700">Matched</span>
              </div>
              <div className="flex flex-col gap-2">
               <input 
                type="username" 
                placeholder="John"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-b border-[#8B0000]/20 p-4 outline-none font-mono text-sm bg-transparent focus:border-[#8B0000]"
              />
              <input 
                type="password" 
                placeholder="ASSIGN PASSWORD"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-[#8B0000]/20 p-4 outline-none font-mono text-sm bg-transparent focus:border-[#8B0000]"
              />
              
              <button 
                onClick={handleEstablishSession}
                className="w-full bg-[#1A1A1A] text-white p-5 text-[11px] font-black uppercase tracking-widest hover:bg-[#8B0000] transition-colors"
              >
                Create Credentials →
              </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-center">
              <p className="text-[10px] uppercase font-bold text-[#8B0000]">Security Handshake Required</p>
              <input 
                placeholder="000000"
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-center text-3xl border-b border-[#8B0000] p-4 outline-none bg-transparent font-mono tracking-[0.5em]"
              />
              <button 
                onClick={handleVerifyOTP}
                className="w-full bg-[#8B0000] text-white p-5 text-[11px] font-black uppercase tracking-widest"
              >
                Authorize & Enter
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {localError && (
          <p className="text-red-700 text-[9px] uppercase mt-6 text-center font-black tracking-tighter animate-pulse">
            {localError}
          </p>
        )}
      </motion.div>
    </div>
  );
}