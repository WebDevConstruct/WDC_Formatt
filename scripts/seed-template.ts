import { PrismaClient } from "@/generated/prisma";
import pg from "pg";
 import {PrismaPg} from "@prisma/adapter-pg"
import * as dotenv from "dotenv"




//Template for Academic assigment
const assignmentTemplate = {
        layout : {
            pagesize : "A4", orientation : "potrait"
        },
        dimensions : {width : 595.28, height : 841.89},
        placeholders : [
            {
                varName : "assignment_title",
                type : "header",
                x : 50,
                y : 800,
                fontSize : 22,
                isBold : true,
                fontFamily :  "Helvetica-Bold"
            },
            {
                varname : "student_name",
                type : "subheader",
                x  : 50,
                y : 770,
                fontSize : 14,
                isBold : false,
                fontFamily : "Helvetica"
            },
            {
                varName : "body_content",
                type : "paragraph",
                x : 50,
                y : 730,
                fontSize : 11,
                lineHeights : 15,
                maxWidth : 495,
                fontFamily : "Helvetica"
            },
              {
                varName : "lists",
                type : "paragraph",
                x : 50,
                y : 730,
                fontSize : 11,
                lineHeights : 15,
                maxWidth : 495,
                fontFamily : "Helvetica"
            },
            {
                varname : "references",
                type : "paragraph",
                x : 50,
                y : 100,//Fixed at the Bottom
                fontSize : 9,
                isBold : false,
                fontFamily : "Helverica-Oblique"
            }
        ]
    }

    //Slides For KeyNotes
    export const KeyNoteTemplateConfig = {
 
    layout: { 
      pageSize: "A4", 
      orientation: "landscape" 
    },
    dimensions: { 
      width: 841.89, 
      height: 595.28 
    },
    placeholders: [
      {
        varName: "section_header",
        type: "subheader",
        x: 60,
        y: 535,
        fontSize: 14,
        isBold: true,
        color: "secondary", // Syncing Red
        fontFamily: "Helvetica-Bold"
      },
      {
        varName: "headline",
        type: "header",
        x: 60,
        y: 470,
        fontSize: 42,
        isBold: true,
        color: "primary", // Majestic Brown
        fontFamily: "Helvetica-Bold",
        maxWidth: 440 // Calculated for Split layout
      },
      {
        varName: "subheader",
        type: "subheader",
        x: 60,
        y: 410,
        fontSize: 16,
        isBold: true,
        color: "secondary", // Syncing Red
        fontFamily: "Helvetica-Bold"
      },
      {
        varName: "paragraph",
        type: "paragraph",
        x: 60,
        y: 380,
        fontSize: 14,
        lineHeight: 24,
        color: "primary", // Majestic Brown
        fontFamily: "Helvetica",
        maxWidth: 440
      },
      {
        varName: "slide_image",
        type: "image",
        x: 540,
        y: 60,
        width: 240,
        height: 480 // Vertical WDC asset slot
      }
    ]
  }

    //Updates Academic assignment
const UpdatedAcademicAssigmentTemplate = {
        layout: { pageSize: 'A4', orientation: 'portrait' },
        dimensions: { width: 595.28, height: 841.89 },
        placeholders: [
          // Header & Student Info
          { varName: "assignment_title", type: "header", x: 50, y: 780, fontSize: 20, isBold: true, fontFamily: "Helvetica-Bold" },
          { varName: "student_name", type: "subheader", x: 50, y: 755, fontSize: 12, isBold: true, fontFamily: "Helvetica-Bold" },

          // Section 1: Introduction
          { varName: "intro_title", type: "subheader", x: 50, y: 720, fontSize: 13, isBold: true, fontFamily: "Helvetica-Bold" },
          { varName: "intro_content", type: "paragraph", x: 50, y: 705, fontSize: 11, lineHeights: 14, maxWidth: 495, fontFamily: "Helvetica" },
// LISTS
 { varName: "lists", type: "paragraph", x: 50, y: 705, fontSize: 11, lineHeights: 14, maxWidth: 495, fontFamily: "Helvetica" },
  { varName: "recipientName", type: "paragraph", x: 50, y: 205, fontSize: 11, lineHeights: 14, maxWidth: 495, fontFamily: "Helvetica" },
          // // Section 2: Methodology
          // { varName: "method_title", type: "subheader", x: 50, y: 580, fontSize: 13, isBold: true, fontFamily: "Helvetica-Bold" },
          // { varName: "method_content", type: "paragraph", x: 50, y: 565, fontSize: 11, lineHeights: 14, maxWidth: 495, fontFamily: "Helvetica" },

          // Section 3: Analysis
          { varName: "body_title", type: "subheader", x: 50, y: 420, fontSize: 13, isBold: true, fontFamily: "Helvetica-Bold" },
          { varName: "body_content", type: "paragraph", x: 50, y: 405, fontSize: 11, lineHeights: 14, maxWidth: 495, fontFamily: "Helvetica" },

          // Section 4: Conclusion
          { varName: "concl_title", type: "subheader", x: 50, y: 220, fontSize: 13, isBold: true, fontFamily: "Helvetica-Bold" },
          { varName: "concl_content", type: "paragraph", x: 50, y: 205, fontSize: 11, lineHeights: 14, maxWidth: 495, fontFamily: "Helvetica" },
           { varName: "reference", type: "paragraph", x: 50, y: 205, fontSize: 11, lineHeights: 14, maxWidth: 495, fontFamily: "Helvetica" },
      //   { varName: "", type: "paragraph", x: 50, y: 205, fontSize: 11, lineHeights: 14, maxWidth: 495, fontFamily: "Helvetica" }
        ]
      }

const templateUpserts = [
  {id : "", name : "ACADEMIC_ASSIGNMENT", config : assignmentTemplate, description :  "Standard layout for student research assignemnt", updatedConfig :  UpdatedAcademicAssigmentTemplate},
  {id : "", name : "Slides_Template", config : KeyNoteTemplateConfig, description : "A template to generate Slides"}
]


//const {config} = updatesTemplate





dotenv.config()

if(!process.env.DATABASE_URL){
    throw new Error("DATABASE_URL is not defined in your .env file")
}
//Create a standard TCP connection String
const pool = new pg.Pool({connectionString : process.env.DATABASE_URL});
//Creating an adapter for TCP connection (separate from Neon Serverless)
 const adapter = new PrismaPg(pool);
 //Passing the adapter into the Prisma Client as required by Prisma requires it
 const prisma = new PrismaClient({adapter})
async function main(){
    
   for(const  template of templateUpserts){
    await prisma.pDFTemplate.upsert({
        where : {name : template?.name},
        update : {
      config: template?.updatedConfig,
    },
        create : {
            name : template?.name,
            description : template?.description ,
            config : template?.config
        }
    })
  }
  console.log("✅ Assignment template pushed to Neon.");

}
main().catch((e)=> {
console.error(e)
}).finally(async()=> {
await prisma?.$disconnect();
await pool?.end()
})


//KEYNOTE TEMPLATE CONFIG SEED
// Your Neon/Prisma/Drizzle instance

// export async function upsertKeyNoteTemplate() {
//   try {
//     const result = await prisma.pDFTemplate.upsert({
//       where: { name : "Slides_Template" },
//       update: {
//         name: "Slides_Template",
//         config: KeyNoteTemplateConfig,
//       },
//       create: {
      
//         name: "Slides_Template",
//         config: KeyNoteTemplateConfig,
//         description : "A Template for generating slides"
//       },
//     });

//     console.log(`✅ ${result.name} synchronized to system.`);
//     return result;
//   } catch (error) {
//     console.error("Failed to upsert KeyNoteTemplateConfig:", error);
//     throw error;
//   }
// }