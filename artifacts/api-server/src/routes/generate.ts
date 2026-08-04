import { brandKnowledgeBase, db } from "@workspace/db";
import { Router } from "express";
import { Groq } from "groq-sdk";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/content", requireAuth, async (req, res) => {
  try {
    const {
      prompt,
      platforms,
      tone,
      format,
      useBrandVoice,
      includeHashtags,
      includeEmojis,
    } = req.body;

    if (!prompt || !platforms || !platforms.length) {
      return res.status(400).json({ error: "Prompt and at least one platform are required." });
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

    // Construct the System Prompt
    const systemPrompt = `
      You are an expert Social Media Strategist and AI Copywriter.
      Your task is to write highly engaging, platform-optimized content based on the user's topic.
      
      REQUIREMENTS:
      - Formatted as: ${format}
      - Tone: ${tone}
      - Emojis: ${includeEmojis ? "Use appropriate emojis to enhance readability." : "DO NOT use emojis."}
      - Hashtags: ${includeHashtags ? "Include 2-4 highly relevant niche hashtags." : "DO NOT use hashtags."}
      
      PLATFORM RULES:
      - X (Twitter): Crisp, engaging, strictly under 280 characters.
      - LinkedIn: Professional, story-driven, networking-focused. Spaced out paragraphs.
      - Instagram: Visual-first hook, engaging caption, highly stylized.
      - Facebook: Conversational, community-focused, encourages comments.

      ${brandContext}
      
      OUTPUT FORMAT:
      You must respond with a strictly valid JSON object. Do not include markdown code blocks like \`\`\`json. 
      The JSON object must contain a single key "results" which is an array of objects. 
      Each object must have "platform" (the platform ID) and "content" (the generated text).
    `;

    const userMessage = `Generate content for the following platforms: ${platforms.join(", ")}.\n\nTopic: ${prompt}`;

    // Call Groq using OpenAI (excellent for fast, instruction-following tasks)
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      model: "openai/gpt-oss-120b", // Using the 120b model for high-quality copywriting
      temperature: 0.7,
      response_format: { type: "json_object" }, // Enforce JSON mode
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("Empty response received from Groq.");
    }

    // Parse the JSON response
    const parsedData = JSON.parse(responseContent);

    // Map to include character counts and unique IDs for the frontend
    const variations = parsedData.results.map((item: any) => ({
      id: crypto.randomUUID(),
      platform: item.platform.toLowerCase(),
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