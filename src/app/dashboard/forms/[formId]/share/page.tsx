'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, Copy } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

export default function ShareFormPage() {
  const { formId } = useParams();
  const { getAuthHeader } = useAuth();
  
  const [form, setForm] = useState<{ title: string; description?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  
  const formUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/forms/${formId}`
    : '';

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch form');
        }

        const data = await response.json();
        setForm(data);
      } catch (error) {
        console.error('Error fetching form:', error);
        showError(`Failed to load form details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [formId, getAuthHeader]);

  const copyToClipboard = async () => {
    if (!formUrl) return;
    
    try {
      await navigator.clipboard.writeText(formUrl);
      showSuccess('Link copied to clipboard!');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showError('Failed to copy to clipboard');
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Failed to load form details</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Share Form</h1>
          <p className="text-muted-foreground mt-2">
            Share your form with others to start collecting responses
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{form.title}</CardTitle>
            {form.description && (
              <CardDescription>{form.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Share via link</h3>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    value={formUrl}
                    readOnly
                    className="pr-12"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={copyToClipboard}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  disabled={isCopied}
                >
                  {isCopied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>


          </CardContent>
        </Card>
      </div>
    </div>
  );
}