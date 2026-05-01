'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Clock, FileText, 
  History, Crown, 
} from "lucide-react";
import { useUser, UserButton} from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
export default function Dashboard() {
  // Dummy PDF history
  const  pdfHistory = [
    {id : 1, name: "Financial Analysis Report.pdf", date: "2024-06-15"},
    {id : 2, name: "Market Research Summary.pdf", date: "2024-06-10"},
    {id : 3, name: "Operational Efficiency Review.pdf", date: "2024-06-05"}
  ]
  // Plans
 

const [index, setIndex] = useState(0);

  const ADMIN_PROMPTS = [
    "Get me a list of insurance companies in Nigeria",
    "What are the big 5 auditing Companies",
    "A proposal to a potential sponsorship company",
    "Why does Fischer believe the Nigeria financial environment is not developed enough..."
  ];


  
  const {user}= useUser();
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ADMIN_PROMPTS.length);
    }, 6000);
 
  function ToBeReturned () {
      clearInterval(timer);
    }
 return ToBeReturned();
  }, []);


  const {username} = user || {};
  //console.log(user);

//if(!isSignedIn) console.log("User not Signed In")

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#5C4033] selection:bg-[#8B0000] selection:text-[#F5F5DC] overflow-x-hidden">
      {/* Decorative Brand Gradient */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#8B0000] via-[#A52A2A] to-[#5C4033]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        
        {/* --- DYNAMIC NAVIGATION & PLAN STATUS --- */}
   <nav className="flex justify-between items-center border-b border-[#5C4033]/10 pb-8 px-2">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#8B0000] rounded-lg text-[#F5F5DC] shadow-lg shadow-[#8B0000]/20">
          <Crown className="w-6 h-6" />
        </div>
        <div className="hidden md:block">
          <h2 className="text-xl font-black uppercase tracking-tighter text-[#8B0000] leading-none">
            WDC Formatt
          </h2>
          
        </div>
      </div>

      {/* Profile & Plan Actions */}
      <div className="flex items-center gap-4">
        {/* Active Plan Badges (Hidden on mobile to save space) */}
      

        {/* --- CLERK PROFILE NAVIGATION --- */}
        <div className="flex  gap-3 pl-4 border-l border-[#5C4033]/10 items-center justify-center">
          <div className="text-right hidden sm:block ">
            <p className="text-xs font-black text-[#5C4033] leading-none">
              {user?.username?.toUpperCase() || "User"}
            </p>
           
          </div>
          
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10 border-2 border-[#8B0000] rounded-xl",
                userButtonPopoverCard: "bg-[#F5F5DC] border border-[#5C4033]/20 shadow-2xl rounded-2xl",
                userButtonPopoverActionButtonText: "text-[#5C4033] font-bold text-sm",
                userButtonPopoverActionButtonIcon: "text-[#8B0000]",
                userButtonPopoverFooter: "hidden" // Keeps it clean for the pilot
              }
            }}
          />
        </div>
      </div>
    </nav>

        {/* --- HEADER & ADMINISTRATIVE REVEAL --- */}
        <div className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#5C4033]">
              Welcome, <span className="text-[#8B0000]">Scholar {username ? username?.toUpperCase() : "User"}</span>
            </h1>
            <p className="text-[#A52A2A] text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B0000] animate-ping" />
              30-Day Beta Testing Phase
            </p>
          </header>

          {/* THE "FISCHER" UNROLL ANIMATION */}
          <div className="relative h-16 w-full bg-[#5C4033] rounded-2xl flex items-center px-6 overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-4 text-[#F5F5DC] italic font-medium w-full"
              >
                <span className="text-[#8B0000] font-black not-italic">{`>`}</span>
                <span className="truncate text-sm md:text-lg">{ADMIN_PROMPTS[index]}</span>
              </motion.div>
            </AnimatePresence>
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#5C4033] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* --- MAIN GRID SYSTEM --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Beta Assessment Card */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#5C4033]/60">Available Module</h3>
            </div>
            
            <Link href="/dashboard/quickassessment" className="block group">
              <Card className="relative overflow-hidden bg-[#F5F5DC] border-2 border-[#5C4033] p-1 shadow-[8px_8px_0px_0px_rgba(92,64,51,1)] transition-all group-hover:shadow-[12px_12px_0px_0px_rgba(139,0,0,1)] group-hover:border-[#8B0000] group-hover:-translate-x-1 group-hover:-translate-y-1">
                <div className="bg-[#8B0000]/5 p-8 md:p-12 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-[#8B0000] text-[#F5F5DC] rounded-2xl shadow-xl shadow-[#8B0000]/20">
                      <Zap className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="px-4 py-2 bg-[#8B0000] text-[#F5F5DC] rounded-full text-[10px] font-black flex items-center gap-2">
                        <Clock className="w-3 h-3 animate-pulse" />
                        TIME-SENSITIVE
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-[#5C4033] leading-none uppercase italic">Quick Assessment</h2>
                    <p className="text-[#A52A2A] text-lg max-w-xl font-medium leading-relaxed">
                      This module is currently the only operational sequence active for the 30-day testing window. Ensure you are in a controlled environment before initializing.
                    </p>
                  </div>

                  <div className="pt-8 flex items-center gap-4">
                    <button className="bg-[#8B0000] text-[#F5F5DC] px-8 
                    py-4 rounded-xl font-black uppercase
                     text-sm tracking-widest shadow-lg shadow-[#8B0000]/30 group-hover:bg-[#5C4033] transition-colors">
                      Get Started
                    </button>
                    <span className="text-[#8B0000] font-black hidden sm:inline">PREPARING SERVER...</span>
                  </div>
                </div>
              </Card>
            </Link>

                {/* Slides */}
            <Link href="/dashboard/Slides" className="block group">
              <Card className="relative overflow-hidden bg-[#F5F5DC] border-2 border-[#5C4033] p-1 shadow-[8px_8px_0px_0px_rgba(92,64,51,1)] transition-all group-hover:shadow-[12px_12px_0px_0px_rgba(139,0,0,1)] group-hover:border-[#8B0000] group-hover:-translate-x-1 group-hover:-translate-y-1">
                <div className="bg-[#8B0000]/5 p-8 md:p-12 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-[#8B0000] text-[#F5F5DC] rounded-2xl shadow-xl shadow-[#8B0000]/20">
                      <Zap className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="px-4 py-2 bg-[#8B0000] text-[#F5F5DC] rounded-full text-[10px] font-black flex items-center gap-2">
                        <Clock className="w-3 h-3 animate-pulse" />
                        TIME-SENSITIVE
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-[#5C4033] leading-none uppercase italic">Slides</h2>
                    <p className="text-[#A52A2A] text-lg max-w-xl font-medium leading-relaxed">
                      This module is currently the only operational sequence active for the 30-day testing window. Ensure you are in a controlled environment before initializing.
                    </p>
                  </div>

                  <div className="pt-8 flex items-center gap-4">
                    <button className="bg-[#8B0000] text-[#F5F5DC] px-8 
                    py-4 rounded-xl font-black uppercase
                     text-sm tracking-widest shadow-lg shadow-[#8B0000]/30 group-hover:bg-[#5C4033] transition-colors">
                      Get Started
                    </button>
                    <span className="text-[#8B0000] font-black hidden sm:inline">PREPARING SERVER...</span>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* RIGHT: Dynamic PDF History */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#5C4033]/60">Vault History</h3>
            <div className="bg-[#5C4033]/5 rounded-3xl border border-[#5C4033]/10 p-6 flex flex-col min-h-[400px]">
              {pdfHistory.length > 0 ? (
                <div className="space-y-3">
                  {pdfHistory.map((pdf, i) => (
                    <motion.div 
                      whileHover={{ x: 5 }}
                      key={i} 
                      className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-[#5C4033]/5 hover:border-[#8B0000]/20 cursor-pointer"
                    >
                      <div className="bg-[#A52A2A]/10 p-2 rounded-lg text-[#A52A2A]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-black truncate">{pdf.name}</p>
                        <p className="text-[10px] uppercase font-bold opacity-40">{pdf.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#5C4033]/30 flex items-center justify-center text-[#5C4033]/30 mb-4">
                    <History className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-[#5C4033]/40 tracking-tighter italic">NO PDF</h4>
                  <p className="text-xs text-[#5C4033]/30 uppercase font-bold mt-2">Zero records detected in current beta cycle.</p>
                </div>
              )}
              
              <Link href="/archive" className="mt-auto pt-6 text-center text-xs font-black text-[#8B0000] hover:tracking-[0.2em] transition-all uppercase">
                Access Full Archive →
              </Link>
            </div>

            {/* Slides Page */}
          </div>
        </div>

        {/* --- INSTITUTIONAL FOOTER --- */}
        <footer className="pt-16 flex flex-col md:flex-row justify-between gap-8 opacity-40 border-t border-[#5C4033]/10">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <span>SECURE ACCESS v1.0.4</span>
            <span className="w-1 h-1 rounded-full bg-[#5C4033]" />
            <span>CLASS OF 2027</span>
          </div>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <span className="text-[#8B0000]">Critical: 30-Day Beta Remaining</span>
            <span>Unilag Finance Pilot</span>
          </div>
        </footer>
      </div>
    </div>
  );
}