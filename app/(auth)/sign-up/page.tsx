"use client";
import { useSignUp } from "@clerk/nextjs"; 
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { verifyWaitlistInvite } from "@/lib/actions/waitlist";
import Link from "next/link";
//import InstitutionalPopup from "@/app/components/UserContext";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const DEPARTMENTS = [
  "Accounting",
  "Actuarial Science",
  " Finance",
  "Business Administration",
  "Employment Relations & HRM",
  "Insurance", 
  "Operations Management",
  "Taxation"
];
export default function PremiumSignUp() {
  // CLEAN DESTRUCTURING: Only the essentials
  const { signUp, fetchStatus, } = useSignUp(); 
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");
 const router = useRouter();
   const [departmentChosen, setDepartmentChosen] = useState("");
   const {user} = useUser()

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
        setLocalError("Email not authorized as a waitlist invitee.");
      }
    } catch (err) {
      setLocalError("Verification server unreachable.");
    }
  };

  // --- PHASE 2: Create Credentials (Clerk) ---

// Step
const handleSync = async () => {
    
  //  setIsSyncing(true);
    const body ={
      clerkId : user?.id,
      department : departmentChosen
    }

    try {
     const response =  await fetch("/api/scholars", {
        method : "POST",
        headers : {"Content-Type" : "application/json"},
        body : JSON.stringify(body)
      })
      if(response.status === 200){
          router.replace("/dashboard")
  }else if(response?.status === 404){
        alert("User authentication failed.")
      }

    //  window.location.reload(); 
    } catch (err) {
      console.error("Sync Error:", err);
    //  setIsSyncing(false);
    }
  };
  const handleEstablishSession = async () => {
    if (!signUp) return;
    try {
 const {error : emailError} = 
      await signUp?.create({ emailAddress : email , username : username  })
      //Checking if the email Used for SignUp already exists
      if(emailError){
     //   console.log("EmailError", emailError)
      setLocalError("Email already in use or invalid.")
      return;
      } 
//PassWord 
        const {error :passwordError} = await signUp?.password({password : password});
      if(passwordError){
        setLocalError("Password must be at least 8 digits")
      }
 const {error : EmailSentError} =  await signUp?.verifications?.sendEmailCode();
 if(!EmailSentError){
  setStep(3)
 }
      
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
        setLocalError("Invalid verification code.");
      }
     
      
       const {error : finalizeError} =  await signUp?.finalize();
      
       if(finalizeError){
       return alert("Error Completing signup")
       }
       if(!finalizeError){
         await handleSync();
         }
     
} catch (err) {
      setLocalError("Authorization code rejected.");
    }
  };

  //The
  

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
      <div className="flex w-full justify-between">
              <Link href="/signin" className="text-right mt-3 text-md font-medium text-black">
              Sign in instead
              </Link>
               <Link href="/waitlist" className="text-right mt-3 text-md font-medium text-black">
                Join Waitlist 
              </Link>

              </div>

            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="border-l-2 border-[#8B0000] p-4 bg-[#8B0000]/5 flex justify-between items-center">
                <span className="font-mono text-xs text-[#8B0000]">{email}</span>
                <span className="text-[8px] uppercase font-black text-green-700">Matched</span>
              </div>
              <div className="flex flex-col gap-5">
               <input 
                type="username" 
                placeholder="John"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-b border-[#8B0000]/20 p-4 outline-none 
                font-mono text-sm bg-transparent focus:border-[#8B0000]"
              />
              <input 
                type="password" 
                placeholder="ASSIGN PASSWORD"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-[#8B0000]/20 p-4 outline-none 
                font-mono text-sm bg-transparent focus:border-[#8B0000]"
              />

              {/* Department */}
               <div className="border-b-2 border-[#8B0000]/30 pb-2 focus-within:border-[#8B0000] transition-all relative">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B0000] mb-3">Select Department</label>
              <select onChange={(e)=> {
                    setDepartmentChosen(e.currentTarget.value)
              }}
               required name="department" 
                className="w-full bg-transparent outline-none font-serif text-xl text-[#8B0000] cursor-pointer appearance-none">
                <option value="" disabled selected>Choose your field...

                </option>
                {DEPARTMENTS.map(dept =>(
                  <option key={dept} value={dept} className="bg-[#FDFCF0] text-[#8B0000]">{dept}</option>
                ))}
              </select>
              {/* Custom Down Arrow for Dropdown */}
              <div className="absolute right-0 bottom-4 pointer-events-none text-[#8B0000]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
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
          <p className="text-red-700 text-[12px] lg:text-[15px] 
          uppercase mt-6 text-center font-black tracking-tighter animate-pulse">
            {localError}
          </p>
        )}
      </motion.div>
    </div>
  );
}