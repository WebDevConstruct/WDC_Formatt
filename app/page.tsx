import Link from "next/link";

export default function LandingPage() {
  return (
// Updated Design
   <main className="min-h-screen bg-[#F2F0E9] flex flex-col selection:bg-[#483C32] selection:text-[#D4AF37]">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 md:px-12 md:py-8 flex justify-between items-center max-w-screen-2xl mx-auto">
        <div className="text-[#483C32] font-serif text-2xl md:text-3xl font-bold tracking-tighter">
          WDC <span className="italic text-[#D4AF37]">Formatt</span>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/signin" className="hidden sm:block text-[#483C32] font-bold hover:opacity-70 transition-opacity">
            Sign In
          </Link>
          <Link href="/sign-up" className="bg-[#483C32] text-[#F2F0E9] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#2C2520] transition-all shadow-lg shadow-[#483C32]/10">
            Join Beta
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex pt-10 flex-col items-center justify-center px-6 text-center lg:px-20">
        <div className="max-w-6xl w-full space-y-8 md:space-y-12">
          
          {/* Badge */}
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#D4AF37] text-[#483C32] text-xs md:text-sm font-bold tracking-[0.3em] uppercase bg-white/50 backdrop-blur-sm">
            30-Day Academic Beta
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-serif text-[#483C32] leading-[1.05] tracking-tight">
            The Professional <br className="hidden lg:block" /> 
            Standard for <span className="italic text-[#D4AF37]">Mgt Science</span>
          </h1>
          
          {/* Subtext - Updated to the new paragraph standard */}
          <p className="text-base sm:text-xl lg:text-3xl text-[#483C32]/80 font-medium max-w-3xl mx-auto leading-relaxed px-4">
            A specialized academic engine designed to transform messy drafts into 
            <span className="text-[#483C32] font-bold"> Faculty-standard reports</span>.
          </p>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 justify-center items-center pt-8 w-full max-w-sm mx-auto sm:max-w-none">
            <Link href="/sign-up" 
              className="w-full sm:w-72 bg-[#483C32] hover:bg-[#2C2520] text-[#F2F0E9] text-lg lg:text-xl font-bold py-5 md:py-6 rounded-2xl shadow-xl 
               transition-all duration-300 hover:scale-[1.02] 
               active:scale-95 text-center flex items-center justify-center"
            >
              Get Started Free
            </Link>
            
            <Link href="/signin" 
              className="w-full sm:w-72 bg-transparent border-2
                border-[#483C32] text-[#483C32] hover:bg-[#483C32]
                 hover:text-[#F2F0E9] text-lg lg:text-xl font-bold py-5 md:py-6 rounded-2xl transition-all duration-300 text-center flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 md:mt-32 pb-12 w-full max-w-screen-2xl mx-auto border-t border-[#483C32]/10 pt-10 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[#483C32]/50 text-[10px] lg:text-xs font-bold uppercase tracking-[0.25em]">
            <div className="flex gap-4">
              <span>Secure Connection</span>
             
            </div>
            <p className="order-last md:order-none text-[#483C32]/80">© 2026 WDC CONSTRUCT • UNILAG</p>
            <p className="text-[#483C32]/80">Built for the Faculty of Management Science</p>
          </div>
        </div>
      </section>
    </main>
    // Old Design
    // <main className="min-h-screen bg-[#F5F5DC] flex flex-col selection:bg-[#8B0000] selection:text-[#F5F5DC]">
    //   {/* Navigation - Adaptive for all screens */}
    //   <nav className="w-full px-6 py-4 md:px-12 md:py-8 flex justify-between items-center max-w-screen-2xl mx-auto">
    //     <div className="text-[#5C4033] font-serif text-2xl md:text-3xl font-bold tracking-tighter">
    //       WDC <span className="italic text-[#8B4513]">Formatt</span>
    //     </div>
    //     <div className="flex gap-6 items-center">
    //       <Link href="/signin" className="hidden sm:block text-[#5C4033] font-bold hover:text-[#8B0000] transition-colors">
    //         Sign In
    //       </Link>
    //       <Link href="/sign-up" className="bg-[#8B0000] text-[#F5F5DC] px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#A52A2A] transition-all">
    //         Join Beta
    //       </Link>
    //     </div>
    //   </nav>

    //   {/* Hero Section - Scaled for PC and Mobile */}
    //   <section className="flex-1 flex flex-col items-center justify-center px-6 text-center lg:px-20">
    //     <div className="max-w-6xl w-full space-y-8 md:space-y-12">
          
    //       {/* Badge */}
    //       <div className="inline-block px-4 py-1.5 rounded-full border border-[#D2B48C] text-[#8B4513] text-xs md:text-sm font-bold tracking-[0.3em] uppercase bg-[#EADDCA]/30">
    //         30-Day Academic Beta
    //       </div>

    //       {/* Headline - Responsive Sizes */}
    //       <h1 className="text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-serif text-[#5C4033] leading-[1.05] tracking-tight">
    //         The Professional <br className="hidden lg:block" /> 
    //         Standard for <span className="italic text-[#8B0000]">Mgt Science</span>
    //       </h1>
          
    //       {/* Subtext */}
    //       <p className="text-base sm:text-xl lg:text-3xl text-[#5C4033]/80 font-medium max-w-3xl mx-auto leading-relaxed px-4">
    //         A specialized academic engine designed to transform messy drafts into 
    //         <span className="text-[#5C4033] font-bold"> Faculty-standard reports</span>.
    //       </p>

    //       {/* Call to Action - Responsive Layout */}
    //       <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 justify-center items-center pt-8 w-full max-w-sm mx-auto sm:max-w-none">
    //         <Link href="/sign-up" 
    //           className="w-full sm:w-72 bg-[#8B0000] hover:bg-[#A52A2A] text-[#F5F5DC] text-lg lg:text-xl font-bold py-5 md:py-6 rounded-2xl shadow-2xl 
    //           transition-all duration-300 hover:scale-[1.03] 
    //           active:scale-95 text-center flex items-center justify-center"
    //         >
    //           Get Started Free
    //         </Link>
            
    //         <Link href="/signin" 
    //           className="w-full sm:w-72 bg-transparent border-2
    //            border-[#5C4033] text-[#5C4033] hover:bg-[#5C4033]
    //             hover:text-[#F5F5DC] text-lg lg:text-xl font-bold py-5 md:py-6 rounded-2xl transition-all duration-300 text-center flex items-center justify-center"
    //         >
    //           Sign In
    //         </Link>
    //       </div>
    //     </div>

    //     {/* Footer - Wide Desktop/PC alignment */}
    //     <div className="mt-24 md:mt-32 pb-12 w-full max-w-screen-2xl mx-auto border-t border-[#D2B48C]/40 pt-10 px-6">
    //       <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[#5C4033]/50 text-[10px] lg:text-xs font-bold uppercase tracking-[0.25em]">
    //         <div className="flex gap-4">
    //           <span>Secure Connection</span>
    //           <span>•</span>
    //           <span>Noon Deadline Sync</span>
    //         </div>
    //         <p className="order-last md:order-none">© 2026 WDC CONSTRUCT • UNILAG</p>
    //         <p>Built for the Faculty of Management Science</p>
    //       </div>
    //     </div>
    //   </section>
    // </main>
  );
}