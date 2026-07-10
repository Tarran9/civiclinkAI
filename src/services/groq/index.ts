// Groq AI service — complaint description improvement and blood request generation
// NOTE: Groq API calls MUST be proxied via a Supabase Edge Function in production
// to protect the API key. Direct browser calls are used here for development only.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_MODEL = "llama3-8b-8192";
const GROQ_VISION_MODEL = "llama-3.2-11b-vision-preview";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string | GroqContentPart[];
}

interface GroqContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

async function callGroq(messages: GroqMessage[], model = GROQ_MODEL): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ============================================================
// COMPLAINT AI
// ============================================================

export interface ComplaintAiResult {
  improvedDescription: string;
  priority: "low" | "medium" | "high" | "critical";
  department: string;
  reasoning: string;
}

export async function improveComplaintWithAI(
  title: string,
  description: string,
  category: string
): Promise<ComplaintAiResult> {
  const prompt = `You are a civic issue management AI assistant. Analyze this citizen complaint and respond with a JSON object only (no markdown).

Complaint:
- Title: ${title}
- Category: ${category}
- Description: ${description}

Respond with this exact JSON structure:
{
  "improvedDescription": "Improved, clear and professional version of the complaint",
  "priority": "low|medium|high|critical",
  "department": "Exact department name responsible",
  "reasoning": "Brief explanation of priority assignment"
}`;

  const content = await callGroq([{ role: "user", content: prompt }]);

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    return JSON.parse(jsonMatch[0]) as ComplaintAiResult;
  } catch {
    return {
      improvedDescription: description,
      priority: "medium",
      department: "Municipal Corporation",
      reasoning: "AI analysis unavailable",
    };
  }
}

// ============================================================
// BLOOD REQUEST AI
// ============================================================

export interface BloodRequestAiResult {
  emergencyMessage: string;
  summary: string;
}

export async function generateBloodRequestAI(params: {
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  hospitalName: string;
  urgency: string;
  requiredBy: string;
}): Promise<BloodRequestAiResult> {
  const prompt = `Generate an emergency blood donation request message and summary. Respond with JSON only.

Request details:
- Patient: ${params.patientName}
- Blood Group: ${params.bloodGroup}
- Units Required: ${params.unitsRequired}
- Hospital: ${params.hospitalName}
- Urgency: ${params.urgency}
- Required By: ${params.requiredBy}

Respond with:
{
  "emergencyMessage": "Compelling, urgent message to broadcast to potential donors (2-3 sentences)",
  "summary": "Brief professional summary for the request listing (1 sentence)"
}`;

  const content = await callGroq([{ role: "user", content: prompt }]);

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return JSON.parse(jsonMatch[0]) as BloodRequestAiResult;
  } catch {
    return {
      emergencyMessage: `Urgent: ${params.bloodGroup} blood needed for ${params.patientName} at ${params.hospitalName}.`,
      summary: `${params.unitsRequired} unit(s) of ${params.bloodGroup} blood required urgently.`,
    };
  }
}

// ============================================================
// GROQ VISION — Image Analysis
// ============================================================

export interface VisionAnalysisResult {
  category: string;
  confidence: number;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  tags: string[];
  suggestedTitle: string;
}

export async function analyzeComplaintImageWithVision(
  imageBase64: string,
  mimeType: string
): Promise<VisionAnalysisResult> {
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  const messages: GroqMessage[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Analyze this civic complaint image and identify the issue. Respond with JSON only:
{
  "category": "garbage|pothole|street_light|water_leakage|illegal_dumping|drainage|tree_fallen|others",
  "confidence": 0.0-1.0,
  "description": "Detailed description of what you see",
  "severity": "low|medium|high|critical",
  "tags": ["relevant", "keywords"],
  "suggestedTitle": "Concise complaint title"
}`,
        },
        {
          type: "image_url",
          image_url: { url: dataUrl },
        },
      ],
    },
  ];

  const content = await callGroq(messages, GROQ_VISION_MODEL);

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    return JSON.parse(jsonMatch[0]) as VisionAnalysisResult;
  } catch {
    return {
      category: "others",
      confidence: 0,
      description: "Image analysis unavailable",
      severity: "medium",
      tags: [],
      suggestedTitle: "Civic Issue",
    };
  }
}
