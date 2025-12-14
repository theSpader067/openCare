import { withAuth } from "next-auth/middleware"

import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/verify-email", "/verify-email-pending", "/forgot-password", "/reset-password"]

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const token = req.nextauth?.token
    const pathname = req.nextUrl.pathname


    // If user is not authenticated and trying to access a public route, allow it
    if (!token && PUBLIC_ROUTES.includes(pathname)) {
      console.log("Public route accessed without token, allowing")
      return NextResponse.next()
    }

    if (!token) {
      console.log("No token found, redirecting to login")
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const emailVerified = token.emailVerified !== false
    const onboardingCompleted = token.onboardingCompleted === true

    console.log("Email verified:", emailVerified)
    console.log("Onboarding completed:", onboardingCompleted)

    // If user is accessing onboarding
    if (pathname === "/onboarding") {
      // If already onboarded, redirect to dashboard
      if (onboardingCompleted) {
        console.log("Already onboarded, redirecting to dashboard")
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      // If email not verified, redirect to verify-email
      if (!emailVerified) {
        console.log("Email not verified, redirecting to verify-email")
        return NextResponse.redirect(new URL("/verify-email", req.url))
      }
      return NextResponse.next()
    }

    // If user is accessing dashboard or protected app routes
    if (pathname === "/dashboard" || pathname.startsWith("/(app)")) {
      // If not onboarded, redirect to onboarding
      if (!onboardingCompleted) {
        console.log("Not onboarded, redirecting to onboarding")
        return NextResponse.redirect(new URL("/onboarding", req.url))
      }
      // If email not verified, redirect to verify-email
      if (!emailVerified) {
        console.log("Email not verified, redirecting to verify-email")
        return NextResponse.redirect(new URL("/verify-email", req.url))
      }
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Allow access to public routes without token
        if (PUBLIC_ROUTES.includes(pathname)) {
          return true
        }

        // Require token for all other routes
        return !!token
      },
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
