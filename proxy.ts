import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware"; // * You'll need a middleware helper

export async function middleware(request: NextRequest) {
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
