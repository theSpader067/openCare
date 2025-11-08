import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  console.log("Onboarding API called");

  const session = await getSession();
  console.log("Session:", JSON.stringify(session, null, 2));

  if (!session || !session.user?.email) {
    console.log("No session or email found, returning unauthorized");
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
      where: { email: session.user.email },
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
