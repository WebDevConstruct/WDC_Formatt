import {createAnthropic} from '@ai-sdk/anthropic';
import {generateText}  from "ai" ;
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';




type requestTypes = {
    prompt : string,
    title : string,
    titleFormat : string,
    subTitles ?: string,
    subTitleFormat ?: string,
    paragraphs ?: string,
    paragraphFormat ?: string
} 





const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});




export async function POST(request : Request): Promise<Response>{
  //1. Check if the user is an authorised user
  const cookieHeader = request?.headers.get("cookie");
  console.log("Cookies", cookieHeader ? "YES YOU CANT EAT YUMMY COOKIES" : "NO I CANT")
  const {userId}=  auth() as {userId : string | null};

  if(!userId){

    return new Response(JSON.stringify({error : "unauthorised", sessionId : userId}), {
      status : 401, headers : {"Content-Type" : "application/json"}
    })
  }

  //2. get user from database
  const user = await db.user.findUnique({
    where : {clerkId : userId}
  })
  if(!user){
    return new Response(JSON.stringify({error : "User not found"}), {
      status : 404, headers : {"Content-Type" : "application/json"}
    })
  }

  //3. Check trial expiry (30 days per user)
  const signUpDate = user.signupDate || new Date()
const trialEnd = new Date(signUpDate);
trialEnd.setDate(trialEnd.getDate() + 30);
const trialActive = new Date() < trialEnd;

if(!trialActive && user.plan === "free"){
  return new Response(JSON.stringify({error : "Trial expired"}), {
    status : 403, headers : {"Content-Type" :"application/json"}
  })
}
//4.  Check generation limit (5 for free trail) 
if(user.plan === "free" && user.generationCount >=5){
  return new Response(JSON.stringify({error : "Generation limit Reached"}), 
{status : 403, headers : {"Content-Type" : "application/json"}})
}

//5. Get Request Body
  const {prompt, title, titleFormat, subTitles, subTitleFormat,
     paragraphFormat}: requestTypes = await request.json()
     const systemPrompt = `
    You are the WDC Formatt Finance AI. 
    Strictly follow these layout rules:
    1. Title: "${title}" formatted as ${titleFormat}.
    2. Use these Sub-headers: ${subTitles || "are Unknown"} formatted as ${subTitleFormat || "are Unknown"}.
    3. Paragraph style: ${paragraphFormat || "are UnKnown"}.
    Generate the response in Markdown.
  `;

  //6. Generate
  
  const {text} = await generateText({
   model : anthropic("claude-haiku-3-5"),
   prompt : prompt,
   system : systemPrompt,
   
    })
    //7. Update generation Count
    await db.user.update({
      where : {clerkId : userId},
      data : {generationCount : {increment : 1}}
    })

    //8. Save generation to DB
    await db.generation.create({
      data:{
        userId : user.id,
        type : "quick",
        prompt,
        output : text
      }
    })
  
  return new Response(JSON.stringify({text}), {
    status  : 200, headers : {"Content-Type" :"application/json"}
  })

}