"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Authentication Failed
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-8">
          We couldn't sign you in. The link may have expired or was already
          used.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full px-6 py-3 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
