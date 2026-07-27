import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { connectDb } from "@/lib/db";
import { UserModel } from "@/lib/models";

export async function POST(request: Request) {
  const payload = await request.json();
  const name = String(payload?.name || "").trim();
  const email = String(payload?.email || "").trim().toLowerCase();
  const password = String(payload?.password || "");

  if (!name || !email || password.length < 6) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  await connectDb();
  const exists = await UserModel.findOne({ email }).lean();

  if (exists) {
    return NextResponse.json({ error: "Email ya registrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    id: nanoid(10),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}
