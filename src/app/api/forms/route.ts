import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Form from "@/models/Form";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export async function POST(request: NextRequest) {
  await connectDB();
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    userId = decoded.id;
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const form = await Form.create({
      title: body.title,
      questions: body.questions,
      createdBy: userId,
    });
    
    // Return the form in the expected format for the dashboard
    return NextResponse.json({
      _id: form._id.toString(),
      formId: form._id.toString(), // For backward compatibility
      title: form.title,
      createdAt: form.createdAt.toISOString(),
      responseCount: 0 // New forms have 0 responses
    });
  } catch (error) {
    console.error('Error creating form:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create form', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  await connectDB();
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const forms = await Form.find({ createdBy: decoded.id }).select("title _id createdAt");
    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}
