"use server"
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

//This is carried out to verify user's identity from the neon database 
//through their email
export async function verifyWaitlistInvite(email : string){
    if(!email || !email?.includes("@")){
        return {allowed : false, error : "Invalid Email format"}
           }
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
export async function initialiazeWaitlistStudent(
     username : string,
    email : string, department : string){
  // const ClerkUser = await currentUser();
   // const username = ClerkUser?.username
   const {userId} = await auth();
const clerkId = userId || ""
    const normalizedEmail= email.toLowerCase().trim()
const now = new Date();
const thirtyDaysFromNow = new Date(now.getTime());

 if(clerkId?.length < 1 || username?.length < 1 || email?.length < 1){
    return new Response(JSON.stringify({error : "error in waitlist and user object", message : "An issue with updating the waitlist and creating user object"}),{
    status : 404, headers : {"Content-Type" : "application/json"}
  })
}
const existingUser = await db.user.findUnique(
    {where : {clerkId : userId || ""}}
)
// Check if the user already exists in the database, if they
//  exists no need to validate and initialize their accounts 

if(existingUser){
 return new Response(JSON?.stringify({success : true, message : "user exists in the database."}), {
    status : 204, headers : {"Content-Type" : "application/json"}
 })

    }
try{
 
  await db.$transaction([
     db.user.create({
        data : {
         username : username || "",
         email : normalizedEmail,
        planTier : "free",
        expiresAt : thirtyDaysFromNow,
        isWaitlisted : true,
        department : department,
        clerkId : userId || "",
        university : "UNILAG",
        generationUsed : 0
        }
    }),
      db.waitlist.update({
        where : {email : normalizedEmail},
        data : {isClaimed : true}
      })
])

  return new Response(JSON.stringify({success : true, message : "User invite claimed successfully"}),{
    status : 200, headers : {"Content-Type" : "application/json"}
  })

    
} catch (error) {
     return new Response(JSON.stringify({error : "internal Server error", message : "Could not update waitlist"}),{
    status : 500, headers : {"Content-Type" : "application/json"}
  })
}
}