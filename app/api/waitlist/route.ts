"use server"
import { db } from "@/lib/prisma";

export async function POST(req : Request){
    const body = await req.json()
   const {email} = body;

    const normalizedEmail = email.toLowerCase().trim();
    if(!email || !email.includes("@")){
        return new Response(JSON.stringify({error : "Invalid Format", message : "The Email Format is wrong"}),{
            status : 400, headers : {"Content-Type" : "application/json"}
        })
    }
    try{
    const existingEntry = await db.waitlist.findUnique({
       where : {email : normalizedEmail}
        })
        if(existingEntry){

            return new Response(JSON.stringify({error : "Invitee already exists", message : "You are already on the waitlist"}),
                {status : 409, headers : {"Content-Type" : "application/json"}}
            )
        }
    await db.waitlist.create({
     data:{
        email : normalizedEmail,
        isClaimed : false
     }
   })


   return new Response(JSON.stringify({success : true, message : "Successfully joined the waitlist"}),
     {status : 200, headers : {"Content-Type" : "application/json"}})
       
    }catch(error ){
        return new Response(JSON.stringify({error : "WAITLIST_POST_ERROR", message : "Registration error"}), {
            status : 500, headers : {"Content-Type" : "application/json"}
        })
    }
}