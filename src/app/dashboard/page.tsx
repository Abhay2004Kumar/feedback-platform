"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Form {
  _id: string;
  title: string;
  createdAt: string;
  responseCount: number;
}

function DashboardContent() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, getAuthHeader } = useAuth();

  useEffect(() => {
    const fetchForms = async () => {
      if (!user) return;
      
      try {
        const res = await fetch("/api/forms/admin", {
          headers: getAuthHeader(),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch forms");
        }

        const data = await res.json();
        setForms(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, [user, getAuthHeader]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p>Loading your forms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Forms</h1>
        <Link 
          href="/dashboard/create-form" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Form
        </Link>
      </div>
      
      {forms.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You haven&apos;t created any forms yet.</p>
          <Link 
            href="/dashboard/create-form" 
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Create your first form
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {forms.map((form) => (
            <li key={form._id} className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{form.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Responses: {form.responseCount}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Link 
                    href={`/forms/${form._id}`} 
                    target="_blank"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Form
                  </Link>
                  <Link 
                    href={`/dashboard/forms/${form._id}`}
                    className="text-green-600 hover:underline text-sm"
                  >
                    View Responses
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
