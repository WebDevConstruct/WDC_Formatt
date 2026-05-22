export const dynamic = "force-dynamic"
import {createAnthropic} from '@ai-sdk/anthropic';
import Anthropic from '@anthropic-ai/sdk'
import {generateText, streamText}  from "ai" ;
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { gateway } from 'ai';

import "dotenv/config";


type requestTypes = {
     
    prompt : string,
    intent : string,
    wordCount : number,
    courseType ?: string,
   
} 

// const anthropic = new Anthropic({
//   apiKey: process.env.AI_GATEWAY_API_KEY,
// });




// 1. Configure the Anthropic provider to point to your Gateway
const anthropic = createAnthropic({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1',
});

export async function POST(request: Request) {
  // ... (Keep your Auth and DB logic here) ...
  const cookieHeader = request?.headers.get("cookie");
  console.log("Cookies", cookieHeader ? "YES YOU CANT EAT YUMMY COOKIES" : "NO I CANT")
  const {userId}= await  auth() ;

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

// if(user?.planTier === "free" && user?.generationsUsed >=5){
//   return new Response(JSON.stringify({error : "Generation limit Reached"}), 
// {status : 403, headers : {"Content-Type" : "application/json"}})
// }
  const { prompt, wordCount, intent } = await request.json();


  //SYSTEM PROMPT
       const systemPrompt = `
    You are the WDC Formatt AI. 
    Strictly follow these layout rules:
    1. You are to dervive  a title from the ${prompt}.
    2. Get suitable sub titles from ${prompt}.
    3. The ${intent} you must follow.
    4. Strictly to the word count of ${wordCount} as instructed.
    Generate the response in Markdown.
    5. if the word count is an empty string return information based on a random word count, but 
    address the questions and instructions completely.
  You MUST format your responses using this exact structure:
You are the WDC_Formatt AI. You must follow this strict hierarchical structure. 

# TITLE: [The generated title]

# HEADER: [The single, main section header]

## SUBHEADER: [The section for subtopics or segments]

### PARAGRAPH: [Detailed content]

### LIST: [List item text - No bullet symbol needed]
### LIST: [List item text - No bullet symbol needed]

## SUBHEADER: [Next subtopic]

### PARAGRAPH: [Detailed content]

## CONCLUSION: [Final thoughts]

# REFERENCES: [Citation or source material]

RULES:
1. ONLY one "# HEADER:" is allowed, placed after the title.
2. All subsequent section breaks must use "## SUBHEADER: ".
3. "# HEADER:" must NEVER appear after a "## SUBHEADER:".
4. Every paragraph must be preceded by "### PARAGRAPH: ".
5. "### LIST:" markers must be used for each individual list item. Do not include bullet points (e.g., '-', '*') in the text following the label.
6. Use exactly two hashes for conclusion: "## CONCLUSION: ".
7. Use exactly one hash for references: "# REFERENCES: ".
8. Output ONLY the raw formatted text. Do not wrap in JSON.
  `;
  // 2. Use streamText for a proper SDK response
  const result = streamText({
    model: anthropic('anthropic/claude-haiku-4.5'), // Ensure you use a valid model ID
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  // 3. Increment generation count safely
  await db.user.update({
    where: { clerkId: userId },
    data: { generationsUsed: { increment: 1 } } // Increment, don't set static 3
  });

  // 4. Return the stream response (SDK handles all the headers for you)
  return result.toTextStreamResponse();
}
// const client = new Anthropic({
//   apiKey: process.env.AI_GATEWAY_API_KEY,
//   baseURL: 'https://ai-gateway.vercel.sh/v1',
// });
// //const {title, hFormat, shFormat} = useGlobalContext()
// const model =  await gateway?.getAvailableModels()


// export async function POST(request : Request){
//   //1. Check if the user is an authorised user
//   const cookieHeader = request?.headers.get("cookie");
//   console.log("Cookies", cookieHeader ? "YES YOU CANT EAT YUMMY COOKIES" : "NO I CANT")
//   const {userId}=await  auth() ;

//   if(!userId){
//    return new Response(JSON.stringify({error : "unauthorised", sessionId : userId}), {
//       status : 401, headers : {"Content-Type" : "application/json"}
//     })
//   }

//   //2. get user from database
//   const user = await db.user.findUnique({
//     where : {clerkId : userId}
//   }) 


//   //3. Check trial expiry (30 days per user)
  



// const ClerkUser = await  currentUser();
// // console.log(ClerkUser);
// const email = ClerkUser?.emailAddresses[0]?.emailAddress;
// const username = ClerkUser?.username || "";


//   if(!user && navigator.onLine){
//     await db.user.create({
//       data : {
//       clerkId: userId,
//       username : username,
//       department : "",
//     email: email || "no-email.wsc.com",
//     planTier : "free",
//     createdAt: new Date(),
//     generationsUsed: 0,
//       }
//     })
    
//   }
//   // const expiredDate = user?.expiresAt ? new Date(user.expiresAt) : new Date();
  
//   // const trialActive = expiredDate > new Date()
// if(user?.planTier !== "free"){
//   return new Response(JSON.stringify({error : "Trial expired"}), {
//     status : 403, headers : {"Content-Type" :"application/json"}
//   })
// }
// //4.  Check generation limit (5 for free trail) 

// if(user?.planTier === "free" && user?.generationsUsed >=5){
//   return new Response(JSON.stringify({error : "Generation limit Reached"}), 
// {status : 403, headers : {"Content-Type" : "application/json"}})
// }

// //5. Get Request Body
//   const {prompt,  wordCount, intent}: requestTypes = await request.json()
//      const systemPrompt = `
//     You are the WDC Formatt AI. 
//     Strictly follow these layout rules:
//     1. You are to dervive  a title from the ${prompt}.
//     2. Get suitable sub titles from ${prompt}.
//     3. The ${intent} you must follow.
//     4. Strictly to the word count of ${wordCount} as instructed.
//     Generate the response in Markdown.
//   You MUST format your responses using this exact structure:

//     - Title: Use "# " prefix (e.g., "# Architectural Systems")
//     - Headers: Use "## " prefix (e.g., "## OVERVIEW")
//     - Subheaders: Use "## " prefix (e.g., "## SUBHEADER")
//     - Paragraphs: Use "### " prefix (e.g., "### Paragraph")
//     - Lists: Use "### " prefix followed by bullet points (e.g., "### LIST\n- Item 1\n- Item 2")
//  Example format:
//     # Main Title
    
//     ## HEADER
    
//     ### Paragraph
//     This is paragraph content explaining the concept.
    
//     ### LIST
//     - First item
//     - Second item
//     - Third item
    
//     ## SUBHEADER
    
//     ### Paragraph
//     More detailed content here.

//     Always follow this structure exactly
//   `;

//   //6. Generate
  
//   const result = await  client?.messages?.create({
//    model : "claude-sonnet-4-6",
//    max_tokens : 1024,
//  //  prompt : prompt,
//  //  max_tokens : 1024,
//    system : systemPrompt,
//    //fallbacks : ["gpt-4o"],
//    messages : [{role : "user", content : prompt}]
   
//     })
//     //7. Update generation Count
//     //A reliable function to count
//     //Kindly Check the length of the current generations then add the length for the update
//     await db.user.update({
//       where : {clerkId : userId},
//       data : {generationsUsed : 3 }
//     })
// // const body ={
 
// // }
// console.log(db?.user);
//     //8. Save generation to DB
//     // await db.generation.create({
//     //   data:{
//     //     relateToDepartment : courseType === "main" ? true : false,
//     //     studentId: user?.clerkId || "0",
//     //     prompt,
//     //     title  : "",
//     //    generatedContent : text,
//     //    isCurrent : true,
//     //    createdAt : new Date(),
//     //    formatting : JSON.stringify(body),
//     //    intent : intent,
//     //    maxRefinements : 3,
//     //    refinementCount : 1,
//     //    updatedAt : new Date(),
//     //    status : "PROCESSING"
      
//     //   }
//     // })
  
//   // return new Response(JSON.stringify({text}), {
//   //   status  : 200, headers : {"Content-Type" :"application/json"}
//   // })
//   return result?.content[0]?.type
//   console.log(result?.content[0])

// }