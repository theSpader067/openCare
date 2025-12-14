import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

// Create adapter and customize for Google OAuth
const adapter = PrismaAdapter(prisma)

// Override getUser to handle string to int conversion
const originalGetUser = adapter.getUser!
adapter.getUser = async (id) => {
  try {
    const userId = typeof id === 'string' ? parseInt(id, 10) : id
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) return null
    return {
      ...user,
      id: user.id.toString(), // Convert number id to string for adapter
      emailVerified: user.emailVerified ? new Date() : null,
    } as any
  } catch (error) {
    console.error("Error in getUser:", error)
    return null
  }
}

// Override getUserByAccount to handle string to int conversion
const originalGetUserByAccount = adapter.getUserByAccount!
adapter.getUserByAccount = async (account) => {
  try {
    const accountRecord = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
      include: { user: true },
    })
    if (!accountRecord?.user) return null
    const user = accountRecord.user
    return {
      ...user,
      id: user.id.toString(), // Convert number id to string for adapter
      emailVerified: user.emailVerified ? new Date() : null,
    } as any
  } catch (error) {
    console.error("Error in getUserByAccount:", error)
    return null
  }
}

// Override createUser to set default values for OAuth users
const originalCreateUser = adapter.createUser!
adapter.createUser = async (data) => {
  console.log("Creating new user via OAuth:", data.email)

  // Create user with proper defaults
  const user = await prisma.user.create({
    data: {
      username: data.name?.split(' ').map((word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join('.') || data.email?.split('@')[0],
      email: data.email,
      image: data.image,
      emailVerified: true, // OAuth users are auto-verified
      onboardingCompleted: false, // New users need onboarding
    } as any,
  })

  console.log("Created user:", user.email, "emailVerified:", user.emailVerified, "onboardingCompleted:", user.onboardingCompleted)

  // Return in format expected by adapter
  // Keep id as a number for PrismaAdapter to create Account records correctly
  return {
    ...user,
    emailVerified: user.emailVerified ? new Date() : null,
  } as any
}

export const authConfig: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize - credentials received");

        if (!credentials?.email || !credentials?.password) {
          console.log("Authorize - missing credentials");
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          console.log("Authorize - user not found or no password");
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) {
          console.log("Authorize - invalid password");
          return null
        }

       

        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          onboardingCompleted: user.onboardingCompleted ?? false,
          hospital: user.hospital,
          specialty: user.specialty
        }
      },
    }),
  ],
  // Use customized adapter for OAuth providers (Google)
  adapter: adapter as any,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      console.log("JWT callback - trigger:", trigger, "account provider:", account?.provider);

      // Initial sign-in: store user fields in JWT token
      if (user) {
        console.log("JWT callback - user sign-in, storing user data");
        // Convert id to string for token (id may be number or string depending on provider)
        token.userId = String(user.id)
        token.email = user.email
        token.username = (user as any).username
        token.emailVerified = (user as any).emailVerified !== false
        token.onboardingCompleted = (user as any).onboardingCompleted ?? false
        token.hospital = (user as any).hospital
        token.specialty = (user as any).specialty

        
      }

      // Handle session update (when user completes onboarding)
      if (trigger === "update") {
        console.log("JWT callback - update trigger, refreshing from DB");
        // Refresh user data from database
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          })

          if (dbUser) {
            token.emailVerified = dbUser.emailVerified
            token.onboardingCompleted = dbUser.onboardingCompleted ?? false
            token.hospital = dbUser.hospital
            token.specialty = dbUser.specialty
           
          }
        }
      }

      return token
    },

    async session({ session, token }) {
      

      // Add token fields to session
      if (session.user) {
        (session.user as any).id = (token.userId || token.sub) as string
        (session.user as any).email = token.email as string
        (session.user as any).username = token.username as string
        ;(session.user as any).emailVerified = token.emailVerified as boolean
        ;(session.user as any).onboardingCompleted = token.onboardingCompleted as boolean
        ;(session.user as any).hospital = token.hospital as string
        ;(session.user as any).specialty = token.specialty as string
      }

      return session
    },

    async signIn({ user, account }: { user: any, account: any }) {

      // For Google OAuth, load user data from database
      if (account?.provider === "google") {

        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (dbUser) {

          // Add database fields to user object so JWT callback can access them
          // Convert id to string to match JWT token format
          user.id = dbUser.id.toString()
          ;(user as any).username = dbUser.username
          ;(user as any).emailVerified = dbUser.emailVerified
          ;(user as any).onboardingCompleted = dbUser.onboardingCompleted ?? false
          ;(user as any).hospital = dbUser.hospital
          ;(user as any).specialty = dbUser.specialty
        } else {
          console.log("SignIn callback - User not found in DB (new user will be created by adapter)");
        }
      }

      // Only check email verification for credentials provider
      if (account?.provider === "credentials") {
        if (!(user as any).emailVerified) {
          console.log("SignIn callback - email not verified, blocking");
          return "/verify-email?unverified=1"
        }
      }

      return true
    },
  },
}

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
