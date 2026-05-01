import { db } from "@/lib/prisma";
import { compilePDF,} from "@/lib/pdfEngine";

export async function POST(req : Request){
    const {userInput, templateName} = await req.json();
    //FETCH THE DEPENDENT VARIABLES (THE TEMPLATE)
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
        //Generate the PDF binary
     //   const typedAssertionConfig = template.config as unknown as PDFTemplateConfigType
        const pdfBytes = await compilePDF(userInput);
      return new Response(Buffer.from(pdfBytes), {
        status : 200, 
      headers : {
        "Content-Type" : "application/json",
        "Content-Disposition": 'attachment; filename="Assignment.pdf"',
    "Content-Length": pdfBytes.length.toString(),
      }
      })
    

}