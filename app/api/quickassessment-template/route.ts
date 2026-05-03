import { db } from "@/lib/prisma";
import { compilePDF,} from "@/lib/pdfEngine";

export async function POST(req : Request){
    const {body} = await req.json();
    //FETCH THE DEPENDENT VARIABLES (THE TEMPLATE)
    const {userInput, templateName} = body;
   // console.log("Received request with body:", body);
    const [template] = await Promise.all([
        db.pDFTemplate.findUnique({
            where : {name : templateName}
        })
    ])

        if(!template){
             return new Response("Error: Missing data", {
            status : 404
        });
    }
    const data =(userInput?.assignment_title || "ASSIGNMENT")?.replace(/[^a-z0-9]/gi, '_');
        //Generate the PDF binary
     //   const typedAssertionConfig = template.config as unknown as PDFTemplateConfigType
        const pdfBytes = await compilePDF(userInput);
      return new Response(Buffer.from(pdfBytes), {
        status : 200, 
      headers : {
        "Content-Type" : "application/pdf",
        "Content-Disposition": `attachment; filename=${data}.pdf`,
    "Content-Length": pdfBytes.byteLength.toString(),
      }
      })
    

}