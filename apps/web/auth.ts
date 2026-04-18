import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import LinkedIn from "next-auth/providers/linkedin"
import type { LinkedInProfile } from "next-auth/providers/linkedin"
import { logger, EVT_LINKEDIN_AUTH_SUCCESS } from "./src/lib/logger"

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      /** The OAuth provider used to sign in (e.g. "github" | "linkedin") */
      provider?: string
      /** App-level authorization role derived from the provider */
      role?: "admin" | "visitor"
      /** LinkedIn subject identifier — available for LinkedIn-authenticated sessions */
      linkedinSub?: string
    }
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // LinkedIn: allow all users — used for public review identity enrichment
      if (account?.provider === "linkedin") {
        // Log auth success without the LinkedIn sub (PII).
        logger.info({ event: EVT_LINKEDIN_AUTH_SUCCESS })
        return true
      }

      // GitHub: restrict to explicitly allowed admin users
      const allowedUsers =
        process.env.ALLOWED_GITHUB_USERS?.split(",").map((u) => u.trim()) || []

      if (allowedUsers.length === 0) {
        console.warn("ALLOWED_GITHUB_USERS not set - allowing all users")
        return true
      }

      const githubUsername = (profile as any)?.login
      const isAllowed = allowedUsers.includes(githubUsername)

      if (!isAllowed) {
        console.log(`Access denied for GitHub user: ${githubUsername}`)
      }

      return isAllowed
    },

    async jwt({ token, account, profile }) {
      // Persist provider and LinkedIn-specific fields through the JWT
      if (account) {
        ;(token as { provider?: string }).provider = account.provider
        ;(token as { role?: "admin" | "visitor" }).role =
          account.provider === "github" ? "admin" : "visitor"

        if (account.provider === "linkedin") {
          const linkedinProfile = profile as LinkedInProfile
          token.name = linkedinProfile.name
          token.picture = linkedinProfile.picture
          ;(token as { linkedinSub?: string }).linkedinSub = linkedinProfile.sub
        }
      }
      return token
    },

    async session({ session, token }) {
      // Expose provider, role, and LinkedIn reviewer identity to the client session
      session.user.provider = (token as { provider?: string }).provider
      session.user.role = (token as { role?: "admin" | "visitor" }).role

      const linkedinSub = (token as { linkedinSub?: string }).linkedinSub
      if (linkedinSub) {
        session.user.linkedinSub = linkedinSub
      }

      return session
    },
  },
})
