# WDC_Formatt
This code repository was created by the developers of WebDevConstruct aiming to help foster student research and academic productivity. 

TECH STACK:
NEXTJS: We leverage Next router for the calling of apis.
VERCEL: VERCEL has been used for deployment and In terms it infrastructure we use the VERCEL_AI_GATEWAY which provides variant of LLMs.
CLOUDFLARE: We leverage Cloudflare workers for document embeddings into the vectorize database (Ingestions), and the Cloudflare AI SEARCH for RAG to personalize and customize users responses according to both system response and the right 
PRISMA: Object relations manager
NEON: For users signed up and generations made.
CLERK: For user authentication

FEATURES:
QUICK RESEARCH: This feature was created built on top of perplexity/sonar to help remove formatting barriers and be in more control of document editing.
CORE IN THE FEATURE SYSTEM are the PDF Engine, template generator, and the PDF download.

1. PDF ENGINE: This engine created to help create a well-formatted and professional documents such as indents for paragraphs, boldness in titles, font sizes, and other text formatting. It also uses text-parsing to assign roles to texts in the documents.
2. THE USE OF LLM”s: We leverage LLM to stream responses based already system prompt which helps format it response and reduces the LLM from diversion.

 3. The template generator: This was created to create and update document file structure to ensure consistency and server based document formatting, using NEON. 
 4. The PDF download which takes the necessary inputs and converts them into binary to help for better file, content and document download.


==================••• THE NEXT IDEA ===========

CORE IDEA: This is created to give users more contexts regarding academic literature and curb the challenges users have with reading wrong resources, giving more contextualized responses from academic sessions recommended literatures and contents. 

1. CLOUDFLARE S2 Object storage: The use of Cloudflare buckets to upload documents relevant to the user
2. VECTORIZE DATABASE:The use of Cloudflare worker to store numbered vectors and index documents divisible by chunks to provide contexts to the application.
3. AI SEARCH: We leverage the Cloudflare AISearch library to fetch using prompts that match any relevant literature to the user, then we use another LLM to broaden user understanding for that feature.
4. TEXT SEARCH: This can Also be relevant for a quick literature page search without opening a 1,000 page PDF.





