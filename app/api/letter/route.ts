import { db } from "@/lib/prisma";
import { compileLetterPDF,} from "@/lib/pdfEngine";
import {LetterDataConfigType } from "@/lib/pdfEngine";
export async function POST(req : Request){
    const body = await req.json();
    //FETCH THE DEPENDENT VARIABLES (THE TEMPLATE)
    const {sender_name, recipient_name, templateName} = body;
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
    const data =(sender_name || "ASSIGNMENT")?.replace(/[^a-z0-9]/gi, '_');
       
      const Config = body as unknown as LetterDataConfigType
        const pdfBytes = await compileLetterPDF(Config);
      return new Response(Buffer.from(pdfBytes), {
        status : 200, 
      headers : {
        "Content-Type" : "application/pdf",
        "Content-Disposition": `attachment; filename=${data}.pdf`,
    "Content-Length": pdfBytes.byteLength.toString(),
      }
      })
    

}