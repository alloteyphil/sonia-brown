// Clerk → Convex auth. Create a JWT template named "convex" in Clerk and set
// CLERK_JWT_ISSUER_DOMAIN in the Convex dashboard (e.g. https://your-app.clerk.accounts.dev).
const authConfig = {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
