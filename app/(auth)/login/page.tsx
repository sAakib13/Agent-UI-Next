"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr"; // Import Supabase Client

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize Supabase Client for the Browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // --- REAL SUPABASE LOGIN ---
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Handle Supabase errors (Invalid login, etc.)
        setError(authError.message);
        setLoading(false);
      } else {
        // Success!
        console.log("Login successful");

        // 1. Refresh router to ensure Server Components see the new cookie
        router.refresh();

        // 2. Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 sm:p-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
      {/* Header/Logo */}
      <div className="flex flex-col items-center space-y-4 mb-8">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sahayata
            <span className="text-blue-600 dark:text-blue-400">Agent</span>
          </h1>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-white font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 disabled:bg-blue-400 disabled:shadow-none"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          <span>{loading ? "Logging in..." : "Log In"}</span>
        </button>
      </form>

      {/* Footer Link */}
      <div className="mt-8 text-center text-sm">
        <p className="text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?
          <a
            href="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
          >
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
}
