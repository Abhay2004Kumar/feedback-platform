import { connectDB } from "@/lib/db";
import Form from "@/models/Form";
import Response from "@/models/Response";
import jwt from "jsonwebtoken";
import { Types } from 'mongoose';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectDB();
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    interface DecodedToken {
      id: string;
      email: string;
      iat: number;
      exp: number;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const userId = decoded.id;

    // Define the form type
    interface FormType {
      _id: Types.ObjectId;
      title: string;
      createdAt: Date;
    }

    // Find all forms for the user
    const forms = await Form.find({ createdBy: userId })
      .select("title _id createdAt")
      .lean<FormType[]>();

    // Get response counts for each form
    const formsWithResponseCount = await Promise.all(
      forms.map(async (form: FormType) => {
        const responseCount = await Response.countDocuments({ formId: form._id });
        return {
          _id: form._id.toString(),
          title: form.title,
          createdAt: form.createdAt.toISOString(),
          responseCount
        };
      })
    );

    return NextResponse.json(formsWithResponseCount);
  } catch (error) {
    console.error('Error in admin forms API:', error);
    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}
