"use server"
import { db } from "@/lib/prisma";

export async function verifyWaitlistInvite(email : string){
    try{
        const entry = await db.waitlist.findUnique({
             where:  {email : email?.toLowerCase()}
        })
        if(!entry) return {allowed : false, error  : "Email not on the the waitlist"}

        if(entry.isClaimed) return {allowed : false, error : "Invite already claimed"}
        return {allowed : true, error : null}
    }catch(err){
        return {allowed : false, error: "System error"}

    }
}

// The institution initialization error
export async function initialiazeWaitlistStudent(clerkId : string, email : string){
    const normalizedEmail= email.toLowerCase().trim()
const now = new Date();
const thirtyDaysFromNow = new Date(now.getTime());
const existingUser = await db.user.findUnique(
    {where : {clerkId : clerkId}}
)
// Check if the user already exists in the database, if they
//  exists no need to validate and initialize their accounts 
if(existingUser){
          return {success : true, message : "user invited"}
    }
try{
    // Verify if the user is on the waitlist through their email
    const invite = await verifyWaitlistInvite(email);
if(!invite.allowed){
    throw new Error(invite.error || "Not allowed to claim invite")
}
    await db.$transaction([
     db.user.create({
         email : email?.toLowerCase(),
        planTier : "free",
        expiresAt : thirtyDaysFromNow,
        isWaitlisted : true,
        department : "unassigned",
        clerkId : clerkId
    }),
      db.waitlist.update({
        where : {email : normalizedEmail},
        data : {isClaimed : true}
      })
])

    
} catch (error) {
 console.error("Surgical Unit error:", error)
}
}