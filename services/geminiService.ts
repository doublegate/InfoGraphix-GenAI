import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, AspectRatio, GithubFilters, ImageSize, WebSource, InfographicStyle, ColorPalette } from "../types";

// Helper to ensure API Key is ready
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a paid API key.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Centralized error handler for Gemini API errors
 */
const handleGeminiError = (error: any): never => {
  console.error("Gemini API Error:", error);
  const msg = (error.message || error.toString()).toLowerCase();

  if (msg.includes("403") || msg.includes("permission_denied")) {
    throw new Error("Permission denied. Please ensure you have selected a valid API Key for the paid tier project.");
  }
  if (msg.includes("429") || msg.includes("resource_exhausted")) {
    throw new Error("Rate limit exceeded. We're getting too many requests. Please wait a moment and try again.");
  }
  if (msg.includes("503") || msg.includes("unavailable") || msg.includes("overloaded")) {
    throw new Error("The Gemini service is currently overloaded. Please try again in a few seconds.");
  }
  if (msg.includes("400") || msg.includes("invalid_argument")) {
    throw new Error("The request parameters were invalid. Please check your inputs.");
  }
  if (msg.includes("safety") || msg.includes("blocked")) {
     throw new Error("The request was blocked due to safety settings. Please try a different topic or phrasing.");
  }
  if (msg.includes("candidate")) {
    throw new Error("The model could not generate a valid response for this prompt. Please try again.");
  }
  
  throw new Error(`An error occurred: ${error.message || "Unknown error"}`);
};

/**
 * Step 1: Analyze the topic using Gemini 3 Pro with Thinking Mode.
 */
export const analyzeTopic = async (
  topic: string, 
  style: InfographicStyle, 
  palette: ColorPalette, 
  filters?: GithubFilters,
  providedContent?: string
): Promise<AnalysisResult> => {
  const ai = getAI();
  
  let filterContext = "";
  if (filters) {
    const parts = [];
    if (filters.language) parts.push(`Programming Language: ${filters.language}`);
    if (filters.fileExtensions) parts.push(`File Extensions: ${filters.fileExtensions}`);
    if (filters.lastUpdatedAfter) parts.push(`Last Updated After: ${filters.lastUpdatedAfter}`);
    
    if (parts.length > 0) {
      filterContext = `
      STRICT SEARCH FILTERS (Apply these to your analysis if relevant):
      ${parts.join('\n')}
      `;
    }
  }

  let prompt = "";
  
  if (providedContent) {
    prompt = `
    You are an expert technical researcher and data visualizer. 
    Your task is to analyze the following MARKDOWN CONTENT provided by the user.

    Infographic Title/Context: "${topic}"

    ${filterContext}

    1. Analyze the provided markdown content below thoroughly. This is the PRIMARY SOURCE material.
    2. Identify key statistics, technical specifications, historical facts, and structural details suitable for an infographic based on this content.
    3. Plan a visual layout for a high-density infographic based on the following artistic constraints:
       - **Artistic Style**: ${style}
       - **Color Palette**: ${palette}
    
    [START OF USER PROVIDED CONTENT]
    ${providedContent.slice(0, 30000)}
    [END OF USER PROVIDED CONTENT]

    Return the output in purely JSON format. 
    Start the response with { and end with }. 
    Do not wrap the JSON in markdown code blocks (e.g. no \`\`\`json).
    
    Structure:
    {
      "title": "A catchy title for the infographic",
      "summary": "A concise executive summary of the topic (max 100 words)",
      "keyPoints": ["Fact 1", "Fact 2", "Stat 1", "Stat 2", ...],
      "visualPlan": "A highly detailed, descriptive prompt for an image generation model to create this infographic. Ensure the description explicitly enforces the '${style}' style and '${palette}' color palette. Describe the layout, specific visual elements (charts, diagrams, cutaways), and text placement."
    }
    `;
  } else {
    prompt = `
    You are an expert technical researcher and data visualizer. 
    Your task is to deeply analyze the following topic (which may be a URL, a GitHub repo name, or a general subject):
    "${topic}"

    ${filterContext}

    1. Research this topic comprehensively. If it is a URL, infer the content or use your knowledge base.
    2. Identify key statistics, technical specifications, historical facts, and structural details suitable for an infographic.
    3. Plan a visual layout for a high-density infographic based on the following artistic constraints:
       - **Artistic Style**: ${style}
       - **Color Palette**: ${palette}
    
    Return the output in purely JSON format. 
    Start the response with { and end with }. 
    Do not wrap the JSON in markdown code blocks (e.g. no \`\`\`json).
    
    Structure:
    {
      "title": "A catchy title for the infographic",
      "summary": "A concise executive summary of the topic (max 100 words)",
      "keyPoints": ["Fact 1", "Fact 2", "Stat 1", "Stat 2", ...],
      "visualPlan": "A highly detailed, descriptive prompt for an image generation model to create this infographic. Ensure the description explicitly enforces the '${style}' style and '${palette}' color palette. Describe the layout, specific visual elements (charts, diagrams, cutaways), and text placement."
    }
  `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking for deep analysis
        tools: [{ googleSearch: {} }], // Use Google Search for up-to-date info
        // Note: responseMimeType cannot be used with googleSearch tool per guidelines
      },
    });

    let text = response.text;
    if (!text) throw new Error("No analysis generated.");

    // Robust JSON Extraction: Find the first { and the last }
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      text = text.substring(startIndex, endIndex + 1);
    } else {
      // Fallback: simple cleanup if strict braces aren't found
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    // Extract grounding sources
    const webSources: WebSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web) {
          webSources.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri || "#"
          });
        }
      }
    }

    const analysis = JSON.parse(text) as AnalysisResult;
    analysis.webSources = webSources;
    return analysis;

  } catch (error: any) {
    if (error instanceof SyntaxError) {
      console.error("JSON Parse Error. Raw text:", error.message);
      throw new Error("Failed to parse the AI's response. The model output was not valid JSON. Please try again.");
    }
    return handleGeminiError(error);
  }
};

/**
 * Step 2: Generate the Infographic using Gemini 3 Pro Image Preview (Nano Banana Pro).
 */
export const generateInfographicImage = async (
  visualPlan: string,
  size: ImageSize,
  aspectRatio: AspectRatio
): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-3-pro-image-preview';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: visualPlan }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: size, // 1K, 2K, 4K
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response.");
  } catch (error: any) {
    return handleGeminiError(error);
  }
};