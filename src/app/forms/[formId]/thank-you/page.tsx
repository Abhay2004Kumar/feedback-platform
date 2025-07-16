'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  // Optional: Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectUrl);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, redirectUrl]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Thank You!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Your response has been recorded. We appreciate your feedback!
        </p>
        <div className="mt-6">
          <Link
            href={redirectUrl}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Return to the website
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          You&apos;ll be automatically redirected in 5 seconds...
        </p>
      </div>
    </div>
  );
}
