import { db } from "@/lib/prisma";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(request : Request){
    const payload : WebhookEvent = await request.json();
    if(payload.type === "user.created"){
        const {id, email_addresses} = payload.data;

        await db.user.create({
            data : {
                clerkId : id,
                email : email_addresses[0].email_address
            }
        })
    }
    return new Response(JSON.stringify({success : true, userCreated : true}), {
        status : 200,
         headers : {"Content-Type" : "app;ication/json"}
    })
}