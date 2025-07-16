import { connectDB } from "@/lib/db";
import Response from "@/models/Response";
import { NextRequest, NextResponse } from "next/server";
// Clear the model cache to prevent overwrite issues
import mongoose from 'mongoose';

const clearModelCache = (modelName: string) => {
  const modelNames = mongoose?.models ? Object.keys(mongoose.models) : [];
  if (modelNames.includes(modelName)) {
    delete mongoose.models[modelName as keyof typeof mongoose.models];
  }
};

clearModelCache('Response');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, answers } = body;

    if (!formId) {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Answers must be an array" },
        { status: 400 }
      );
    }

    // Validate each answer has the required fields
    for (const answer of answers) {
      if (!answer.questionId || answer.answer === undefined) {
        return NextResponse.json(
          { error: "Each answer must have a questionId and answer" },
          { status: 400 }
        );
      }
    }

    await connectDB();

    // Create response with properly structured answers
    const response = new Response({
      formId,
      answers: answers.map(a => ({
        questionId: a.questionId,
        answer: a.answer
      })),
      submittedAt: new Date(),
    });

    const savedResponse = await response.save();

    return NextResponse.json(
      { 
        message: "Response submitted successfully", 
        response: savedResponse 
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error submitting response:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        error: "Failed to submit response",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
