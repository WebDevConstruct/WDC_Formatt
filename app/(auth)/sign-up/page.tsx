"use client";
import { useSignUp } from "@clerk/nextjs"; 
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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
  const [emailInput, setEmailInput] = useState("")
 const router = useRouter();
   const [departmentChosen, setDepartmentChosen] = useState("");
   const {user} = useUser()
   // const clerkId = user?.id || ""

  // 1. THE MODERN GUARD: Replacing the old 'isLoaded'
  if (fetchStatus === "fetching") {
    return (
      <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center font-mono text-[10px] text-[#8B0000] uppercase animate-pulse">
        Initializing Secure Connection...
      </div>
    );
  }

  // --- PHASE 1: Institutional Check (Neon) ---


  // --- PHASE 2: Create Credentials (Clerk) ---

//What if handleSync fails? ? ? ?
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
     }
  };

  
  const handleEstablishSession = async () => {
        if(!departmentChosen || !password ||!username) {
          return setLocalError("Fill in all the fields to proceed");
        } else{
          setLocalError("");
        }
    if (!signUp) return;
 try {
 const {error : emailError} = 
      await signUp?.create({ emailAddress : emailInput , username : username  })
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
  setStep(2);
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
    // const response = await initialiazeWaitlistStudent(username, email, departmentChosen);
    // console.log(response);
    // if(response?.ok){
    //  return router?.replace("/dashboard")
    // }else if(!response?.ok){
    //     setLocalError("An error occured and a reload occurs, kindly refill your details after the reload")
    //   await fetch("/api/delete",{
    //     method : "DELETE",
    //     headers : {"Content-Type" : "application/json" },
    //     body : JSON.stringify({userId : clerkId})
    //   })
    //   // A fast Refresh to start the signup process
    //   setTimeout(()=> {
    //    window.location.reload()
    //   },1000)
    // }else{
    //   setLocalError("Error : Exited with code 1")
    // }










  //   else if (response?.status === 500) {
  //  setLocalError("An Internal Server error, Kindly try again in the next 5 minutes");
  //   await fetch("/api/delete",{
  //       method : "DELETE",
  //       headers : {"Content-Type" : "application/json" },
  //       body : JSON.stringify({userId : clerkId})
  //     })
  //     //A fast refresh to start the signup process
  //     setTimeout(()=> {
  //      window.location.reload()
  //     },1000)
  //   }
          
         }
     
} catch (err) {
      setLocalError("Unable to complete signUp");
    }
  };

  //The
  //console.log(clerkId);

  return (
  <div className="min-h-screen bg-[#F2F0E] flex items-center justify-center p-6 selection:bg-[#D4AF37] selection:text-[#1A1512] font-sans text-[#F2F0E9]">
  <motion.div 
    layout 
    className="w-full max-w-lg bg-[#F2F0E] border-2 border-[#D4AF37]/20 p-12 relative shadow-[24px_24px_0px_rgba(212,175,55,0.05)] rounded-[2rem]"
  >
    <header className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="h-[1px] w-12 bg-[#D4AF37]" />
        <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#D4AF37]">Step 0{step}</span>
      </div>
      <h1 className="text-4xl font-serif text-black italic leading-tight">
        Scholar <br /><span className="not-italic text-[#D4AF37]">Authorization</span>
      </h1>
    </header>

    <AnimatePresence mode="wait">
     

      {step === 1 && (
        <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        

          <div className="flex flex-col gap-3">
       <label className="text-[14px] leadingg-[20px] target:
        font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
          Username
       </label>
       
            <input 
              type="text" 
              placeholder="John"
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-b border-[#D4AF37]/20 p-4 outline-none font-mono text-sm bg-transparent focus:border-[#D4AF37] text-black"
            />
         
            </div>

          {/* Emaiil Field */}
           <div className="flex flex-col gap-3">
       <label className="text-[14px] leadingg-[20px] target:
        font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
          Email Address
       </label>
       
            <input 
              type="email" 
              placeholder="example@mail.com"
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full border-b border-[#D4AF37]/20 p-4 outline-none font-mono text-sm
               bg-transparent focus:border-[#D4AF37]  text-black"
            />
            </div>


    <div className="flex flex-col gap-3">
       <label className="text-[14px] leadingg-[20px] target:
        font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
        Password
       </label>
            <input 
              type="password" 
              placeholder="ASSIGN PASSCODE"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-[#D4AF37]/20 p-4 outline-none 
              font-mono text-sm bg-transparent focus:border-[#D4AF37] text-black"
            />
            </div>

            {/* Department */}
            <div className="border-b-2 border-[#D4AF37]/30 pb-2 focus-within:border-[#D4AF37] transition-all relative">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-3">Department Domain</label>
              <select 
                value={departmentChosen} 
                onChange={(e) => setDepartmentChosen(e.currentTarget.value)}
                required 
                className="w-full bg-transparent outline-none font-serif text-xl text-black cursor-pointer appearance-none"
              >
                <option disabled selected className="bg-[#2C2520]">Choose field...</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept} className="bg-[#2C2520] text-black">{dept}</option>
                ))}
              </select>
              <div className="absolute right-0 bottom-4 pointer-events-none text-[#D4AF37]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
            <button 
              onClick={handleEstablishSession}
              className="w-full bg-[#D4AF37] text-[#1A1512] p-5 text-[11px] font-black uppercase tracking-widest hover:bg-[#F2F0E9] transition-colors"
            >
              Establish Credentials →
            </button>
        
       
        </motion.div>
      )}

      {step === 2 && (
        <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-center">
          <p className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.2em]">Security Handshake Required</p>
          <input 
            placeholder="000000"
            maxLength={6}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-center text-4xl border-b border-[#D4AF37] p-4 outline-none bg-transparent font-mono tracking-[0.5em] text-[#D4AF37]"
          />
          <button 
            onClick={handleVerifyOTP}
            className="w-full bg-[#D4AF37] text-[#1A1512] p-5 text-[11px] font-black uppercase tracking-widest hover:bg-[#F2F0E9] transition-all"
          >
            Authorize & Access System
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    {localError && (
      <p className="text-[#FF4D4D] text-[10px] uppercase mt-8 text-center font-black tracking-widest animate-pulse border border-[#FF4D4D]/20 py-2 bg-[#FF4D4D]/5">
        {localError}
      </p>
    )}
  </motion.div>
</div>
  );
}