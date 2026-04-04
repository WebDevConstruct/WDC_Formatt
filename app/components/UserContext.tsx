"use client";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

// Strictly defined departments for the UNILAG Management Sciences Beta
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

export default function InstitutionalPopup() {
  const { user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSyncing(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await user?.update({
        unsafeMetadata: {
          university: "University of Lagos",
          faculty: "Management Sciences",
          department: formData.get("department"),
          setup_complete: true,
          planTier: "free"
        },
      });
      window.location.reload(); 
    } catch (err) {
      console.error("Sync Error:", err);
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#8B0000]/95 backdrop-blur-3xl p-4">
      {/* The Floating Cream Card - Modern Institutional Aesthetic */}
      <div className="w-full max-w-lg bg-[#FDFCF0] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7)] p-10 md:p-14 border-l-[8px] border-[#8B0000] rounded-sm">
        
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[2px] w-12 bg-[#8B0000]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8B0000]/80">
              Institutional Pilot 1.0
            </span>
          </div>
          <h2 className="font-serif text-4xl text-[#8B0000] leading-none font-medium tracking-tight">
            UNILAG <br /> 
            <span className="italic font-light opacity-90 text-2xl">Management Sciences</span>
          </h2>
        </header>

        <form onSubmit={handleSync} className="space-y-10">
          <div className="space-y-8">
            {/* Read-Only Context (Establishes Authority) */}
            <div className="flex gap-10 opacity-60">
              <div className="border-b border-[#8B0000]/10 pb-1 w-full">
                <label className="block text-[8px] font-bold uppercase tracking-widest text-[#8B0000] mb-1">Institution</label>
                <p className="font-serif text-sm text-[#8B0000]">University of Lagos</p>
              </div>
              <div className="border-b border-[#8B0000]/10 pb-1 w-full">
                <label className="block text-[8px] font-bold uppercase tracking-widest text-[#8B0000] mb-1">Faculty</label>
                <p className="font-serif text-sm text-[#8B0000]">Management Sciences</p>
              </div>
            </div>

            {/* Department Dropdown (The only active input) */}
            <div className="border-b-2 border-[#8B0000]/30 pb-2 focus-within:border-[#8B0000] transition-all relative">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B0000] mb-3">Select Department</label>
              <select required name="department" 
                className="w-full bg-transparent outline-none font-serif text-xl text-[#8B0000] cursor-pointer appearance-none">
                <option value="" disabled selected>Choose your field...</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept} className="bg-[#FDFCF0] text-[#8B0000]">{dept}</option>
                ))}
              </select>
              {/* Custom Down Arrow for Dropdown */}
              <div className="absolute right-0 bottom-4 pointer-events-none text-[#8B0000]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <button 
            disabled={isSyncing}
            className="w-full bg-[#8B0000] py-6 text-[#FDFCF0] font-serif uppercase tracking-[0.5em] text-[10px] hover:bg-[#700000] transition-all shadow-xl relative active:scale-[0.99]"
          >
            {isSyncing ? (
              <span className="flex items-center justify-center gap-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FDFCF0] animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#FDFCF0] animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#FDFCF0] animate-bounce"></span>
              </span>
            ) : "Establish Academic Identity"}
          </button>
        </form>

        <footer className="mt-12 text-[9px] text-[#8B0000]/40 text-center uppercase tracking-widest leading-relaxed">
          Proprietary Context Sync • WDC Finance • UNILAG Beta
        </footer>
      </div>
    </div>
  );
}