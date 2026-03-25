/**
 * Utility functions for parsing AI responses
 */

/**
 * Type guard to check if error has a message property
 */
function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

/**
 * Extracts error message from unknown error type
 */
function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

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
      (item: any) => item.type === "text" && item.text,
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

  // Remove any leading/trailing text that's not JSON
  // Try to find the first { and last } to extract just the JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

/**
 * Attempts to fix common JSON issues
 */
function fixCommonJSONIssues(jsonString: string): string {
  let fixed = jsonString;

  // Fix trailing commas in arrays
  fixed = fixed.replace(/,(\s*[}\]])/g, "$1");

  // Fix trailing commas in objects
  fixed = fixed.replace(/,(\s*})/g, "$1");

  // Fix unescaped quotes in strings (basic attempt)
  // This is tricky, so we'll be conservative
  // Remove JS-style comments while preserving quoted strings
  fixed = fixed.replace(
    /("(?:[^"\\]|\\.)*")|\/\*[\s\S]*?\*\/|\/\/[^\n\r]*/g,
    (_match, quotedString) => quotedString || "",
  );

  return fixed;
}

/**
 * Parses AI response and extracts JSON content
 * Attempts multiple strategies to parse malformed JSON
 */
export function parseAIResponseAsJSON<T = any>(response: AIResponse): T | null {
  try {
    const text = extractTextFromAIResponse(response);
    if (!text) {
      return null;
    }

    let cleaned = cleanMarkdownCodeBlocks(text);

    // Strategy 1: Try parsing directly
    try {
      return JSON.parse(cleaned) as T;
    } catch (firstError) {
      console.warn("Direct JSON parse failed, attempting fixes...", firstError);

      // Strategy 2: Try fixing common JSON issues
      try {
        const fixed = fixCommonJSONIssues(cleaned);
        return JSON.parse(fixed) as T;
      } catch (secondError) {
        console.warn(
          "Fixed JSON parse failed, trying to extract JSON object...",
          secondError,
        );

        // Strategy 3: Try to extract just the JSON object more aggressively
        // Look for the largest valid JSON object
        const jsonStart = cleaned.indexOf("{");
        if (jsonStart !== -1) {
          let braceCount = 0;
          let jsonEnd = -1;

          for (let i = jsonStart; i < cleaned.length; i++) {
            if (cleaned[i] === "{") braceCount++;
            if (cleaned[i] === "}") braceCount--;
            if (braceCount === 0) {
              jsonEnd = i;
              break;
            }
          }

          if (jsonEnd !== -1) {
            const extracted = cleaned.substring(jsonStart, jsonEnd + 1);
            try {
              return JSON.parse(extracted) as T;
            } catch (thirdError) {
              // Try fixing the extracted JSON
              try {
                const fixedExtracted = fixCommonJSONIssues(extracted);
                return JSON.parse(fixedExtracted) as T;
              } catch (fourthError: unknown) {
                // Extract error position for better debugging
                const fourthErrorMessage = getErrorMessage(fourthError);
                const errorPosMatch =
                  fourthErrorMessage.match(/position (\d+)/);
                const errorPos = errorPosMatch
                  ? parseInt(errorPosMatch[1])
                  : null;

                let errorContext = "";
                if (errorPos !== null && errorPos < extracted.length) {
                  const contextStart = Math.max(0, errorPos - 100);
                  const contextEnd = Math.min(extracted.length, errorPos + 100);
                  errorContext = extracted.substring(contextStart, contextEnd);
                }

                console.error("All JSON parsing strategies failed:", {
                  original: getErrorMessage(firstError),
                  fixed: getErrorMessage(secondError),
                  extracted: getErrorMessage(thirdError),
                  fixedExtracted: fourthErrorMessage,
                  errorPosition: errorPos,
                  errorContext,
                  textLength: text.length,
                  cleanedLength: cleaned.length,
                  extractedLength: extracted.length,
                  jsonStart,
                  jsonEnd,
                });
                return null;
              }
            }
          }
        }

        console.error(
          "Failed to parse AI response as JSON after all strategies:",
          {
            original: firstError,
            fixed: secondError,
            textPreview: text.substring(0, 500),
          },
        );
        return null;
      }
    }
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
