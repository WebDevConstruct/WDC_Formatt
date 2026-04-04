"use server"
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
export async function POST(req : Request){
    
 const { email } = await req.json();
    const normalizedEmail = email.toLowerCase().trim();
    if(!email || !email.includes("@")){
        return {success : false, error : "Invalid Format"}
    }
    try{

        const existingEntry = await db.waitlist.findUnique({
       where : {email : normalizedEmail}
        })
        if(existingEntry){
            return new Response(JSON.stringify({message : "You are already on the waitlist"}),
                {status : 409, headers : {"Content-Type" : "application/json"}}
            )
        }
   const newEntry = await db.waitlist.create({
     data:{
        email : normalizedEmail,
        isClaimed : false
     }
   })
   return NextResponse.json({success : true, message : "Successfully joined the waitlist"},
     {status : 200, headers : {"Content-Type" : "application/json"}})
       
    }catch(error ){
        return new Response(JSON.stringify({message : "WAITLIST_POST_ERROR"}), {
            status : 500, headers : {"Content-Type" : "application/json"}
        })
    }
}