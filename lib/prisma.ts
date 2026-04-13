// lib/db.ts
import { PrismaClient } from "@/generated/prisma";
import {PrismaNeon} from "@prisma/adapter-neon"



let Prisma : PrismaClient


export function getPrisma(){

  if(!Prisma){
const connectionString = process.env.DATABASE_URL || "";
//const neonPool = new Pool({connectionString})

//Adapter necessary for the Edge Functions
//Adapters are the awakening of the developers who wishes to deploy
//their applocation in my at this momeny of writing in netlify, the adapter must be created
//to create a light HTTPs-based driver. When we run on our lovalgost, the prisma connrction
//to neon us successful because prisma connects through a Nodejs library
  const adapter = new PrismaNeon({
    connectionString : connectionString,
    ssl : {rejectUnauthorized : false}
  })

return Prisma = new PrismaClient({adapter})
  }
  return Prisma;
}

export const db = getPrisma()
// const globalForPrisma = globalThis as unknown  as {
//     prisma : PrismaClient | undefined
// }



// export const db =  globalForPrisma.prisma || new PrismaClient();
// if(process.env.NODE_ENV !== "production"){
//     globalForPrisma.prisma = db
// }