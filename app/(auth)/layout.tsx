import React from "react";

// This layout is designed for non-authenticated pages (like login/register)
// that should not include the main application sidebar.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // It provides a full-screen, centered container, inheriting global theme styles.
  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
      {children}
    </div>
  );
}
