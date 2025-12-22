// middleware.ts (or proxy.ts)
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// FIX: Change 'export async function middleware' to 'export default async function'
export default async function middleware(request: NextRequest) {
  // This refreshes the auth token and protects routes
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Protect dashboard and agent routes
    "/dashboard/:path*",
    "/create-agent/:path*",
    "/configure-agent/:path*",
  ],
};
