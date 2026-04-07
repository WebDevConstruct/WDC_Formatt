"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
const router = useRouter();
  const handleJoin = async (e: React.FormEvent) => {
    setStatus("idle")
      e.preventDefault();
try {
  setStatus("loading")
     const response = await fetch("api/waitlist", {
      method : "POST",
      headers : {"Content-Type": "application/json"},
      body : JSON.stringify({email})
     })
     if(response.ok ){
      setStatus("success");
      setTimeout(()=> {
        router.replace('/dashboard')
      },1000)
     }else if(response?.status === 409){
      alert("Email Already Exists")
      
     }else if(response?.status === 400){
      alert("Wrong Email Format")
     }else{
      setStatus("error")
     }
}catch(error){
      setStatus("error")
}
   // Simulate server action to Neon
    // setTimeout(() => {
    //   setStatus("success");
    // }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-6 selection:bg-[#8B0000] selection:text-white">
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/graphy.png")` }} />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#FDFCF0] border border-[#8B0000]/20 p-10 relative shadow-[16px_16px_0px_rgba(139,0,0,0.05)]"
      >
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#8B0000]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#8B0000]" />

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-[1px] w-6 bg-[#8B0000]" />
            <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-[#8B0000]">Registry Open</span>
          </div>
          <h1 className="text-3xl font-serif text-[#1A1A1A] italic">
            Waitlist <span className="not-italic text-[#8B0000]">Portal</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase mt-2 tracking-tight">
             Pilot • Limited to 200 Scholars
          </p>
        </header>

        <AnimatePresence mode="wait">
          {status !== "success" ? (
            <motion.form 
              key="form"
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleJoin} 
              className="space-y-6"
            >
              <div className="relative">
                <label className="text-[8px] uppercase font-black text-[#8B0000]/60 absolute -top-1.5 left-2 bg-[#FDFCF0] px-1">
                   Email
                </label>
                <input 
                  required
                  type="email"
                  placeholder="email@service.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toUpperCase())}
                  className="w-full bg-transparent border border-[#8B0000]/20 p-4 outline-none font-mono text-xs focus:border-[#8B0000] transition-colors placeholder:opacity-20"
                />
              </div>

              <button 
                disabled={status === "loading"}
                className="w-full bg-[#1A1A1A] text-white p-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#8B0000] transition-all disabled:opacity-50"
              >
                {status === "loading" ? "Recording Entry..." : "Request Access →"}
              </button>

                <p className="text-left mt-3 text-md 
                font-medium text-black">
                             Already on the waitlist? <Link href="/sign-up" className="text-[#8B0000]">
                             Sign up instead</Link></p>
            </motion.form>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="py-6 text-center space-y-4"
            >
              <div className="inline-block bg-green-50 border border-green-200 text-green-800 text-[10px] px-4 py-2 font-black uppercase">
                Entry Logged
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Your credentials have been queued for the <span className="text-[#8B0000] font-bold">PILOT</span> verification sweep. You are being redirected to the sign up
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-12 pt-4 border-t border-[#8B0000]/5 flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[7px] text-gray-400 uppercase font-mono">Status: Awaiting Verification</p>
            <p className="text-[7px] text-gray-400 uppercase font-mono">Ref: UNILAG-FIN-2027</p>
          </div>
          <div className="text-[#8B0000] opacity-20">
            {/* Simple geometric icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}