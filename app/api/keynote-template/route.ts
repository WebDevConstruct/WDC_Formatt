import { db } from "@/lib/prisma";
import { compileKeynotePDF} from "@/lib/pdfEngine";

export async function POST(req : Request){
    const {userInput, templateName, slideTheme} = await req.json();
    //FETCH THE DEPENDENT VARIABLES (THE TEMPLATE)
    const [template] = await Promise.all([
        db.pDFTemplate.findUnique({
            where : {name : templateName}
        })
    ])
const {headline} = userInput?.presentation?.sections[0] || ""
        if(!template){
             return new Response("Error: Missing data", {
            status : 404
        });
    }
        //Generate the PDF binary
     //   const typedAssertionConfig = template.config as unknown as PDFTemplateConfigType
        const pdfBytes = await compileKeynotePDF(userInput, slideTheme);
      return new Response(Buffer.from(pdfBytes), {
        status : 200, 
      headers : {
        "Content-Type" : "application/pdf",
        "Content-Disposition": `attachment; filename=${headline || "Keynotes"}.pdf`,
    "Content-Length": pdfBytes.length.toString(),
      }
      })
    

}