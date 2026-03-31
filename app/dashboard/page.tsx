'use client';

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link"
export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
console.log(user);  
if (!isLoaded) return <div>Bouncer is checking your ID...</div>; 


if (!isSignedIn) return <div>Access Denied. Please Sign In.</div>;
  return (
    <main className="min-h-screen bg-[#F5F5DC] text-[#2D2D2D] font-sans">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-[#D2B48C] bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tighter text-[#8B0000]">WDC FORMATT</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600 hidden md:block">Class of 2027</span>
          <UserButton  />
        </div>
      </nav>

      {/* Hero Welcome Section */}
      <section className="max-w-6xl mx-auto px-8 py-12">
        <header className="mb-12">
          <h2 className="text-4xl font-semibold mb-2 capitalize">
            Welcome, <span className="text-[#8B0000]">{user.username || 'Scholar'}</span>.
          </h2>
          <p className="text-lg text-gray-600 italic">
            I am your AI assistant. What can I help you achieve today?
          </p>
        </header>

        {/* The "Reception" Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Box 1: Quick Assessment */}
          <Link href ="/dashboard/quickassessment" className="group cursor-pointer bg-white p-8 rounded-2xl shadow-sm border border-[#D2B48C] hover:border-[#8B0000] hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 bg-[#F5F5DC] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#8B0000] transition-colors">
              <span className="text-2xl group-hover:grayscale-0">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-[#8B0000] mb-3">Quick Assessment</h3>
            <p className="text-gray-600 leading-relaxed">
              Rapidly evaluate financial models or code snippets. Perfect for high-velocity students looking for instant patterns.
            </p>
          </Link>

          {/* Box 2: Critical Thinking */}
          <div className="group cursor-pointer bg-white p-8 rounded-2xl shadow-sm border border-[#D2B48C] hover:border-[#8B0000] hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 bg-[#F5F5DC] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#8B0000] transition-colors">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-bold text-[#8B0000] mb-3">Critical Thinking</h3>
            <p className="text-gray-600 leading-relaxed">
              Deep-dive into complex logic. Leverage the Gemini engine to deconstruct finance-tech problems layer by layer.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}