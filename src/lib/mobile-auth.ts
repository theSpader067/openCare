import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

/**
 * Verify JWT token from Bearer authorization header
 * Used for mobile app JWT authentication
 */
export function verifyMobileToken(request: NextRequest): number | null {
  try {
    const authHeader = request.headers.get("authorization");
    console.log("[MOBILE_AUTH] Auth header present:", !!authHeader);

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("[MOBILE_AUTH] No Bearer token in header");
      return null;
    }

    const token = authHeader.substring(7);
    console.log("[MOBILE_AUTH] Token found, verifying...");

    const secret = process.env.NEXTAUTH_SECRET;
    console.log("[MOBILE_AUTH] Using secret:", secret ? "SET" : "NOT SET (using fallback)");

    const decoded = jwt.verify(
      token,
      secret || "fallback-secret-key"
    ) as any;

    console.log("[MOBILE_AUTH] Token verified successfully, userId:", decoded.userId);
    return decoded.userId;
  } catch (error: any) {
    console.error("[MOBILE_AUTH] Token verification failed:", {
      error: error.message,
      secret_present: !!process.env.NEXTAUTH_SECRET,
    });
    return null;
  }
}
