import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import jwt from "jsonwebtoken";

function extractEmailFromToken(token: string): string | null {
  try {
    console.log("[ONBOARDING] Verifying JWT token with secret:", process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET");
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret-key") as any;
    console.log("[ONBOARDING] JWT decoded successfully:", {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    });
    return decoded.email || null;
  } catch (error) {
    console.error("[ONBOARDING] JWT verification failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  console.log("Onboarding API called");

  let userEmail: string | null = null;

  // Try to get email from session (web flow)
  const session = await getSession();
  if (session?.user?.email) {
    userEmail = session.user.email;
    console.log("Got email from session:", userEmail);
  }

  // If no session, try to get from JWT token (mobile flow)
  if (!userEmail) {
    const authHeader = request.headers.get("authorization");
    console.log("[ONBOARDING] Authorization header present:", !!authHeader);
    if (authHeader) {
      console.log("[ONBOARDING] Authorization header (first 30 chars):", authHeader.substring(0, 30) + "...");
    }
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      console.log("[ONBOARDING] Extracted token (first 20 chars):", token.substring(0, 20) + "...");
      userEmail = extractEmailFromToken(token);
      console.log("[ONBOARDING] Got email from JWT token:", userEmail);
    } else {
      console.log("[ONBOARDING] Authorization header does not start with 'Bearer '");
    }
  }

  if (!userEmail) {
    console.log("No email found from session or token, returning unauthorized");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { specialty, hospital, year } = await request.json();
    console.log("Form data:", { specialty, hospital, year });

    if (!specialty || !hospital || !year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update user with onboarding information
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        specialty,
        hospital,
        year,
        onboardingCompleted: true,
      } as any,
    });

    console.log("User updated successfully:", updatedUser.email, "onboarding:", updatedUser.onboardingCompleted);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "An error occurred during onboarding" },
      { status: 500 }
    );
  }
}
