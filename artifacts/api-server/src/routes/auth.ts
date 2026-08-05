import { Router } from "express";
import jwt from "jsonwebtoken";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { db } from "@workspace/db";
import { projects, users, socialAccounts } from "@workspace/db/schema";
import crypto from "crypto";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "");
const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/$/, "");

// 🚀 THE FIX: Bring back the In-Memory Cache for OAuth State.
interface OAuthSession {
  expiresAt: number;
}
const oauthCache = new Map<string, OAuthSession>();

// Garbage collection to prevent memory leaks from abandoned auth flows
setInterval(() => {
  const now = Date.now();
  for (const [state, session] of oauthCache.entries()) {
    if (now > session.expiresAt) {
      oauthCache.delete(state);
    }
  }
}, 10 * 60 * 1000); // Runs every 10 minutes

/**
 * GET /api/auth/linkedin/auth-url
 * Generates the LinkedIn OAuth URL for Login/Signup
 */
router.get("/linkedin/auth-url", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  
  // Store state in server memory instead of relying on fragile cross-domain cookies
  oauthCache.set(state, {
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = `${BACKEND_URL}/api/auth/linkedin/callback`;
  const scope = "w_member_social openid profile email";
  
  const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
  
  return res.json({ url });
});

/**
 * GET /api/auth/linkedin/callback
 * Handles the OAuth response, creates/logs in the user, and stores the social account token
 */
router.get("/linkedin/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) throw new Error(`LinkedIn authentication error: ${error}`);
    if (!code || !state || typeof state !== "string") throw new Error("Missing code or state from provider.");

    // Retrieve session from server memory using the state parameter
    const session = oauthCache.get(state);
    
    if (!session) throw new Error("Invalid or expired session state.");
    
    // Clean up cache immediately
    oauthCache.delete(state);

    if (Date.now() > session.expiresAt) {
      throw new Error("Session expired.");
    }

    const redirectUri = `${BACKEND_URL}/api/auth/linkedin/callback`;

    // 1. Exchange code for LinkedIn Token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: redirectUri,
      }),
    });
    
    const tokens = (await tokenRes.json()) as any;
    if (tokens.error) throw new Error(tokens.error_description);

    // 2. Fetch LinkedIn Profile
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = (await profileRes.json()) as any;

    if (!profile.email) throw new Error("Email not provided by LinkedIn.");

    // 3. Upsert User in Database (Login or Signup)
    const existingUser = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);
    let user = existingUser[0];
    
    if (!user) {
      const newUser = await db.insert(users).values({
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture,
      }).returning();
      
      user = newUser[0];

      // Create a default project for new users
      await db.insert(projects).values({
        userId: user.id,
        name: `${profile.name}'s Workspace`,
      });
    }

    // 4. Upsert the LinkedIn Token into socialAccounts for the Background Worker
    const defaultProject = await db.select().from(projects).where(eq(projects.userId, user.id)).limit(1).then(res => res[0]);
    
    const profileData = {
      profileName: profile.name,
      profileHandle: profile.email,
      profileImageUrl: profile.picture,
      providerAccountId: profile.sub,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || "",
    };

    const existingAccount = await db.select().from(socialAccounts).where(
      and(eq(socialAccounts.projectId, defaultProject.id), eq(socialAccounts.provider, "linkedin"))
    ).limit(1);

    if (existingAccount.length > 0) {
      await db.update(socialAccounts).set({ ...profileData, updatedAt: new Date() }).where(eq(socialAccounts.id, existingAccount[0].id));
    } else {
      await db.insert(socialAccounts).values({ projectId: defaultProject.id, provider: "linkedin", ...profileData });
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    
    res.cookie("access_token", accessToken, { 
      httpOnly: true, 
      secure: true,
      sameSite: "none",
      path: "/"
    });

    // 🚀 FIX: Pass the token in the URL to bypass 3rd-party cookie blocking
    return res.redirect(`${FRONTEND_URL}/?token=${accessToken}`);
  } catch (err: any) {
    console.error("LinkedIn Auth Error:", err.message);
    return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  // 1. Fetch User
  const userRecords = await db.select({ 
      id: users.id, 
      email: users.email, 
      name: users.name, 
      avatarUrl: users.avatarUrl 
    })
    .from(users)
    .where(eq(users.id, req.userId!))
    .limit(1);
    
  // 2. Fetch Projects
  const userProjects = await db.select()
    .from(projects)
    .where(eq(projects.userId, req.userId!));
  
  // 3. Fetch their linked social account (LinkedIn)
  let linkedInAccount = null;
  if (userProjects.length > 0) {
    const accounts = await db.select()
      .from(socialAccounts)
      .where(eq(socialAccounts.projectId, userProjects[0].id))
      .limit(1);
      
    if (accounts.length > 0) {
      // Strip sensitive tokens before sending to frontend
      const { accessToken, refreshToken, ...safeAccount } = accounts[0];
      linkedInAccount = safeAccount;
    }
  }
  
  return res.json({ 
    user: userRecords[0], 
    projects: userProjects,
    socialAccount: linkedInAccount 
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("access_token");
  return res.json({ success: true });
});

export default router;