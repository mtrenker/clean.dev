import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  })],
  callbacks: {
    async signIn({ user, profile }) {
      const allowedUsers = process.env.ALLOWED_GITHUB_USERS?.split(',').map(u => u.trim()) || []

      if (allowedUsers.length === 0) {
        console.warn('ALLOWED_GITHUB_USERS not set - allowing all users')
        return true
      }

      const githubUsername = (profile as any)?.login
      const isAllowed = allowedUsers.includes(githubUsername)

      if (!isAllowed) {
        console.log(`Access denied for GitHub user: ${githubUsername}`)
      }

      return isAllowed
    },
  },
})
