"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

interface Response {
  _id: string;
  formId: string;
  answers: (string | string[])[];
  createdAt: string;
  updatedAt: string;
}

export default function FormResponsesPage() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const f = await fetch(`/api/forms/${formId}`);
      const r = await fetch(`/api/responses/${formId}`);

      setForm(await f.json());
      setResponses(await r.json());
    };
    fetchData();
  }, [formId]);

  if (!form) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">{form.title}</h2>

      <h3 className="text-lg font-semibold mt-8 mb-2">Summary</h3>
      {form.questions.map((q, i) => (
        <div key={q._id} className="mb-4">
          <p className="font-medium">{q.question}</p>
          {q.type === "multiple" && q.options ? (
            q.options.map((opt, j) => {
              const count = responses.filter(res => 
                Array.isArray(res.answers[i]) 
                  ? (res.answers[i] as string[]).includes(opt)
                  : res.answers[i] === opt
              ).length;
              return (
                <div key={`${i}-${j}`} className="text-sm pl-4">
                  {opt}: {count} vote(s)
                </div>
              );
            })
          ) : (
            <ul className="text-sm pl-4 list-disc">
              {responses.map((res, idx) => {
                const answer = res.answers[i];
                const answerText = Array.isArray(answer) ? answer.join(', ') : String(answer);
                return <li key={idx}>{answerText || 'No response'}</li>;
              })}
            </ul>
          )}
        </div>
      ))}

      <h3 className="text-lg font-semibold mt-8 mb-2">Raw Responses</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead>
            <tr>
              <th className="border px-2 py-1">#</th>
              {form.questions.map((q, i) => (
                <th key={q._id} className="border px-2 py-1">
                  Q{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((res, i) => (
              <tr key={res._id}>
                <td className="border px-2 py-1 font-mono text-xs">{i + 1}</td>
                {res.answers.map((ans, j) => {
                  const answerText = Array.isArray(ans) ? ans.join(', ') : String(ans);
                  return (
                    <td key={`${i}-${j}`} className="border px-2 py-1">
                      {answerText || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
