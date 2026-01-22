/**
 * Utility functions for parsing AI responses
 */

/**
 * Extracts text content from an AI response message
 */
export function extractTextFromAIResponse(response: AIResponse): string | null {
  if (!response?.message?.content) {
    return null;
  }

  const content = response.message.content;

  // Handle string content
  if (typeof content === "string") {
    return content;
  }

  // Handle array content (e.g., from OpenAI format)
  if (Array.isArray(content)) {
    // Find text item in array
    const textItem = content.find(
      (item: any) => item.type === "text" && item.text
    );
    if (textItem?.text) {
      return textItem.text;
    }
    // Fallback to first item with text property
    if (content[0]?.text) {
      return content[0].text;
    }
  }

  return null;
}

/**
 * Cleans markdown code blocks from text
 */
export function cleanMarkdownCodeBlocks(text: string): string {
  let cleaned = text.trim();

  // Remove JSON code blocks
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  } 
  // Remove generic code blocks
  else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  return cleaned;
}

/**
 * Parses AI response and extracts JSON content
 */
export function parseAIResponseAsJSON<T = any>(response: AIResponse): T | null {
  try {
    const text = extractTextFromAIResponse(response);
    if (!text) {
      return null;
    }

    const cleaned = cleanMarkdownCodeBlocks(text);
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", error);
    return null;
  }
}

/**
 * Validates AI response and checks for refusals
 */
export function validateAIResponse(response: AIResponse | undefined | null): {
  valid: boolean;
  error?: string;
} {
  if (!response) {
    return {
      valid: false,
      error: "AI returned undefined or null response",
    };
  }

  if (response.message?.refusal) {
    return {
      valid: false,
      error: `AI refused the request: ${response.message.refusal}`,
    };
  }

  return { valid: true };
}
