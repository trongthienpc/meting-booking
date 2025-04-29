import { PrismaClient } from "../generated/prisma";
declare global {
  // eslint-disable-next-line
  var cachedPrisma: PrismaClient;
}

export let db: PrismaClient;

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }

  db = global.cachedPrisma;
}
