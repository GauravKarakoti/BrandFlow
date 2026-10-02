import cron from "node-cron";
import { eq, and, lte } from "drizzle-orm";
import { db } from "@workspace/db";
import { posts, socialAccounts } from "@workspace/db/schema";

export function initCronJobs() {
  console.log("🚀 Background Publisher initialized. Checking for scheduled posts every minute...");

  // Run every minute at the top of the minute: "* * * * *"
  cron.schedule("* * * * *", async () => {
    try {
      // 1. Find all posts that are scheduled and past their scheduled time
      const duePosts = await db.select().from(posts).where(
        and(
          eq(posts.status, "scheduled"),
          lte(posts.scheduledAt, new Date()) // scheduledAt <= NOW
        )
      );

      if (duePosts.length === 0) return;

      for (const post of duePosts) {
        // 2. Optimistic Lock (Production-Safe):
        // Try to change status to 'publishing'. If another server instance already grabbed it, this will return empty.
        const claim = await db.update(posts)
          .set({ status: "publishing", updatedAt: new Date() })
          .where(and(eq(posts.id, post.id), eq(posts.status, "scheduled")))
          .returning();

        if (claim.length === 0) continue; // Someone else grabbed it!

        console.log(`[CRON] Publishing post ${post.id} for project ${post.projectId}...`);

        try {
          // 3. Fetch connected accounts for this project
          const accounts = await db.select().from(socialAccounts).where(
            eq(socialAccounts.projectId, post.projectId)
          );

          if (accounts.length === 0) throw new Error("No social accounts connected.");

          // 4. Publish to each platform concurrently
          const publishPromises = accounts.map(account => publishToPlatform(account, post.content as string));
          
          // Wait for all platforms to finish publishing
          const results = await Promise.allSettled(publishPromises);
          
          let successCount = 0;
          
          // Log exactly which platforms succeeded and which failed
          results.forEach((res, index) => {
            const platform = accounts[index].provider;
            if (res.status === "rejected") {
              console.error(`[CRON] ❌ Failed to publish to ${platform}:`, res.reason?.message || res.reason);
            } else {
              console.log(`[CRON] ✅ Successfully published to ${platform}`);
              successCount++;
            }
          });
          
          // If EVERYTHING failed, throw so the post is marked as 'failed'
          if (successCount === 0) throw new Error("All platform publish attempts failed.");

          // 5. Mark as Published (Partial successes still mark the post as published)
          await db.update(posts)
            .set({ status: "published", updatedAt: new Date() })
            .where(eq(posts.id, post.id));
            
          console.log(`[CRON] Post ${post.id} processing complete!`);

        } catch (error: any) {
          console.error(`[CRON] Failed to publish post ${post.id}:`, error.message);
          // Revert to 'failed' so the user can see it in the dashboard
          await db.update(posts)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(posts.id, post.id));
        }
      }
    } catch (err) {
      console.error("[CRON] Publisher System Error:", err);
    }
  });
}

/**
 * Handles routing to the correct platform API and managing token refreshes
 */
async function publishToPlatform(account: any, content: string) {
  let accessToken = account.accessToken;

  // TWITTER: Access tokens expire every 2 hours. We must aggressively refresh them.
  if (account.provider === "x") {
    accessToken = await refreshTwitterTokenIfNeeded(account);
    
    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: content }),
    });

    // Added 'as any' cast
    const data = await res.json() as any; 
    if (data.errors || !res.ok) throw new Error(data.detail || "Twitter API Error");
    return data;
  }

  // LINKEDIN: Access tokens last 60 days. (We use UGC Posts API)
  if (account.provider === "linkedin") {
    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        author: `urn:li:person:${account.providerAccountId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content },
            shareMediaCategory: "NONE", // 'NONE' is used for text-only posts
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    if (!res.ok) {
      // Added 'as any' cast
      const data = await res.json() as any; 
      throw new Error(data.message || "LinkedIn API Error");
    }
    // Added 'as any' cast
    return (await res.json()) as any;
  }

  throw new Error("Unsupported provider.");
}

/**
 * Helper to refresh Twitter OAuth 2.0 Tokens
 */
async function refreshTwitterTokenIfNeeded(account: any): Promise<string> {
  try {
    // Make a lightweight request to see if the token is still valid
    const test = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${account.accessToken}` }
    });
    
    if (test.ok) return account.accessToken; // Still valid!

    // If 401 Unauthorized, use the refresh token
    console.log(`[CRON] Refreshing X token for account ${account.profileName}...`);
    
    const basicAuth = Buffer.from(
      `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
    ).toString("base64");

    const refreshRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refreshToken,
        client_id: process.env.TWITTER_CLIENT_ID!
      }),
    });

    // Added 'as any' cast
    const newTokens = await refreshRes.json() as any; 
    if (newTokens.error) throw new Error(newTokens.error_description);

    // Save the new tokens back to the database so we have them for next time
    await db.update(socialAccounts)
      .set({ 
        accessToken: newTokens.access_token, 
        refreshToken: newTokens.refresh_token,
        updatedAt: new Date()
      })
      .where(eq(socialAccounts.id, account.id));

    return newTokens.access_token;
  } catch (err: any) {
    console.error("Failed to refresh X token:", err.message);
    throw new Error("Social account disconnected or token refresh failed.");
  }
}