import { Router } from "express";
import { Groq } from "groq-sdk";
import { requireAuth } from "../middleware/auth";
import { db } from "@workspace/db";
import { brandKnowledgeBase } from "@workspace/db/schema";
import crypto from "crypto";

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/content", requireAuth, async (req, res) => {
  try {
    const {
      prompt,
      tone,
      format,
      useBrandVoice,
      includeHashtags,
      includeEmojis,
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    let brandContext = "";

    // RAG: Fetch Brand Context if enabled
    if (useBrandVoice) {
      const records = await db.select().from(brandKnowledgeBase).limit(1);
      if (records.length > 0) {
        const kb = records[0];
        brandContext = `
          BRAND CONTEXT:
          - Company Description: ${kb.companyDescription || "N/A"}
          - Mission Statement: ${kb.missionStatement || "N/A"}
          - Target Audience: ${kb.targetAudience || "N/A"}
          - Brand Tone & Voice: ${kb.toneAndVoice || "N/A"}
          
          You MUST adhere strictly to this brand identity and tone.
        `;
      }
    }

    // Construct the System Prompt optimized purely for LinkedIn
    const systemPrompt = `
      You are an expert B2B Copywriter and LinkedIn Ghostwriter.
      Your task is to write highly engaging content based on the user's topic.
      
      REQUIREMENTS:
      - Target Platform: LinkedIn ONLY
      - Formatted as: ${format || "Standard Post"}
      - Tone: ${tone || "Professional"}
      - Emojis: ${includeEmojis ? "Use appropriate emojis to enhance readability." : "DO NOT use emojis."}
      - Hashtags: ${includeHashtags ? "Include 2-4 highly relevant niche hashtags at the very end." : "DO NOT use hashtags."}
      
      ${brandContext}
      
      OUTPUT FORMAT:
      Generate 3 distinct, high-quality LinkedIn post options based on the topic:
      1. Option 1: A story-driven, engaging post with a clear hook.
      2. Option 2: A highly actionable, listicle-style post (e.g., "3 ways to...").
      3. Option 3: A concise, punchy, thought-provoking post.

      You must respond with a strictly valid JSON object. Do not include markdown code blocks like \`\`\`json. 
      The JSON object must contain a single key "results" which is an array of exactly 3 objects. 
      Each object must have exactly one key: "content" (the generated text string).
    `;

    const userMessage = `Topic: ${prompt}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("Empty response received from Groq.");
    }

    const parsedData = JSON.parse(responseContent);

    // Map to include character counts and unique IDs for the frontend selection UI
    const variations = parsedData.results.map((item: any) => ({
      id: crypto.randomUUID(),
      content: item.content,
      characterCount: item.content.length,
    }));

    return res.json({ variations });
  } catch (error) {
    console.error("Content Generation Agent Error:", error);
    return res.status(500).json({ error: "Failed to generate content." });
  }
});

export default router;