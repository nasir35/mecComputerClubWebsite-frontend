import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken, CustomJWTPayload } from "./lib/jwt"; // Import the utility function

// Middleware function
export async function middleware(req: NextRequest) {
  // MAKE IT ASYNC
  const invitationCookie = req.cookies.get("invitation_validated")?.value;
  const token = req.cookies.get("auth_token")?.value;
  // console.log("cookie: ", req.headers.get("cookie"));
  // console.log("token: ", token);
  const { pathname } = req.nextUrl;

  let payload: CustomJWTPayload | null = null;

  // --- Core JWT Validation Logic ---
  if (token) {
    payload = await verifyAuthToken(token);
  }
  // ---------------------------------

  // --- NEW: 0️⃣ Public Route Protection ---
  // If a *valid* token exists, they should not access login/register.
  if (payload) {
    // Check for payload (meaning token is valid)
    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
      // Use the role from the payload to determine the dashboard (best practice)
      // const redirectPath = payload.role === 'admin' ? '/dashboard/admin' : '/dashboard';
      const redirectPath = "/dashboard";
      if (!pathname.startsWith(redirectPath)) {
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
    }
  }
  // ----------------------------------------

  // 1️⃣ Invitation-protected pages
  if (pathname.startsWith("/register/form")) {
    if (!invitationCookie) {
      return NextResponse.redirect(new URL("/register", req.url));
    }
  }

  // 2️⃣ Dashboard-protected pages
  if (pathname.startsWith("/dashboard")) {
    if (!payload) {
      // Check for payload (meaning token is valid)
      // If token is invalid or missing, redirect to login
      const response = NextResponse.redirect(new URL("/login", req.url));
      // Optional: Clear the invalid cookie
      if (token) {
        response.cookies.delete("auth_token");
      }
      return response;
    }
  }

  return NextResponse.next();
}

// Matcher configuration (remains the same)
export const config = {
  matcher: ["/login", "/register", "/register/form/:path*", "/dashboard/:path*"],
};
