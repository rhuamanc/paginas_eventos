import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { connectDb } from "./db";
import { UserModel } from "./models";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider?: "credentials" | "google";
    } & DefaultSession["user"];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: "credentials" | "google";
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
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
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contrasena", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDb();
        const user = await UserModel.findOne({ email: String(credentials.email).toLowerCase() }).lean();

        if (!user) {
          return null;
        }

        if (!user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          provider: "credentials",
        };
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
              provider: account.provider === "google" ? "google" : existing.provider || "credentials",
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
        provider: account.provider === "google" ? "google" : "credentials",
        googleId: account.provider === "google" ? account.providerAccountId : undefined,
        createdAt: new Date().toISOString(),
      });
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && account.access_token) {
        token.accessToken = account.access_token;
        token.provider = "google";
      }

      if (user) {
        if ((user as { id?: string }).id) {
          token.id = (user as { id?: string }).id;
        }

        if ((user as { provider?: "credentials" | "google" }).provider) {
          token.provider = (user as { provider?: "credentials" | "google" }).provider;
        }

        if (user.email) {
          await connectDb();
          const dbUser = await UserModel.findOne({ email: String(user.email).toLowerCase() }).lean();
          if (dbUser?.id) {
            token.id = dbUser.id;
          }
          if (dbUser?.provider) {
            token.provider = dbUser.provider;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }
      if (session.user && token.provider) {
        session.user.provider = token.provider;
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
