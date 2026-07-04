import { db } from "@/lib/prisma";
import { compilePDF,} from "@/lib/utils/pdf-engine/compile";
import { PDFTemplateConfigType } from "@/scripts/templatetypes";

import { FontSizes } from "@/lib/utils/pdf-engine/types";
export async function POST(req : Request){
    const {body} = await req.json();
    //FETCH THE DEPENDENT VARIABLES (THE TEMPLATE)
    const {userInput, templateName, contentBlock} = body;
   // console.log("Received request with body:", body);
    const [template] = await Promise.all([
        db.pDFTemplate.findUnique({ 
            where : {name : templateName}
        })
    ])
    console.log(template);

        if(!template){
             return new Response("Error: Missing data", {
            status : 404
        });
    }

    const data =(userInput?.assignment_title || "ASSIGNMENT")?.replace(/[^a-z0-9]/gi, '_');
        //Generate the PDF binary

        const Config = template.config as unknown as PDFTemplateConfigType;
     //   console.log(Config);
   //const Value = template.config as unknown as PDFTemplateConfigFontType;
        const pdfBytes =await  compilePDF(Config , userInput, contentBlock);
      return new Response(Buffer.from(pdfBytes), {
        status : 200, 
      headers : {
        "Content-Type" : "application/pdf",
        "Content-Disposition": `attachment; filename=${data}.pdf`,
    "Content-Length": pdfBytes.byteLength.toString(),
      }
      })
    

}