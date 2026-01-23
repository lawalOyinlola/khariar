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
    // Prepare instructions based on type
    const instructions = isSample
      ? prepareSampleResumeInstructions({ jobTitle, jobDescription, companyName })
      : prepareImprovementInstructions({
          jobTitle,
          jobDescription,
          feedback: feedback!,
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
    let parsedResume: ImprovedResume | null = parseAIResponseAsJSON(response as any);

    if (!parsedResume) {
      // Fallback: try extracting text manually
      const resumeText = extractTextFromAIResponse(response as any);
      if (resumeText) {
        try {
          const cleaned = cleanMarkdownCodeBlocks(resumeText);
          parsedResume = JSON.parse(cleaned) as ImprovedResume;
        } catch (parseError: any) {
          console.error("Failed to parse improved resume:", parseError);
          
          // Log a portion of the problematic JSON for debugging
          const errorPosition = parseError.message?.match(/position (\d+)/)?.[1];
          if (errorPosition) {
            const pos = parseInt(errorPosition);
            const start = Math.max(0, pos - 200);
            const end = Math.min(resumeText.length, pos + 200);
            console.error("Problematic JSON section:", {
              position: pos,
              context: cleaned.substring(start, end),
              error: parseError.message,
            });
          }
          
          return {
            success: false,
            error: `Failed to parse improved resume: ${parseError.message || "Invalid JSON format"}. The AI response may contain syntax errors. Please try again.`,
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
