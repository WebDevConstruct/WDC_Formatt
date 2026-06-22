"use client"
import {Crown} from "lucide-react";
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
export const NavBar = () => {
  const { user } = useUser();
  return (
        <nav className="flex justify-between bg-[#F2F0E9]
         items-center border-b border-[#483C32]/10 py-10 px-5 ">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#483C32] rounded-lg text-[#F2F0E9] shadow-lg shadow-[#483C32]/20">
              <Crown className="w-6 h-6" />
            </div>
            <div className="hidden md:block">
              <h2 className="text-xl font-serif font-black uppercase tracking-tighter text-[#483C32] leading-none">
                WDC <span className="italic text-[#D4AF37]">Formatt</span>
              </h2>
            </div>
          </div>

          {/* Profile & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex gap-3 pl-4 border-l border-[#483C32]/10 items-center justify-center">
              <div className="text-right hidden sm:block ">
                <p className="text-xs font-black text-[#483C32] leading-none uppercase tracking-widest">
                  {user?.username || "Scholar"}
                </p>
              </div>
              
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 border-2 border-[#D4AF37] rounded-xl",
                    userButtonPopoverCard: "bg-[#F2F0E9] border border-[#483C32]/20 shadow-2xl rounded-2xl",
                    userButtonPopoverActionButtonText: "text-[#483C32] font-bold text-sm",
                    userButtonPopoverActionButtonIcon: "text-[#D4AF37]",
                    userButtonPopoverFooter: "hidden"
                  }
                }}
              />
            </div>
          </div>
        </nav>
  )
}
