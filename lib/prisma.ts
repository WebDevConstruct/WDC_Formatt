import { PrismaClient } from "@prisma/client";
 import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from "better-sqlite3";

const globalForPrisma = globalThis as unknown  as {
    prisma : PrismaClient | undefined
}


const db_ = ()=> {
    const sqlite = new Database("./prisma/dev.db");
    const adapter = new PrismaBetterSqlite3(sqlite);
    return new PrismaClient({adapter});
}
export const db =  globalForPrisma.prisma ??db_();
if(process.env.NODE_ENV !== "production"){
    globalForPrisma.prisma = db
}