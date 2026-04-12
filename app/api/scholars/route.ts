 export const runtime = 'edge';
 import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";

 export async function POST(req : Request){
   // const {department} = req
   const body = await req.json()
   const {department} = body;
   const ClerkUser = await currentUser()
    const {userId} = await auth();
    const username = ClerkUser?.username;
    const email = ClerkUser?.emailAddresses[0]?.emailAddress
    

    try {
        if(userId){
    await db.user?.create({
      data : {
      clerkId : userId|| "",
      email : email || "",
      username : username || "",
      university : "UNILAG",
      department : department,
      planTier : "free",
      expiresAt : new Date(),
      createdAt : new Date(),
      generationsUsed : 0,
      isWaitlisted : true
 }
     })
      }
    if(!userId){
        return new Response(JSON.stringify({error : "User obj unavailable", message : "User authentication failed"}
        ), {status : 404, headers : {"Content-Type" : "application/json"} })
    }else{
        return new Response(JSON.stringify({
            success : true, message : "User Created Successfully"
        }), {status : 200, headers : {"Content-Type" : "application/json"}})
    }
    

    }catch(error){
   return new Response(JSON.stringify({error : "Internal Server error", message : "Try again some other time"}), {
    status : 500, headers : {"Content-Type" : "application/json" }
   })
    }
 }

 export async function GET(){
   const {userId} = await auth();

   if(!userId){
    return new Response(JSON.stringify({error : "user authenntication error", 
        message : "userId unknown"
    }), {status : 404, headers :{ "Content-Type" : "application/json"}})
   }
   try{
const response = await db.user.findUnique({
    where : {
        clerkId : userId || "",
    }, include :{
        generations : {
            orderBy : {createdAt : "desc"},
            take : 2
        }
    }
})
if(response?.clerkId === userId){
return new Response(JSON.stringify({success : true, message : "User exists in the database"}), {
    status : 200, headers : {"Content-Type" : "application/json"}
})
}else if(response?.clerkId !== userId){
    return new Response(JSON.stringify({success : true, message : "User not found"}), {
    status : 404, headers : {"Content-Type" : "application/json"}
})
}

   }catch(error){
    return new Response(JSON.stringify({error :"Internal server error", message : "Request could not be proccesses" }),
{
    status : 500, headers : {"Content-Type" : "application/json"}
})
   }


   

 }