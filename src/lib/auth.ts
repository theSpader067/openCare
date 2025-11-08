import { getServerSession } from "next-auth"
import { authConfig } from "@/app/api/auth/[...nextauth]/route"

export async function getSession() {
  return await getServerSession(authConfig)
}
