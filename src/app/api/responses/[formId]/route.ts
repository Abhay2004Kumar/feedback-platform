import { connectDB } from "@/lib/db";
import Response from "@/models/Response";
import { Document, Types } from 'mongoose';
import { NextRequest, NextResponse } from "next/server";

// Interface for the response answer
interface ResponseAnswer {
  questionId: string;
  answer: string | string[];
}

// Interface for the MongoDB document
interface IResponse extends Document {
  _id: Types.ObjectId;
  formId: Types.ObjectId;
  answers: ResponseAnswer[];
  submittedAt: Date;
}

// Interface for the transformed response data
interface ResponseData {
  _id: string;
  formId: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
  submittedAt: string;
}

export async function GET(
  request: NextRequest,
  context: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<NextResponse> {
  try {
    const { formId } = context.params;

    if (!formId) {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const responses = await Response.find({ formId })
      .sort({ submittedAt: -1 })
      .lean<IResponse[]>();

    const formattedResponses: ResponseData[] = responses.map((response) => ({
      _id: response._id.toString(),
      formId: response.formId.toString(),
      answers: response.answers.map((answer) => ({
        questionId: answer.questionId,
        answer: answer.answer,
      })),
      submittedAt: new Date(response.submittedAt).toISOString(),
    }));

    return NextResponse.json(formattedResponses);
  } catch (error: unknown) {
    console.error("Error fetching responses:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { error: "Failed to fetch responses", details: errorMessage },
      { status: 500 }
    );
  }
}
