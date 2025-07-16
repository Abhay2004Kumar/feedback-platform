import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Response from "@/models/Response";

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { formId, answers } = body;

  if (!formId || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await Response.create({ formId, answers });
  return NextResponse.json({ message: "Feedback submitted" });
}
