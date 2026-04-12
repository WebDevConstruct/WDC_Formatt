export const runtime = 'edge';
import {createAnthropic} from '@ai-sdk/anthropic';
import {generateText}  from "ai" ;
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';


type requestTypes = {
     
    prompt : string,
    intent : string,
    wordCount : number,
    courseType ?: string,
   
} 





const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
//const {title, hFormat, shFormat} = useGlobalContext()



export async function POST(request : Request): Promise<Response>{
  //1. Check if the user is an authorised user
  const cookieHeader = request?.headers.get("cookie");
  console.log("Cookies", cookieHeader ? "YES YOU CANT EAT YUMMY COOKIES" : "NO I CANT")
  const {userId}=await  auth() ;

  if(!userId){
   return new Response(JSON.stringify({error : "unauthorised", sessionId : userId}), {
      status : 401, headers : {"Content-Type" : "application/json"}
    })
  }

  //2. get user from database
  const user = await db.user.findUnique({
    where : {clerkId : userId}
  }) 


  //3. Check trial expiry (30 days per user)
  



const ClerkUser = await  currentUser();
// console.log(ClerkUser);
const email = ClerkUser?.emailAddresses[0]?.emailAddress;
const username = ClerkUser?.username || "";


  if(!user && navigator.onLine){
    await db.user.create({
      data : {
      clerkId: userId,
      username : username,
      department : "",
    email: email || "no-email.wsc.com",
    planTier : "free",
    createdAt: new Date(),
    generationsUsed: 0,
      }
    })
    
  }
  // const expiredDate = user?.expiresAt ? new Date(user.expiresAt) : new Date();
  
  // const trialActive = expiredDate > new Date()
if(user?.planTier !== "free"){
  return new Response(JSON.stringify({error : "Trial expired"}), {
    status : 403, headers : {"Content-Type" :"application/json"}
  })
}
//4.  Check generation limit (5 for free trail) 

if(user?.planTier === "free" && user?.generationsUsed >=5){
  return new Response(JSON.stringify({error : "Generation limit Reached"}), 
{status : 403, headers : {"Content-Type" : "application/json"}})
}

//5. Get Request Body
  const {prompt, wordCount, courseType, intent}: requestTypes = await request.json()
     const systemPrompt = `
    You are the WDC Formatt Finance AI. 
    Strictly follow these layout rules:
    1. You are to dervive  a title from the ${prompt}.
    2. Get suitable sub titles from ${prompt}.
    3. Related to the course ${courseType}.
    4. The ${intent} you must follow.
    5. Strictly to the word count of ${wordCount} as instructed.
    Generate the response in Markdown.
  `;

  //6. Generate
  
  const {text} = await generateText({
   model : anthropic("claude-haiku-3-5"),
   prompt : prompt,
   system : systemPrompt,
   
    })
    //7. Update generation Count
    //A reliable function to count
    //Kindly Check the length of the current generations then add the length for the update
    await db.user.update({
      where : {clerkId : userId},
      data : {generationsUsed : 3 }
    })
const body ={
 hFormat :  ["Underlines", "BOLD"],
shFormat : ["BOLD"]
}
console.log(db?.user);
    //8. Save generation to DB
    await db.generation.create({
      data:{
        relateToDepartment : courseType === "main" ? true : false,
        studentId: user?.clerkId || "0",
        prompt,
        title  : "GROWTH",
       generatedContent : text,
       isCurrent : true,
       createdAt : new Date(),
       formatting : JSON.stringify(body),
       intent : intent,
       maxRefinements : 3,
       refinementCount : 1,
       updatedAt : new Date(),
       status : "PROCESSING"
      
      }
    })
  
  return new Response(JSON.stringify({text}), {
    status  : 200, headers : {"Content-Type" :"application/json"}
  })

}