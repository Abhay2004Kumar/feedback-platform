"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Using standard HTML elements instead of custom components

interface Question {
  _id: string;
  type: 'text' | 'select' | 'multiple';
  question: string;
  options?: string[];
  required?: boolean;
}

interface FormData {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export default function PublicFormPage() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<FormData | null>(null);
  const [answers, setAnswers] = useState<(string | string[])[]>([]);

  useEffect(() => {
    const fetchForm = async () => {
      const res = await fetch(`/api/forms/${formId}`);
      const data = await res.json();
      setForm(data);
      setAnswers(new Array(data.questions.length).fill(""));
    };

    fetchForm();
  }, [formId]);

  const handleAnswerChange = (index: number, value: string | string[]) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (!form) return;
    
    try {
      // Map answers to include question IDs
      const formattedAnswers = form.questions.map((question, index) => ({
        questionId: question._id,
        answer: answers[index] || ""
      }));

      const res = await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          formId, 
          answers: formattedAnswers 
        }),
      });

      if (res.ok) {
        window.location.href = `/forms/${formId}/thank-you`;
      } else {
        const error = await res.json();
        alert(`Submission failed: ${error.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form. Please try again.');
    }
  };

  if (!form) return <div className="max-w-2xl mx-auto py-10 px-4">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">{form.title}</h1>

      {form.questions.map((q, i) => (
        <div key={i} className="mb-6">
          <p className="font-semibold mb-2">
            {i + 1}. {q.question}
          </p>
          {q.type === "text" ? (
            <textarea
              value={answers[i] as string || ""}
              onChange={(e) => handleAnswerChange(i, e.target.value)}
              className="w-full p-2 border rounded-md min-h-[100px]"
            />
          ) : q.type === "select" ? (
            <select
              value={answers[i] as string || ""}
              onChange={(e) => handleAnswerChange(i, e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select an option</option>
              {q.options?.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            q.options?.map((opt, j) => (
              <label key={j} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <input
                  type="radio"
                  name={`q-${i}`}
                  value={opt}
                  checked={answers[i] === opt}
                  onChange={() => handleAnswerChange(i, opt)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span>{opt}</span>
              </label>
            ))
          )}
        </div>
      ))}

      <Button onClick={handleSubmit}>Submit Feedback</Button>
    </div>
  );
}
