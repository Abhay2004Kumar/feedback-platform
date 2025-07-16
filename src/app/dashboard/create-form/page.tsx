"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
type QuestionType = 'text' | 'select' | 'multiple';

interface Question {
  _id?: string;
  question: string;
  type: QuestionType;
  options: string[];
  required?: boolean;
}

export default function CreateForm() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", type: "text", options: [] },
  ]);
  const router = useRouter();

  const handleAddQuestion = () => {
    const newQuestion: Question = { 
      question: "", 
      type: "text", 
      options: [] 
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleChange = (i: number, key: keyof Question, value: string) => {
    setQuestions(prevQs => {
      const newQs = [...prevQs];
      // If changing question type, reset options if switching to text
      if (key === 'type' && value === 'text') {
        newQs[i] = { ...newQs[i], [key]: value, options: [] };
      } else {
        newQs[i] = { ...newQs[i], [key]: value };
      }
      return newQs;
    });
  };

  const handleOptionChange = (i: number, j: number, value: string) => {
    setQuestions(prevQs => {
      const newQs = [...prevQs];
      const newOptions = [...newQs[i].options];
      newOptions[j] = value;
      newQs[i] = { ...newQs[i], options: newOptions };
      return newQs;
    });
  };

  const addOption = (i: number) => {
    setQuestions(prevQs => {
      const newQs = [...prevQs];
      const currentOptions = newQs[i].options || [];
      newQs[i] = {
        ...newQs[i],
        options: [...currentOptions, ""]
      };
      return newQs;
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to create a form");
        router.push("/login");
        return;
      }

      // Validate form
      if (!title.trim()) {
        alert("Please enter a form title");
        return;
      }

      const hasInvalidQuestions = questions.some(q => {
        // Check if question text is empty
        if (!q.question.trim()) return true;
        
        // For multiple choice questions, check if there are at least 2 options
        if (q.type === 'multiple') {
          if (q.options.length < 2) return true;
          if (q.options.some(opt => !opt.trim())) return true;
        }
        
        return false;
      });

      if (hasInvalidQuestions) {
        alert("Please fill in all questions and options");
        return;
      }

      const res = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, questions }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Form created successfully!");
        router.push("/dashboard");
      } else {
        throw new Error(data.message || "Failed to create form");
      }
    } catch (error) {
      console.error("Error creating form:", error);
      alert(error instanceof Error ? error.message : "An error occurred while creating the form");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Create Feedback Form</h1>

      <Label>Form Title</Label>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-6" />

      {questions.map((q, i) => (
        <div key={i} className="border p-4 mb-4 rounded-xl shadow-sm">
          <Label>Question {i + 1}</Label>
          <Textarea
            value={q.question}
            onChange={(e) => handleChange(i, "question", e.target.value)}
            className="mb-2"
          />
          <Label>Type</Label>
          <div className="mb-2">
            <select
              value={q.type}
              onChange={(e) => handleChange(i, "type", e.target.value as QuestionType)}
              className="w-full p-2 rounded-md border"
            >
              <option value="text">Text Input</option>
              <option value="multiple">Multiple Choice</option>
            </select>
            {q.type === 'text' && (
              <p className="text-xs text-gray-500 mt-1">Respondents will see a text input field</p>
            )}
          </div>

          {q.type === "multiple" &&
            q.options.map((opt, j) => (
              <Input
                key={j}
                placeholder={`Option ${j + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(i, j, e.target.value)}
                className="mb-2"
              />
            ))}

          {q.type === "multiple" && (
            <Button type="button" onClick={() => addOption(i)} size="sm">
              + Add Option
            </Button>
          )}
        </div>
      ))}

      <div className="flex gap-4 mt-4">
        <Button onClick={handleAddQuestion}>+ Add Question</Button>
        <Button onClick={handleSubmit}>Create Form</Button>
      </div>
    </div>
  );
}
