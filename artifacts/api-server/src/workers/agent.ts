import cron from 'node-cron';
import { db } from '@workspace/db';
import { agentSettings, brandKnowledgeBase, posts } from '@workspace/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import Groq from 'groq-sdk';

// Initialize the Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Initializes the autonomous agent background worker.
 * Invoked from the main application entry point.
 */
export function initAgentWorker() {
  console.log("🤖 Autonomous Agent Worker initialized. Scheduled to run daily at 8:00 AM...");

  // Wake up every day at 8:00 AM server time to evaluate autonomous agents
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Wake up: Running Autonomous BrandFlow Agent...');

    try {
      // 1. Fetch all active agents
      const activeAgents = await db
        .select()
        .from(agentSettings)
        .where(eq(agentSettings.isActive, true));

      for (const agent of activeAgents) {
        // 2. Frequency Logic: Check if the agent already scheduled a post for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysPosts = await db
          .select()
          .from(posts)
          .where(
            and(
              eq(posts.projectId, agent.projectId),
              gte(posts.createdAt, startOfDay),
              lte(posts.createdAt, endOfDay)
            )
          );

        if (todaysPosts.length > 0) {
          console.log(`[CRON] Agent ${agent.projectId} already generated a post today. Skipping.`);
          continue;
        }

        // 3. Fetch Knowledge Base for contextual grounding
        const kbRecords = await db
          .select()
          .from(brandKnowledgeBase)
          .where(eq(brandKnowledgeBase.projectId, agent.projectId))
          .limit(1);
        
        if (!kbRecords.length) {
          console.log(`[CRON] Knowledge Base missing for project ${agent.projectId}. Skipping.`);
          continue;
        }
        const brandKb = kbRecords[0];

        // 4. Construct the autonomous system prompt
        const systemPrompt = `You are a world-class, autonomous LinkedIn ghostwriter. Generate a highly engaging, native-feeling LinkedIn post based on the following brand constraints:
        
        - Company Description: ${brandKb.companyDescription}
        - Target Audience: ${brandKb.targetAudience}
        - Tone & Voice: ${brandKb.toneAndVoice}
        - Core Content Pillar / Topic: ${agent.contentTopics}
        
        Constraints:
        - Write ONLY the content of the post.
        - Do not include any meta-text, conversational filler, or quotation marks at the start/end.
        - Use appropriate spacing, line breaks, and professional formatting.
        - Include 3-5 highly relevant hashtags at the bottom.`;

        // 5. Generate content via Groq API
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'system', content: systemPrompt }],
          model: 'llama-3.3-70b-versatile', 
          temperature: 0.7,
        });

        const generatedContent = chatCompletion.choices[0]?.message?.content?.trim();

        if (!generatedContent) {
          console.warn(`[CRON] Groq returned empty content for project ${agent.projectId}`);
          continue;
        }

        // 6. Save the generated post to the database as 'scheduled'
        const scheduledTime = new Date();
        scheduledTime.setHours(scheduledTime.getHours() + 4);

        await db.insert(posts).values({
          projectId: agent.projectId,
          platform: 'linkedin',
          content: generatedContent,
          status: 'scheduled',
          scheduledAt: scheduledTime,
        });

        console.log(`[CRON] ✅ Successfully generated and scheduled post for project ${agent.projectId} at ${scheduledTime.toISOString()}`);
      }
    } catch (error) {
      console.error('[CRON] Critical error in Autonomous Agent Worker:', error);
    }
  });
}