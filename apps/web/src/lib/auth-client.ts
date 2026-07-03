import { createAuthClient } from "better-auth/react";

// Browser client. baseURL defaults to the current origin, where the Next.js
// route handler (app/api/auth/[...all]) serves Better Auth.
export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;
