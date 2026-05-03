import { db } from "@/lib/prisma";
import { compileKeynotePDF} from "@/lib/pdfEngine";

export async function POST(req : Request){
    const {userInput, templateName, slideTheme} = await req.json();
  //  console.log("userInput:", userInput);
    //FETCH THE DEPENDENT VARIABLES (THE TEMPLATE)
    const [template] = await Promise.all([
        db.pDFTemplate.findUnique({
            where : {name : templateName}
        })
    ])
const headline = (userInput?.topic || "KeyNotes")?.replace(/[^a-z0-9]/gi, '_') 
        if(!template){
             return new Response("Error: Missing data", {
            status : 404
        });
    }
        //Generate the PDF binary
     //   const typedAssertionConfig = template.config as unknown as PDFTemplateConfigType
    //  const presentation = userInput || {}
        const pdfBytes = await compileKeynotePDF(userInput, slideTheme);
      return new Response(Buffer.from(pdfBytes), {
        status : 200, 
      headers : {
        "Content-Type" : "application/pdf",
        "Content-Disposition": `attachment; filename=${headline}.pdf`,
    "Content-Length": pdfBytes.byteLength.toString(),
      }
      })
    

}