import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { nanoid } from "nanoid";
import { connectDb } from "./db";
import { UserModel } from "./models";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/drive.file",
        },
      },
    }),
  ],
  events: {
    async signIn({ user, account }) {
      if (!user?.email || !account) return;

      await connectDb();
      const email = String(user.email).toLowerCase();
      const existing = await UserModel.findOne({ email }).lean();

      if (existing) {
        await UserModel.updateOne(
          { email },
          {
            $set: {
              name: user.name || existing.name,
              googleId: account.providerAccountId || existing.googleId,
            },
          }
        );
        return;
      }

      await UserModel.create({
        id: nanoid(10),
        name: user.name || "Usuario",
        email,
        googleId: account.providerAccountId,
        createdAt: new Date().toISOString(),
      });
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const target = new URL(url);
        const base = new URL(baseUrl);

        if (target.origin === base.origin) {
          return url;
        }

        // Corrige callbacks viejos que quedaron apuntando a localhost.
        if (target.hostname === "localhost" || target.hostname === "127.0.0.1") {
          return `${base.origin}${target.pathname}${target.search}${target.hash}`;
        }
      } catch {
        return baseUrl;
      }

      return baseUrl;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && account.access_token) {
        token.accessToken = account.access_token;
        token.provider = "google";
      }

      if (user?.email) {
        await connectDb();
        const dbUser = await UserModel.findOne({ email: String(user.email).toLowerCase() }).lean();
        if (dbUser?.id) {
          token.id = dbUser.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}
