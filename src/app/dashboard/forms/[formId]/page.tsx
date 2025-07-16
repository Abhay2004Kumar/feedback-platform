'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Share2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface Form {
  _id: string;
  title: string;
  description?: string;
  questions: Array<{
    _id: string;
    text: string;
    type: 'text' | 'multiple' | 'select';
    options?: string[];
    required: boolean;
  }>;
  createdAt: string;
}

interface Response {
  _id: string;
  formId: string;
  answers: Array<{
    questionId: string;
    answer: string | string[];
  }>;
  submittedAt: string;
}

export default function FormResponsesPage() {
  const { formId } = useParams();
  // Removed unused router import and variable
  const { getAuthHeader } = useAuth();

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'responses'>('summary');

  useEffect(() => {
    const fetchFormAndResponses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch form details
        const formResponse = await fetch(`/api/forms/${formId}`, {
          headers: getAuthHeader(),
        });

        if (!formResponse.ok) {
          throw new Error('Failed to fetch form');
        }

        const formData = await formResponse.json();
        setForm(formData);

        // Fetch responses
        const responsesResponse = await fetch(`/api/responses/${formId}`, {
          headers: getAuthHeader(),
        });

        if (!responsesResponse.ok) {
          throw new Error('Failed to fetch responses');
        }

        const responsesData = await responsesResponse.json();
        setResponses(responsesData);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (formId) {
      fetchFormAndResponses();
    }
  }, [formId, getAuthHeader]);

  const getAnswerSummary = (questionId: string) => {
    if (!form) return [];

    const question = form.questions.find(q => q._id === questionId);
    if (!question) return [];

    if (question.type === 'text') {
      // For text questions, return array of answers
      return responses
        .flatMap(response => {
          const answer = response.answers.find(a => a.questionId === questionId);
          return answer ? (Array.isArray(answer.answer) ? answer.answer : [answer.answer]) : [];
        })
        .filter(Boolean);
    } else if ((question.type === 'multiple' || question.type === 'select') && question.options) {
      // For multiple choice, initialize all options with 0 count
      const optionCounts: Record<string, number> = {};

      // Initialize all possible options with 0 count
      question.options.forEach((option: string) => {
        optionCounts[option] = 0;
      });

      let totalAnswers = 0;

      // Count actual answers
      responses.forEach((response: Response) => {
        const answer = response.answers.find(a => a.questionId === questionId);
        if (answer?.answer) {
          const answers = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
          answers.forEach((a: string) => {
            if (a && optionCounts.hasOwnProperty(a)) {
              optionCounts[a]++;
              totalAnswers++;
            }
          });
        }
      });

      // Convert to array with percentages
      return Object.entries(optionCounts).map(([option, count]) => ({
        option,
        count,
        percentage: totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0,
      }));
    }

    return [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Function to export responses as CSV
  const exportToCSV = () => {
    try {
      if (!form || responses.length === 0) return;

      // Create CSV header with safe defaults for undefined values
      const headers = [
        'Response ID',
        'Submitted At',
        ...(form.questions?.map(q => q?.text || '') || [])
      ];
      
      // Create CSV rows with safe handling of undefined values
      const rows = responses.map(response => {
        const row = [
          response._id || '',
          response.submittedAt ? new Date(response.submittedAt).toLocaleString() : '',
          ...(form.questions?.map(question => {
            if (!question?._id) return '';
            const answer = response.answers?.find(a => a?.questionId === question._id);
            if (!answer?.answer) return '';
            return Array.isArray(answer.answer) 
              ? answer.answer.filter(Boolean).join('; ')
              : String(answer.answer || '');
          }) || [])
        ];
        return row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(',');
      });

      // Create CSV content with safe header handling
      const csvContent = [
        headers.map(h => `"${String(h || '').replace(/"/g, '""')}"`).join(','),
        ...rows
      ].filter(Boolean).join('\n');

      if (!csvContent) {
        console.error('No CSV content to download');
        return;
      }

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(form.title || 'form_responses').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  };

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Form not found</h2>
          <p className="text-gray-600 mb-4">The requested form could not be found.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold break-words">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{form.description}</p>
          )}
        </div>
        <div className="w-full sm:w-auto flex flex-wrap gap-2">
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'summary' ? 'default' : 'outline'}
              onClick={() => setActiveTab('summary')}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Summary
            </Button>
            <Button
              variant={activeTab === 'responses' ? 'default' : 'outline'}
              onClick={() => setActiveTab('responses')}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Responses</span> ({responses.length})
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToCSV}
              disabled={responses.length === 0}
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className="flex-1 sm:flex-none"
            >
              <Link href={`/dashboard/forms/${form._id}/share`} className="flex items-center gap-1">
                <Share2 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Link href={`/forms/${form._id}`} target="_blank" className="flex items-center gap-1">
                <span className="hidden sm:inline">View</span> Form
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {activeTab === 'summary' ? (
        <div className="space-y-4 sm:space-y-6">
          {form.questions.map((question) => (
            <Card key={question._id}>
              <CardHeader>
                <CardTitle>{question.text}</CardTitle>
                <CardDescription>
                  {question.type === 'text' ? 'Text Response' : 'Multiple Choice'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {question.type === 'text' ? (
                  <div className="space-y-2">
                    {getAnswerSummary(question._id).length > 0 ? (
                      (getAnswerSummary(question._id) as string[]).map((answer, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-md">
                          <p>{answer}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No responses yet</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(getAnswerSummary(question._id) as Array<{option: string; count: number; percentage: number}>).map((item) => (
                      <div key={item.option}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.option}</span>
                          <span className="text-gray-500">{item.percentage}% ({item.count})</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {getAnswerSummary(question._id).length === 0 && (
                      <p className="text-gray-500 text-sm">No responses yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                {form.questions.map((question) => (
                  <th 
                    key={question._id} 
                    className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    title={question.text}
                  >
                    <div className="max-w-[100px] sm:max-w-[200px] truncate">
                      {question.text}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {responses.map((response) => (
                <tr key={response._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 font-mono">
                    {response._id.substring(0, 4)}...
                  </td>
                  {form.questions.map((question) => {
                    const answer = response.answers.find(a => a.questionId === question._id);
                    return (
                      <td 
                        key={question._id} 
                        className="px-3 py-2 sm:px-6 sm:py-4 whitespace-normal text-xs sm:text-sm text-gray-500 max-w-[150px] sm:max-w-xs truncate"
                        title={answer ? (Array.isArray(answer.answer) ? answer.answer.join(', ') : String(answer.answer)) : ''}
                      >
                        {answer ? (
                          Array.isArray(answer.answer) 
                            ? answer.answer.length > 0 
                              ? answer.answer.join(', ')
                              : '—'
                            : String(answer.answer || '—')
                        ) : '—'}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {new Date(response.submittedAt).toLocaleDateString()}
                    <div className="text-gray-400 text-xs">
                      {new Date(response.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                </tr>
              ))}
              {responses.length === 0 && (
                <tr>
                  <td colSpan={form.questions.length + 2} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p>No responses yet</p>
                      <p className="text-xs text-gray-400">Share your form to start collecting responses</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
