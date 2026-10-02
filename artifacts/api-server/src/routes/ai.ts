import { Router, type IRouter } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GenerateContentBody,
  GenerateContentResponse,
  GenerateHashtagsBody,
  GenerateHashtagsResponse,
  GenerateReplyBody,
  GenerateReplyResponse,
  AiChatBody,
  AiChatResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { db, brandsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function getAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
}

router.post("/ai/generate", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = GenerateContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { topic, platform, tone, includeHashtags, includeEmojis, variations } = parsed.data;

  // Fetch brand context
  const [brand] = await db.select().from(brandsTable).where(eq(brandsTable.userId, userId));

  const brandContext = brand
    ? `Brand: ${brand.name}. ${brand.description ?? ""}. Tone of voice: ${brand.toneOfVoice ?? tone ?? "professional"}.`
    : "";

  const platformLimits: Record<string, number> = {
    twitter: 280,
    linkedin: 3000,
    instagram: 2200,
    facebook: 63206,
  };

  const count = variations ?? 3;

  const prompt = `You are a social media content expert. Generate ${count} variations of a social media post.

${brandContext}

Platform: ${platform} (max ${platformLimits[platform] ?? 2200} characters)
Topic: ${topic}
Tone: ${tone ?? "professional"}
Include hashtags: ${includeHashtags ?? true}
Include emojis: ${includeEmojis ?? false}

Return a JSON object with a "variations" array. Each item has:
- "content": the main post text
- "hashtags": relevant hashtags string (e.g. "#marketing #branding")
- "cta": a call to action phrase

Return ONLY valid JSON, no markdown.`;

  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
    const parsed2 = JSON.parse(text);

    res.json(GenerateContentResponse.parse(parsed2));
  } catch (err: any) {
    req.log.error({ err }, "AI generate failed");
    // Fallback response
    res.json(
      GenerateContentResponse.parse({
        variations: Array.from({ length: count }, (_, i) => ({
          content: `${topic} — Here's why this matters for your audience on ${platform}. Stay ahead of trends and connect authentically. (Variation ${i + 1})`,
          hashtags: `#${topic.replace(/\s+/g, "")} #${platform} #marketing`,
          cta: "Learn more and share your thoughts below.",
        })),
      }),
    );
  }
});

router.post("/ai/hashtags", requireAuth, async (req, res): Promise<void> => {
  const parsed = GenerateHashtagsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { content, platform, count } = parsed.data;
  const num = count ?? 10;

  const prompt = `Generate ${num} highly relevant hashtags for this ${platform ?? "social media"} post. Return ONLY a JSON object with a "hashtags" array of strings (no # prefix needed in the strings). Post: "${content}"`;

  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(text);

    res.json(GenerateHashtagsResponse.parse({ hashtags: data.hashtags ?? [] }));
  } catch {
    const words = content.split(" ").slice(0, num);
    res.json(GenerateHashtagsResponse.parse({ hashtags: words.map((w) => w.replace(/\W/g, "")) }));
  }
});

router.post("/ai/reply", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = GenerateReplyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [brand] = await db.select().from(brandsTable).where(eq(brandsTable.userId, userId));
  const brandName = brand?.name ?? "our brand";
  const brandTone = brand?.toneOfVoice ?? "professional and friendly";

  const prompt = `You are a community manager for ${brandName}. Respond to this comment in a ${brandTone} tone. Context: ${parsed.data.context ?? "general engagement"}.

Comment: "${parsed.data.commentText}"

Return ONLY a JSON object with:
- "reply": the reply text (concise, max 280 chars)
- "sentiment": "positive", "neutral", or "negative" (the sentiment of the original comment)`;

  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(text);
    res.json(GenerateReplyResponse.parse({ reply: data.reply, sentiment: data.sentiment ?? "neutral" }));
  } catch {
    res.json(
      GenerateReplyResponse.parse({
        reply: `Thank you for your comment! We appreciate your engagement. Feel free to reach out if you have any questions.`,
        sentiment: "neutral",
      }),
    );
  }
});

router.post("/ai/chat", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [brand] = await db.select().from(brandsTable).where(eq(brandsTable.userId, userId));
  const brandContext = brand
    ? `You are the AI assistant for ${brand.name}. Their brand voice is: ${brand.toneOfVoice ?? "professional"}. Industry: ${brand.industry ?? "general"}.`
    : "You are BrandFlow AI, an expert social media marketing assistant.";

  const prompt = `${brandContext}

User message: ${parsed.data.message}

Respond helpfully with social media marketing expertise. Be concise but thorough.`;

  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json(
      AiChatResponse.parse({
        response,
        conversationId: parsed.data.conversationId ?? `conv_${Date.now()}`,
      }),
    );
  } catch {
    res.json(
      AiChatResponse.parse({
        response:
          "I'm here to help with your social media strategy! I can assist with content ideas, hashtag recommendations, engagement tips, and brand voice guidance. What would you like to work on today?",
        conversationId: parsed.data.conversationId ?? `conv_${Date.now()}`,
      }),
    );
  }
});

export default router;
