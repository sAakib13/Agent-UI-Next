'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    // Simulate API logout call / clearing local storage
    const timer = setTimeout(() => {
      // In a real app, you would clear auth tokens here:
      // localStorage.removeItem('authToken');
      // await signOut(); 
      setIsLoggingOut(false);
    }, 1500); // 1.5s delay to simulate network request logic

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 text-center transition-colors duration-300">

        {/* Icon Animation Container */}
        <div className="flex justify-center">
          <div className={`p-4 rounded-full transition-colors duration-500 ${isLoggingOut
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            }`}>
            {isLoggingOut ? (
              <LogOut className="w-12 h-12 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-12 h-12" />
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {isLoggingOut ? 'Signing you out...' : 'Successfully Logged Out'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isLoggingOut
              ? 'Please wait while we securely end your session.'
              : 'Thank you for using Sahayata Agent. You can now close this window or sign in again.'}
          </p>
        </div>

        {/* Action Button */}
        <div className={`transition-opacity duration-500 ${isLoggingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <Link
            href="/login" // In a real app, this would point to your actual login route
            className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span>Return to Sign In</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>

          {/* <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
            Forgot to save something? <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">Go back to Dashboard</Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}