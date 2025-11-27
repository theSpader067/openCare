import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

/**
 * Verify JWT token from Bearer authorization header
 * Used for mobile app JWT authentication
 */
export function verifyMobileToken(request: NextRequest): number | null {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || "fallback-secret-key"
    ) as any;

    return decoded.userId;
  } catch (error) {
    console.error("[MOBILE_AUTH] Token verification failed:", error);
    return null;
  }
}
