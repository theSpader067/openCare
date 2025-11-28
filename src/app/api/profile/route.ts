import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Helper function to get userId from session or JWT token
async function getUserId(request: NextRequest): Promise<number | null> {
  // Try mobile JWT authentication first
  const mobileUserId = verifyMobileToken(request);
  if (mobileUserId) {
    return mobileUserId;
  }

  // Fall back to session-based authentication (web)
  const session = await getSession();
  if (session?.user) {
    return parseInt((session.user as any).id);
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        specialty: true,
        year:true,
        hospital: true,
        biographie: true,
        addresse: true,
        notifyByEmail: true,
        notifyByPush: true,
        profileVisible: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Transform the data to match the component's expected format
    return NextResponse.json({
      avatar: user.firstName && user.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        : user.firstName?.[0]?.toUpperCase() || "U",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email,
      phone: user.phone || "",
      specialty: user.specialty || "",
      hospital: user.hospital || "",
      year:user.year || "",
      address: user.addresse || "",
      bio: user.biographie || "",
      notifyByEmail: user.notifyByEmail,
      notifyByPush: user.notifyByPush,
      profileVisible: user.profileVisible,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.json();

    // Extract fields from request
    const {
      firstName,
      lastName,
      username,
      phone,
      specialty,
      hospital,
      year,
      address,
      bio,
      notifyByEmail,
      notifyByPush,
      profileVisible,
    } = body;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        username: username || undefined,
        phone: phone || undefined,
        specialty: specialty || undefined,
        hospital: hospital || undefined,
        year: year || undefined,
        addresse: address || undefined,
        biographie: bio || undefined,
        notifyByEmail: notifyByEmail !== undefined ? notifyByEmail : undefined,
        notifyByPush: notifyByPush !== undefined ? notifyByPush : undefined,
        profileVisible: profileVisible !== undefined ? profileVisible : undefined,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        specialty: true,
        year: true,
        hospital: true,
        biographie: true,
        addresse: true,
        notifyByEmail: true,
        notifyByPush: true,
        profileVisible: true,
      },
    });

    // Return updated profile
    return NextResponse.json({
      avatar: updatedUser.firstName && updatedUser.lastName
        ? `${updatedUser.firstName[0]}${updatedUser.lastName[0]}`.toUpperCase()
        : updatedUser.username?.[0]?.toUpperCase() || "U",
      firstName: updatedUser.firstName || "",
      lastName: updatedUser.lastName || "",
      username: updatedUser.username || "",
      email: updatedUser.email,
      phone: updatedUser.phone || "",
      specialty: updatedUser.specialty || "",
      hospital: updatedUser.hospital || "",
      year: updatedUser.year || "",
      address: updatedUser.addresse || "",
      bio: updatedUser.biographie || "",
      notifyByEmail: updatedUser.notifyByEmail,
      notifyByPush: updatedUser.notifyByPush,
      profileVisible: updatedUser.profileVisible,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
