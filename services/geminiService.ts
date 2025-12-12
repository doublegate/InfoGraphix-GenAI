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
 * Detect if topic contains multiple URLs
 * Supports newline-separated or comma-separated URLs
 */
const parseMultipleUrls = (topic: string): string[] | null => {
  // Split by newlines or commas
  const candidates = topic.split(/[\n,]/).map(s => s.trim()).filter(s => s.length > 0);

  // Check if we have multiple items and at least 2 are URLs
  if (candidates.length <= 1) return null;

  const urlCount = candidates.filter(s =>
    s.startsWith('http://') || s.startsWith('https://')
  ).length;

  // If at least 2 URLs, treat as multi-URL input
  return urlCount >= 2 ? candidates : null;
};

/**
 * Detect if topic is a GitHub repository
 */
const isGitHubRepo = (topic: string): boolean => {
  return topic.includes('github.com/') ||
         (topic.split('/').length === 2 && !topic.includes('http') && !topic.includes(' '));
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

  // Detect multi-URL input
  const multipleUrls = parseMultipleUrls(topic);
  const isGitHub = isGitHubRepo(topic);

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
  } else if (multipleUrls) {
    // Multi-URL analysis prompt
    prompt = `
    You are an expert technical researcher and data visualizer specializing in cross-source synthesis.
    Your task is to analyze MULTIPLE URLs/topics and create a UNIFIED, COMPARATIVE infographic.

    **Sources to Analyze:**
    ${multipleUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

    ${filterContext}

    **Instructions:**
    1. Research ALL sources comprehensively using Google Search
    2. Identify COMMON THEMES, CONTRASTS, and RELATIONSHIPS across sources
    3. Extract key statistics, facts, and insights that work well for COMPARISON
    4. Create a UNIFIED narrative that synthesizes insights from all sources
    5. Plan a visual layout that COMPARES/CONTRASTS or INTEGRATES these sources
       - **Artistic Style**: ${style}
       - **Color Palette**: ${palette}

    **Focus Areas:**
    - What patterns emerge across all sources?
    - What unique insights does each source provide?
    - How can we visualize the relationship between these sources?

    Return the output in purely JSON format.
    Start the response with { and end with }.
    Do not wrap the JSON in markdown code blocks.

    Structure:
    {
      "title": "A unified title that encompasses all sources",
      "summary": "A synthesis of insights from ALL sources (max 150 words)",
      "keyPoints": ["Comparative Insight 1", "Cross-source Pattern 1", "Key Finding from Source 1", "Key Finding from Source 2", ...],
      "visualPlan": "A detailed prompt for an image generation model to create a COMPARATIVE/UNIFIED infographic. Enforce the '${style}' style and '${palette}' palette. Describe layout sections for each source, comparison elements, and how sources relate visually."
    }
    `;
  } else if (isGitHub) {
    // Enhanced GitHub repository analysis
    prompt = `
    You are an expert software architecture analyst and technical documentation specialist.
    Your task is to deeply analyze the following GitHub repository:
    "${topic}"

    ${filterContext}

    **Analysis Requirements:**
    1. Research the repository using Google Search to understand:
       - Purpose and main functionality
       - Technology stack and architecture patterns
       - Key components and their relationships
       - Project structure (folders, modules, packages)
       - Notable features, algorithms, or innovations
       - Community adoption (stars, forks, contributors if available)
       - Documentation quality and API design

    2. Create an infographic that visualizes:
       - **Architecture Diagram**: Component relationships and data flow
       - **Tech Stack**: Languages, frameworks, dependencies
       - **Project Statistics**: Size metrics, activity, popularity
       - **Key Features**: Main capabilities and use cases
       - **File/Folder Structure**: High-level organization

    3. Design for the following artistic constraints:
       - **Artistic Style**: ${style}
       - **Color Palette**: ${palette}

    Return the output in purely JSON format.
    Start the response with { and end with }.
    Do not wrap the JSON in markdown code blocks.

    Structure:
    {
      "title": "Repository name + tagline (e.g., 'Linux Kernel: The Foundation of Modern Computing')",
      "summary": "Technical overview of the repository's purpose, architecture, and significance (max 120 words)",
      "keyPoints": ["Architecture Pattern", "Main Tech Stack", "Key Component 1", "Key Component 2", "Notable Feature", "Project Stats", ...],
      "visualPlan": "Detailed prompt for generating a TECHNICAL ARCHITECTURE infographic. Include: component diagram layout, technology badges/icons, folder structure tree, metrics dashboard. Enforce '${style}' style and '${palette}' palette. Be specific about technical diagram elements."
    }
    `;
  } else {
    // Standard single-topic analysis
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