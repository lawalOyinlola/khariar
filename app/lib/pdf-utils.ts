/**
 * Reusable PDF text extraction utilities
 */

import { extractPdfTextFromBlob, type PdfTextExtractionResult } from "./pdf2text";
import { extractErrorMessage } from "./error-handler";

/**
 * Extracts text from a PDF file path (reads from Puter FS)
 */
export async function extractPdfTextFromPath(
  readFile: (path: string) => Promise<Blob | undefined>,
  path: string
): Promise<PdfTextExtractionResult> {
  try {
    const pdfBlob = await readFile(path);
    
    if (!pdfBlob) {
      return {
        text: "",
        pageCount: 0,
        error: "Failed to read PDF file from storage",
      };
    }

    const result = await extractPdfTextFromBlob(pdfBlob);
    return result;
  } catch (error) {
    const errorMessage = extractErrorMessage(
      error,
      "Unknown error occurred during PDF extraction"
    );
    console.error("PDF text extraction failed:", errorMessage);
    return {
      text: "",
      pageCount: 0,
      error: `Failed to extract text from PDF: ${errorMessage}`,
    };
  }
}

/**
 * Validates PDF text extraction result
 */
export function validatePdfExtraction(
  result: PdfTextExtractionResult
): { valid: boolean; error?: string } {
  if (result.error) {
    return {
      valid: false,
      error: result.error,
    };
  }

  if (!result.text || result.text.trim().length === 0) {
    return {
      valid: false,
      error:
        "No text content extracted from PDF. The PDF may be image-based or scanned. Please ensure your resume PDF contains selectable text.",
    };
  }

  return { valid: true };
}
