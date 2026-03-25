/**
 * Shared utilities for generating improved resumes (both regular and sample)
 */

import { parseAIResponseAsJSON, extractTextFromAIResponse, cleanMarkdownCodeBlocks } from "./ai-response-parser";
import { extractErrorMessage } from "./error-handler";
import { prepareImprovementInstructions, prepareSampleResumeInstructions } from "../../constants";

interface GenerateResumeOptions {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  feedback?: Feedback;
  pageCount?: number;
  resumePath?: string;
  isSample?: boolean;
}

interface GenerateResumeResult {
  success: boolean;
  improvedResume?: ImprovedResume;
  error?: string;
}

/**
 * Generates an improved resume (either regular or sample)
 * This function DRYs up the logic between sample resume generation and regular improvement
 */
export async function generateImprovedResume(
  ai: {
    chat: (messages: any[], options?: any) => Promise<any>;
    improveResume?: (path: string, message: string) => Promise<any>;
  },
  options: GenerateResumeOptions
): Promise<GenerateResumeResult> {
  const {
    jobTitle,
    jobDescription,
    companyName,
    feedback,
    pageCount,
    resumePath,
    isSample = false,
  } = options;

  try {
    // Validate required parameters for non-sample mode
    if (!isSample && !feedback) {
      return {
        success: false,
        error: "Feedback is required for resume improvement (non-sample mode).",
      };
    }
    // Prepare instructions based on type
    const instructions = isSample
      ? prepareSampleResumeInstructions({ jobTitle, jobDescription, companyName })
      : prepareImprovementInstructions({
          jobTitle,
          jobDescription,
          feedback: feedback as Feedback,
          pageCount,
        });

    // Generate resume using appropriate method
    let response: any;
    if (isSample) {
      // Sample resume: use chat API directly
      response = await ai.chat(
        [
          {
            role: "user",
            content: instructions,
          },
        ],
        { model: "google/gemini-2.0-flash-lite" }
      );
    } else {
      // Regular improvement: use improveResume if available, otherwise fallback to chat
      if (ai.improveResume && resumePath) {
        response = await ai.improveResume(resumePath, instructions);
      } else {
        // Fallback to chat API
        response = await ai.chat(
          [
            {
              role: "user",
              content: instructions,
            },
          ],
          { model: "gpt-5-nano" }
        );
      }
    }

    if (!response) {
      return {
        success: false,
        error: "Failed to generate improved resume. Please try again.",
      };
    }

    // Parse the response
    let parsedResume: ImprovedResume | null = parseAIResponseAsJSON<ImprovedResume>(response);

    if (!parsedResume) {
      // Fallback: try extracting text manually
      const resumeText = extractTextFromAIResponse(response);
      if (resumeText) {
        let cleaned: string | null = null;
        try {
          cleaned = cleanMarkdownCodeBlocks(resumeText);
          parsedResume = JSON.parse(cleaned) as ImprovedResume;
        } catch (parseError: unknown) {
          console.error("Failed to parse improved resume:", parseError);
          
          // Extract error message safely
          const errorMessage = parseError instanceof Error 
            ? parseError.message 
            : typeof parseError === "object" && parseError !== null && "message" in parseError
            ? String((parseError as { message: unknown }).message)
            : String(parseError);
          
          // Log a portion of the problematic JSON for debugging
          const errorPosition = errorMessage.match(/position (\d+)/)?.[1];
          if (errorPosition && cleaned) {
            const pos = parseInt(errorPosition);
            const start = Math.max(0, pos - 200);
            const end = Math.min(cleaned.length, pos + 200);
            console.error("Problematic JSON section:", {
              position: pos,
              context: cleaned.substring(start, end),
              error: errorMessage || "Unknown error",
            });
          }
          
          return {
            success: false,
            error: `Failed to parse improved resume: ${errorMessage || "Invalid JSON format"}. The AI response may contain syntax errors. Please try again.`,
          };
        }
      } else {
        return {
          success: false,
          error: "Failed to extract improved resume from response. The AI did not return valid content.",
        };
      }
    }

    return {
      success: true,
      improvedResume: parsedResume,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to generate improved resume");
    console.error("Error generating improved resume:", error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
