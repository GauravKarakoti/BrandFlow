import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { socialAccounts } from "@workspace/db/schema";
import { requireAuth } from "../middleware/auth";
import crypto from "crypto";

const router = Router();
const BACKEND_URL = process.env.BACKEND_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

/**
 * GET /api/integrations
 * Fetch all connected social accounts for the active project
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    if (!req.projectId) return res.status(400).json({ error: "Project context required." });

    const accounts = await db.select().from(socialAccounts)
      .where(eq(socialAccounts.projectId, req.projectId));
      
    const sanitizedAccounts = accounts.map(({ accessToken, refreshToken, ...rest }) => rest);
    return res.json(sanitizedAccounts);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch integrations." });
  }
});

/**
 * GET /api/integrations/auth-url/:provider
 * Generates the real OAuth2 authorization URL and securely stores state
 */
router.get("/auth-url/:provider", requireAuth, async (req, res) => {
  try {
    if (!req.projectId) return res.status(400).json({ error: "Project context required." });
    
    const provider = req.params.provider as string;
    const state = crypto.randomBytes(16).toString("hex");
    const redirectUri = `${BACKEND_URL}/api/integrations/callback/${provider}`;
    
    // Store context in secure, short-lived cookies for the callback phase
    res.cookie("oauth_state", state, { httpOnly: true, maxAge: 15 * 60 * 1000 });
    res.cookie("oauth_project_id", req.projectId, { httpOnly: true, maxAge: 15 * 60 * 1000 });

    if (provider === "linkedin") {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const scope = "w_member_social openid profile email";
      const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
      return res.json({ url });
    } 
    
    if (provider === "x") {
      const clientId = process.env.TWITTER_CLIENT_ID;
      // Twitter requires PKCE security
      const codeVerifier = crypto.randomBytes(32).toString("base64url");
      const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
      
      res.cookie("oauth_code_verifier", codeVerifier, { httpOnly: true, maxAge: 15 * 60 * 1000 });
      
      const scope = "tweet.read tweet.write users.read offline.access";
      const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256&scope=${encodeURIComponent(scope)}`;
      return res.json({ url });
    }

    return res.status(400).json({ error: "Provider not fully implemented yet." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate auth url." });
  }
});

/**
 * GET /api/integrations/callback/:provider
 * The provider redirects the user here after they accept permissions
 */
router.get("/callback/:provider", async (req, res) => {
  try {
    const provider = req.params.provider as string;
    const { code, state, error } = req.query;
    
    // 1. Validate State & Cookies to prevent CSRF attacks
    const savedState = req.cookies.oauth_state;
    const projectId = req.cookies.oauth_project_id;
    const codeVerifier = req.cookies.oauth_code_verifier;

    if (error) throw new Error(`Provider returned an error: ${error}`);
    if (!code || state !== savedState || !projectId) throw new Error("Invalid session or state mismatch.");

    // Clear the security cookies
    res.clearCookie("oauth_state");
    res.clearCookie("oauth_project_id");
    if (codeVerifier) res.clearCookie("oauth_code_verifier");

    const redirectUri = `${BACKEND_URL}/api/integrations/callback/${provider}`;
    let profileData = { profileName: "", profileHandle: "", profileImageUrl: "", providerAccountId: "", accessToken: "", refreshToken: "" };

    // 2. LinkedIn Token & Profile Exchange
    if (provider === "linkedin") {
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
      // Added `as any` cast
      const tokens = await tokenRes.json() as any;
      if (tokens.error) throw new Error(tokens.error_description);

      const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      // Added `as any` cast
      const profile = await profileRes.json() as any;

      profileData = {
        profileName: profile.name,
        profileHandle: profile.email,
        profileImageUrl: profile.picture,
        providerAccountId: profile.sub,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
      };
    } 
    
    // 3. X (Twitter) Token & Profile Exchange
    else if (provider === "x") {
      const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          client_id: process.env.TWITTER_CLIENT_ID!,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });
      // Added `as any` cast
      const tokens = await tokenRes.json() as any;
      if (tokens.error) throw new Error(tokens.error_description);

      const profileRes = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url,username", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      // Added `as any` cast
      const profileJson = await profileRes.json() as any;
      const profile = profileJson.data;

      profileData = {
        profileName: profile.name,
        profileHandle: `@${profile.username}`,
        profileImageUrl: profile.profile_image_url,
        providerAccountId: profile.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
      };
    }

    // 4. Save to Database (Upsert if re-connecting)
    const existing = await db.select().from(socialAccounts).where(
      and(eq(socialAccounts.projectId, projectId), eq(socialAccounts.provider, provider))
    ).limit(1);

    if (existing.length > 0) {
      await db.update(socialAccounts).set({ ...profileData, updatedAt: new Date() })
        .where(eq(socialAccounts.id, existing[0].id));
    } else {
      await db.insert(socialAccounts).values({ projectId, provider, ...profileData });
    }

    // 5. Redirect back to frontend
    return res.redirect(`${FRONTEND_URL}/settings`);

  } catch (err: any) {
    console.error("OAuth Callback Error:", err.message);
    return res.redirect(`${FRONTEND_URL}/settings?error=auth_failed`);
  }
});

/**
 * DELETE /api/integrations/:id
 * Disconnect a social account
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (!req.projectId) return res.status(400).json({ error: "Project context required." });
    const id = req.params.id as string;
    
    await db.delete(socialAccounts).where(and(eq(socialAccounts.id, id), eq(socialAccounts.projectId, req.projectId)));
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to disconnect account." });
  }
});

export default router;