import mongoose from "mongoose";

declare global {
  var __mongoConn: { promise: Promise<typeof mongoose> | null; conn: typeof mongoose | null };
}

if (!globalThis.__mongoConn) {
  globalThis.__mongoConn = { promise: null, conn: null };
}

export async function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI no esta configurada en las variables de entorno.");
  }

  if (globalThis.__mongoConn.conn) {
    return globalThis.__mongoConn.conn;
  }

  if (!globalThis.__mongoConn.promise) {
    globalThis.__mongoConn.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  globalThis.__mongoConn.conn = await globalThis.__mongoConn.promise;
  return globalThis.__mongoConn.conn;
}
