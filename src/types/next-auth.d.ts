import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string; // "BAND" | "VENUE"
      plan: string; // "FREE" | "PRO"
    };
  }

  interface User {
    id: string;
    role: string;
    plan: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    plan?: string;
  }
}
