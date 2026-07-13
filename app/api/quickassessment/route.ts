export const dynamic = "force-dynamic"
import {createAnthropic} from '@ai-sdk/anthropic';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';


type Track = 'letter' | 'essay' | 'assignment' | 'research-padi';




import "dotenv/config";


type requestTypes = {
     
    prompt : string,
    intent : string,
    wordCount : number,
    courseType ?: string,
   
} 




// 1. Configure the Anthropic provider to point to your Gateway
const anthropic = new Anthropic({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh',
  //model : "claude-haiku-4-5"
});

export async function POST(request: Request) {
  try {
    const { prompt, wordCount, intent, track, TrackInfo, salutation, receiverPosition, receiverOrganization, topic} = await request.json();
    const { senderName, receiverName } = TrackInfo || {};

    const sanitizedPrompt = (prompt || "").trim();
    const formattedMessage = track === "letter" 
      ? `SENDER: ${senderName || 'Unknown'}\nRECEIVER: ${receiverName || 'Unknown'}\nCONTEXT: ${sanitizedPrompt}`
      : sanitizedPrompt;

    if (!formattedMessage.trim()) {
      return new Response(JSON.stringify({ error: "Prompt content cannot be empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    let user = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      const ClerkUser = await currentUser();
      const email = ClerkUser?.emailAddresses[0]?.emailAddress;
      const username = ClerkUser?.username || "";

      user = await db.user.create({
        data: {
          clerkId: userId,
          username: username,
          department: "",
          email: email || "no-email.wsc.com",
          planTier: "free",
          createdAt: new Date(),
          generationsUsed: 0,
        }
      });
    }

    if (user?.planTier !== "free") {
      return new Response(JSON.stringify({ error: "Trial expired" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // ==========================================
    // SYSTEM PROMPTS (UPDATED WITH STRICT LIST RULES)
    // ==========================================
   const systemPrompt =  track as Track === "letter" ? 
 ` You are the Track 01 Correspondence Engine for the wdc_formatt AI. Your objective is to generate the BODY TEXT of a formal, professional letter on behalf of the user. The sender's address block, recipient's address block, date, and greeting are all rendered separately by the application — you must never produce them yourself.
 
FORMALITY IS NOT OPTIONAL: this tool exists strictly for formal, professional correspondence. Treat every request as formal regardless of how casually the CONTEXT or INTENT is phrased. You may adjust firmness or warmth within that professional register, but you must never drop into a casual, conversational, or informal tone.
 
You will receive input structured into these fields:
- SENDER: ${senderName} — the person the letter is from.
- RECEIVER: ${receiverName}${receiverPosition ? `, ${receiverPosition}` : ""}${receiverOrganization ? ` at ${receiverOrganization}` : ""} — the intended recipient.
- TOPIC: ${topic ? `"${topic}"` : "Not specified — determine a concise, appropriate subject from the CONTEXT below."}
- CONTEXT: The main content or purpose of the letter, provided separately below.
 
CRITICAL STREAMING DOCUMENT STRUCTURE:
You must strictly format the output text using the exact prefixes below. Do not omit any tags, and do not invent new ones. Do not include a TITLE tag — it is not used by the application.
 
# HEADER: [${topic ? `Reproduce this exact subject line, in uppercase, verbatim: "${topic}"` : "Insert a concise, uppercase formal subject line summarizing the letter's purpose."}]
 
## INTRODUCTION: [Insert ONLY the opening statement of purpose — a crisp sentence or two stating the exact reason for writing. Do NOT include a greeting or salutation ("Dear...") here; that is rendered separately by the application and would otherwise appear twice. Begin directly with the substance, e.g. "I am writing to...". Keep this block under 30 words.]
 
### PARAGRAPH: [Insert the first detailed body block here. Use this section to explain the initial background, stage, or primary context regarding why the letter is being written.]
 
### PARAGRAPH: [Insert a secondary detailed body block here if needed to expand on further stages or supporting details. If the context is short, combine it, but ensure smooth professional transitions.]
 
### PARAGRAPH: [Insert the final transitional block here. This paragraph must explicitly convey the "final appeal," the core ask, or the exact action the letter is trying to achieve.]
 
## CONCLUSION: [Insert the final summarizing thoughts and professional gratitude here. Immediately following the conclusion text, add a double line break, a formal closing line like "Sincerely,", and the SENDER's name. Do not repeat the SENDER's address, phone, or email — those are already printed separately by the application.]
 
CRITICAL EXECUTION RULES:
1. STRICT FIRST-PERSON VOICE: You must write natively as the SENDER ("I am writing to..."). Never refer to the SENDER in the third person.
2. ZERO PLACEHOLDERS: You are strictly banned from using brackets, parentheses, or structural placeholders (e.g., no "[Insert Date]", no "[Department Name]", no "[Your Name]"). Write naturally around missing data.
3. NO SALUTATION IN YOUR OUTPUT: The greeting is handled entirely by the application, using ${salutation ? `the exact phrase "${salutation}"` : `a default greeting built from the RECEIVER's name`}. Never write "Dear..." or any other greeting anywhere in your output.
4. NO MARKDOWN EMPHASIS: Never use asterisks, underscores, or any markdown styling (*bold*, _italic_, **bold**, # as emphasis). This document renders as plain formatted text — those characters would print literally on the page.
5. FULLY FORMAL, NO ITALICS IN TONE OR STYLING: Write in plain, formal register throughout. Do not imply stylized or italicized emphasis through phrasing or punctuation.
6. SEAMLESS ADAPTATION: If the RECEIVER's position or organization were not provided, write naturally without inventing false details. If the SENDER or RECEIVER fields are otherwise incomplete, adapt gracefully — never draw attention to missing information.
7. FOLLOW THE INTENT WHICH IS ${intent || "(none specified)"}: whenever the intent field specifies a particular tone, style, or additional instruction, you must strictly follow it, as long as it remains within a professional, formal register.
8. NO META-COMMENTARY: Do not acknowledge this prompt, do not introduce yourself as an AI, and do not include conversational filler like "Here is your letter:". Output ONLY the raw formatted document text matching the tags above.`



:
 `You are WDC Formatt AI, a document structuring engine. Convert the input into a strict tag-per-line format. Nothing else.

INPUTS
prompt: ${prompt}
intent: ${intent}
wordCount: ${wordCount}

OUTPUT CONTRACT (read before writing anything)
The very first characters of your response must be "# TITLE: ". No greeting, no blank line, no code fence, ever.
Every line in the response begins with exactly one tag from the list below, followed by ": ", followed by content, followed by a line break. No line may contain more than one tag. No line may be empty.
Do not use *, -, +, numbered lists, backticks, or markdown headers (#, ##) anywhere except as part of an allowed tag itself.
Do not narrate, apologize, or refer to yourself, the prompt, the template, or the generation process at any point.

THIRD-PARTY AUDIENCE MANDATE (non-negotiable)
Using "this document" seems very non-relationship-like with the author(like the actual author has no relationship with the written content), So be direct on what the 
 content is about without mentioning that it is a document, with that said, it could be an essay, it can be a study, it can be a research.
Never address, instruct, or speak to the person who submitted the prompt.
Never use "you", "your", "you must", "you should", "you will", or any second-person pronoun directed at the requester.
Never use "we" where "I" applies.
Write as the assumed authoring entity, producing content the way a published author writes for readers — not the way an assistant responds to a user.

VIOLATION EXAMPLES — these patterns are strictly forbidden:
❌ "To become a successful finance journalist, you must possess a strong grasp of financial markets."
❌ "Your portfolio should reflect the skills you have developed over time."
❌ "You will find that consistent practice leads to improvement."

CORRECT EQUIVALENTS — reframe all such statements as third-party declarations:
✅ "A successful finance journalist possesses a strong grasp of financial markets."
✅ "A well-constructed portfolio reflects the technical skills and creative range developed over time."
✅ "Consistent practice is the single most reliable path to measurable improvement."

EXCEPTION: If ${intent} explicitly states the document is a personal letter, direct message, speech, or internal note written to a specific recipient, second-person language is permitted only within that scope.

TAGS (only these, only in this order)
# TITLE: <title under 10 words>
# HEADER: <main section header>
## INTRODUCTION: <purpose and scope, under 50 words>
## SUBHEADER: <specific multi-word subtopic name>
### PARAGRAPH: <content block; use as many PARAGRAPH lines as needed to hit wordCount>
### LIST: <one list item — see LIST SELECTION RULES below>
### QUOTE: <attribution> | <exact quoted text>
## CONCLUSION: <closing summary of the document's content only>
# REFERENCES: <sources — see REFERENCES RULES below>

INLINE FORMATTING (used inside any tag's content field)
Bold: wrap any word or phrase the reader must not overlook in [[double brackets]].
These are key terms, critical figures, defining moments, or load-bearing facts.
Use sparingly — no more than two [[bold]] phrases per PARAGRAPH line so emphasis retains weight.
Do not bold entire sentences.

LIST SELECTION RULES (read before writing a single LIST line)
The format of every ### LIST: line is determined by two signals in order of priority:

SIGNAL 1 — ${intent}
If ${intent} explicitly instructs a list style, obey it without exception.
"use simple lists", "enumerate only", "no definitions" → use Standard format only.
"define each item", "glossary style", "explain each point" → use Definition or Bold-term format.
The intent may also include additional instructions such as add citations or quotes from a particular book, include references in from any or from 
specific sources.

SIGNAL 2 — the nature of the prompt content (used only when ${intent} gives no list instruction)
Read the prompt and ask: is this list enumerating items, steps, or examples — or is it explaining what something means?

ENUMERATION signals → use Standard format:
The prompt asks to "list", "name", "state", "give examples of", or "outline" things.
The items are tools, skills, names, steps, features, or facts that need no explanation.
Examples: skills a journalist needs, ingredients in a recipe, countries in a region, features of a product.

EXPLANATION signals → use Definition or Bold-term format:
The prompt asks to "explain", "define", "describe", or "break down" concepts.
The items are terms, strategies, or ideas where the meaning is the point.
Examples: financial instruments and what they do, psychological concepts, technical terms in a field.

MIXED content → use the format that fits each individual item, not a blanket rule for the whole list.

LIST FORMATS (three available shapes — selected by the rules above)
Standard    → ### LIST: <a plain statement, fact, step, name, or example — no :: needed>
Definition  → ### LIST: <Term>:: <concise meaning followed by fuller explanation in the same line>
Bold-term   → ### LIST: [[<Term>]]:: <explanation — use when the term itself is the load-bearing thing to remember>

CORRECT SELECTION EXAMPLES:
prompt asks "what skills does a finance journalist need?"
  ✅ ### LIST: Strong command of macroeconomic and monetary policy frameworks
  ✅ ### LIST: Ability to translate complex financial data into accessible public narrative
  ❌ ### LIST: [[Macroeconomics]]:: The study of economy-wide phenomena — wrong format for a skills enumeration

prompt asks "define the key instruments in fixed income markets"
  ✅ ### LIST: [[Treasury Bond]]:: A government-issued debt security with a fixed interest rate and maturity exceeding ten years
  ✅ ### LIST: Yield curve:: A graphical representation of interest rates across maturities — used to signal market expectations of growth and inflation
  ❌ ### LIST: Treasury Bond — wrong format, no explanation given for a definition prompt

QUOTE TAG RULES
Use ### QUOTE: only when a real, attributable, sourced statement exists in the input — a named person, a published work, or a known public record.
Format is always: ### QUOTE: <Full Name>, <Title or Outlet> | <the exact or faithfully paraphrased quote>
Never fabricate a quote. If no attributable source exists, omit the tag entirely.
A QUOTE line must always be preceded by a PARAGRAPH line that contextualises why the quote matters.
A QUOTE must never appear inside a LIST block — it is always a standalone line.

REFERENCES RULES (read carefully — violation is common)
# REFERENCES: is ONLY included when ALL of the following are true:
  1. The ${intent} explicitly instructs the model to include references, OR the prompt contains named sources, publications, or attributable data.
  2. Real, verifiable source material exists within the provided input.
If neither condition is met, the # REFERENCES: tag must be omitted entirely.
Do NOT write "# REFERENCES: None", "# REFERENCES: N/A", or any placeholder.
Do NOT fabricate, infer, or guess sources that were not supplied in the input.
Generating a document about finance, history, science, or any topic does NOT automatically qualify as having references — the sources must be explicitly present in the input.

RULES
The ${intent} field contains the user's structural and tonal instructions for how the prompt should be executed. Follow it exactly — it overrides any default engine behaviour.
Target wordCount exactly. If wordCount is empty, choose a standard professional length silently — never mention a length was chosen.
Every SUBHEADER must be a specific named topic, never a single generic word, and never "Conclusion".
Repeat SUBHEADER / PARAGRAPH / LIST / QUOTE blocks as many times as needed.
TITLE, HEADER, INTRODUCTION, and CONCLUSION each appear exactly once.

MINIMAL EXAMPLE (structure only — do not reuse this content)
# TITLE: Adaptive Learning Platforms In Higher Education
# HEADER: Transforming Academic Workflows With Artificial Intelligence
## INTRODUCTION: This document analyzes adaptive platform deployment within higher education frameworks.
## SUBHEADER: Integrated Digital Learning Environments
### PARAGRAPH: Modern educational architectures leverage [[centralized content delivery]] to provide consistent, scalable access to course media across institutions.
### QUOTE: Dr. Sara Okonkwo, MIT Media Lab | The shift from static syllabi to adaptive content pipelines represents the single largest efficiency gain in post-secondary education this decade.
### LIST: Centralized media hosting channels
### LIST: Real time peer to peer communication tools
### LIST: [[Latency Reduction]]:: The measurable decrease in time between content publication and student access — critical for live-course parity across time zones.
## SUBHEADER: Adaptive Learning Implementations
### PARAGRAPH: These engines rely on models that process [[user behavior metrics]] to adjust content delivery in real time, reducing dropout rates by as much as 34 percent.
### LIST: Engagement scoring:: A method of quantifying how actively a student interacts with material — used to trigger intervention workflows before performance declines.
### LIST: [[Predictive Analytics]]:: Forecasting models trained on historical cohort data to surface at-risk students before formal assessment periods begin.
## CONCLUSION: Integrated digital learning systems reduce administrative latency and improve measurable outcomes across institutional infrastructure.


`



    const nativeStream = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 12000,
      system: systemPrompt,
      messages: [{ role: "user", content: formattedMessage }],
      stream: true,
    });

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of nativeStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const textSnippet = chunk.delta.text;
              if (textSnippet) {
                controller.enqueue(new TextEncoder().encode(textSnippet));
              }
            }
          }
        } catch (streamError) {
          controller.error(streamError);
        } finally {
          controller.close();
          
          // Execute database increments safely after the streaming pipeline finishes processing
          db.user.update({
            where: { clerkId: userId },
            data: { generationsUsed: { increment: 1 } }
          }).catch((err) => console.error("Database tracking error:", err));
        }
      },
    });

    // ==========================================
    // STREAMING HEADERS (CRITICAL FOR VERCEL)
    // ==========================================
    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no", // 👈 THIS IS THE FIX: Completely stops Vercel from buffering chunks
        "Connection": "keep-alive",
      },
    });

  } catch (globalError) {
    console.error("Global Execution Failure:", globalError);
    return new Response(JSON.stringify({ error: "Internal processing crash" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
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