import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import jwt from "jsonwebtoken";

function extractEmailFromToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret-key") as any;
    return decoded.email || null;
  } catch {
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
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      userEmail = extractEmailFromToken(token);
      console.log("Got email from JWT token:", userEmail);
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
