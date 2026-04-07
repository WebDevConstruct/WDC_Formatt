import { createClerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(){
    const {userId} = await auth();
    
    const clerk = await createClerkClient({secretKey : process.env.CLERK_SECRET_KEY});
    if(!userId){
        return new Response(JSON.stringify({error :"unauthorised",
             message : "The UserId is undefined"}),{
            status : 401, headers : {"Content-Type" : "application/json"}
        })
    }
    try{
      await clerk.users?.deleteUser(userId || "");
    //   Response
 return new Response(JSON.stringify({success : true, message : "Successfully deleted the account"}), {
        status : 200, headers : {"Content-Type" : "application/json"}
      })
    }catch(error){
         return new Response(JSON.stringify({error : "An Internal Server error", message :""}), {
            status : 500, headers : {"Content-Type" : "äpplication/json"}
         })
    }

}