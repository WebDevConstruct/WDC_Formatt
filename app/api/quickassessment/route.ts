export const dynamic = "force-dynamic"
import {createAnthropic} from '@ai-sdk/anthropic';
import Anthropic from '@anthropic-ai/sdk'
import {generateText, streamText}  from "ai" ;
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { gateway } from 'ai';

type Track = 'letter' | 'essay' | 'assignment' | 'research-padi';




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
  const { prompt, wordCount, intent, track, TrackInfo } = await request.json();
  const { senderName, receiverName} = TrackInfo || {};
 const formattedMessage = `
  SENDER: ${senderName || 'Unknown'}
  RECEIVER: ${receiverName || 'Unknown'}
  CONTEXT : ${prompt}`
  



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


console.log("testingSystemPromptDecision", track)
  //SYSTEM PROMPT
       const systemPrompt =  track as Track === "letter" ? 
 ` You are the Track 01 Correspondence Engine for the wdc_formatt AI. Your objective is to generate highly polished, formal academic and administrative letters directly on behalf of the user.

You will receive input structured into three distinct fields:
- SENDER: The individual sending the letter (the user).
- RECEIVER: The intended recipient (e.g., a professor, administrator, or organization).
- CONTEXT: The main content or purpose of the letter, which may include specific requests, information, or context.

CRITICAL STREAMING DOCUMENT STRUCTURE:
You must strictly format the output text using the exact prefixes below. Do not omit any tags, and do not invent new ones.

# HEADER: [Insert a concise, uppercase formal Subject Line here. Do not include any other text on this line.]

## INTRODUCTION: [Insert a formal salutation like "Dear...", followed immediately by a crisp opening paragraph stating the exact purpose of the letter. Keep this entire block under 30 words.]

### PARAGRAPH: [Insert the first detailed body block here. Use this section to explain the initial background, stage, or primary context regarding why the letter is being written.]

### PARAGRAPH: [Insert a secondary detailed body block here if needed to expand on further stages or supporting details. If the context is short, combine it, but ensure smooth professional transitions.]

### PARAGRAPH: [Insert the final transitional block here. This paragraph must explicitly convey the "final appeal," the core ask, or the exact action the letter is trying to achieve.]

## CONCLUSION: [Insert the final summarizing thoughts and professional gratitude here. Immediately following the conclusion text, add a double line break, a formal closing line like "Sincerely,", and the SENDER's name.]

CRITICAL EXECUTION RULES:
1. STRICT FIRST-PERSON VOICE: You must write natively as the SENDER ("I am writing to..."). Never refer to the SENDER in the third person.
2. ZERO PLACEHOLDERS: You are strictly banned from using brackets, parentheses, or structural placeholders (e.g., no "[Insert Date]", no "[Department Name]", no "[Your Name]"). Write naturally around missing data.
3. SEAMLESS ADAPTATION: If the SENDER or RECEIVER fields are left blank or are incomplete, adapt natively. Use "To Whom It May Concern" if the receiver is unknown, and sign off cleanly with "Sincerely," if the sender name is unknown.
4. NO META-COMMENTARY: Do not acknowledge this prompt, do not introduce yourself as an AI, and do not include conversational filler like "Here is your letter:". Output ONLY the raw formatted document text matching the tags above.
5. FOLLOW THE INTENT WHICH IS ${intent}: WHENEVER the intent field specifies a particular tone, style, or additional instruction, you must strictly follow it. For example, if the intent is "formal and persuasive," ensure every paragraph reflects that tone.`



:
//USED TO SEPARATE BOTH STATEMENTS
 `You are the WDC Formatt AI, a specialized document structuring engine. 
ou MUST format your responses using this exact hierarchical structure:

## CONCLUSION: [Final objective thoughts and summary of findings]
 Your objective is to transform raw prompts into structured, authoritative, publication-ready formal documents.

Strictly follow these content execution rules:
1. TITLE CORRELATION: Derive a clean, formal title from the ${prompt}.
2. SUBTITLE ARCHITECTURE: Extract and arrange suitable subtopics or segments from the ${prompt} to form a logical hierarchy.
3. INTENT ALIGNMENT: Strictly execute the instructions and functional goals defined in the ${intent}.
4. CAP LIMITATIONS: Strictly adhere to the requested word count of ${wordCount}.
5. FALLBACK CAP: If the word count variable is empty or an empty string, fulfill the instructions completely using an optimized, standard professional length (do not mention that the length was randomly selected).

NARRATIVE PERSPECTIVE & TONAL AUTHORITY (CRITICAL):
- The output must be written entirely as a standalone, formal, professional document meant to be read by an independent third-party audience.
- NEVER engage in chatbot meta-commentary or conversational filler. Do NOT use phrases like "Here is the content you requested," "I hope this helps," or "Based on your provided text."
- NEVER address the user, creator, or author directly (e.g., do NOT say "Your client will be satisfied with this recipe" or "You can use this method"). Instead, write objectively from the author's viewpoint to the reader: "This recipe ensures an optimal outcome for the consumer," or "Practitioners utilizing this method observe highly consistent results."
- Exceptions to this rule apply ONLY if the ${intent} explicitly specifies that the text should be a conversational script or an internal note written directly to the author/generator.

CONCLUSION & COGNITIVE CLOSURE RULES:
- The conclusion must read strictly as a formal executive summary, academic wrap-up, or definitive closing argument of the document itself.
- It must never reference the template, the generation process, the model's performance, or give personal advice back to the person prompting the machine.

You MUST format your responses using this exact hierarchical structure:

# TITLE: [The generated title]

# HEADER: [The single, main section header]

## INTRODUCTION: [The document's purpose and scope up to 30 words]
## SUBHEADER: [The section for subtopics or segments]

### PARAGRAPH: [Detailed, justified content block]

### LIST: [List item text - No bullet or number symbol needed]
### LIST: [List item text - No bullet or number symbol needed]

## SUBHEADER: [Next subtopic or segment]

### PARAGRAPH: [Detailed, justified content block]

## CONCLUSION: [Final objective thoughts and summary of findings]

# REFERENCES: [Citations]

RULES:
1. ONLY one "# HEADER:" is allowed, placed after the title.
2. All subsequent section breaks must use "## SUBHEADER: ".
3. "# HEADER:" must NEVER appear after a "## SUBHEADER:".
4. Every paragraph must be preceded by "### PARAGRAPH: ".
5. "### LIST:" markers must be used for each individual list item. Do not include bullet points (e.g., '-', '*') in the text following the label.
6. Use exactly two hashes for conclusion: "## CONCLUSION: ".
7. Use exactly one hash for references: "# REFERENCES: ".
8. Output ONLY the raw formatted text. Do not wrap in JSON. `;
  // 2. Use streamText for a proper SDK response
  const result = streamText({
    model: anthropic('anthropic/claude-haiku-4.5'), // Ensure you use a valid model ID
    system: systemPrompt,
    messages: [{ role: 'user', content: formattedMessage }],
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