import nextEnv from "@next/env";

// Load .env / .env.local (DATABASE_URL, BETTER_AUTH_SECRET, …) the way Next does,
// and allow sign-up for this seed run BEFORE importing the auth instance (auth.ts
// reads BETTER_AUTH_ALLOW_SIGNUP at module init to toggle disableSignUp).
nextEnv.loadEnvConfig(process.cwd());
process.env.BETTER_AUTH_ALLOW_SIGNUP = "true";

const ADMIN_NAME = "Admin";
const ADMIN_EMAIL = "admin@openclinic.com";
const ADMIN_PASSWORD = "Password@123";

async function main() {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
    console.error(
      "DATABASE_URL and BETTER_AUTH_SECRET must be set in apps/web/.env before seeding.",
    );
    process.exit(1);
  }

  const { auth } = await import("../lib/auth");

  try {
    await auth.api.signUpEmail({
      body: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });
    console.log(
      `Admin created: ${ADMIN_EMAIL}\nPassword: ${ADMIN_PASSWORD}`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/exist|already/i.test(message)) {
      console.log(`Admin already exists: ${ADMIN_EMAIL} — nothing to do.`);
      return;
    }
    throw err;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
