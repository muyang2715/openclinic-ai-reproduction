import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Better Auth server instance. Uses its own Postgres pool against the same Neon
// database (DATABASE_URL) and manages the user/session/account/verification
// tables. Single-admin: public sign-up is disabled except when the seed script
// flips BETTER_AUTH_ALLOW_SIGNUP=true.
export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.BETTER_AUTH_ALLOW_SIGNUP !== "true",
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});
