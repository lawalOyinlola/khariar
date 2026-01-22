export interface PdfTextExtractionResult {
  text: string;
  pageCount: number;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs")
    .then(async (lib) => {
      // Use worker from public folder (copied from node_modules to match version)
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      pdfjsLib = lib;
      isLoading = false;
      return lib;
    })
    .catch((err) => {
      isLoading = false;
      loadPromise = null;
      console.error("PDF.js import error:", err);
      throw err;
    });

  return loadPromise;
}

/**
 * Extracts text from all pages of a PDF file
 * @param file - The PDF file to extract text from
 * @returns Promise with extracted text and page count
 */
export async function extractPdfText(
  file: File
): Promise<PdfTextExtractionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    
    const pageCount = pdf.numPages;
    console.log(`Extracting text from ${pageCount} page(s) of PDF...`);

    const textParts: string[] = [];

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items from the page
      const pageText = textContent.items
        .map((item: any) => {
          // Handle both string and text item formats
          if (typeof item === "string") {
            return item;
          }
          // Handle text items with str property
          if (item.str) {
            return item.str;
          }
          return "";
        })
        .filter((text: string) => text.trim().length > 0)
        .join(" ");

      if (pageText.trim()) {
        // Add page separator for multi-page documents
        if (pageCount > 1) {
          textParts.push(`--- Page ${pageNum} of ${pageCount} ---`);
        }
        textParts.push(pageText);
      }
    }

    const fullText = textParts.join("\n\n");
    
    console.log(`Successfully extracted ${fullText.length} characters from ${pageCount} page(s)`);
    
    if (!fullText.trim()) {
      return {
        text: "",
        pageCount,
        error: "No text content found in PDF. The PDF may be image-based or scanned.",
      };
    }

    return {
      text: fullText,
      pageCount,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Failed to extract PDF text:", errorMessage);
    return {
      text: "",
      pageCount: 0,
      error: `Failed to extract text from PDF: ${errorMessage}`,
    };
  }
}

/**
 * Extracts text from a PDF file stored in the file system (using Blob)
 * @param pdfBlob - The PDF Blob to extract text from
 * @returns Promise with extracted text and page count
 */
export async function extractPdfTextFromBlob(
  pdfBlob: Blob
): Promise<PdfTextExtractionResult> {
  try {
    // Convert Blob to File-like object for pdfjs
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const lib = await loadPdfJs();
    
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    console.log(`Extracting text from ${pageCount} page(s) of PDF...`);

    const textParts: string[] = [];

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items from the page
      const pageText = textContent.items
        .map((item: any) => {
          // Handle both string and text item formats
          if (typeof item === "string") {
            return item;
          }
          // Handle text items with str property
          if (item.str) {
            return item.str;
          }
          return "";
        })
        .filter((text: string) => text.trim().length > 0)
        .join(" ");

      if (pageText.trim()) {
        // Add page separator for multi-page documents
        if (pageCount > 1) {
          textParts.push(`--- Page ${pageNum} of ${pageCount} ---`);
        }
        textParts.push(pageText);
      }
    }

    const fullText = textParts.join("\n\n");
    
    console.log(`Successfully extracted ${fullText.length} characters from ${pageCount} page(s)`);
    
    if (!fullText.trim()) {
      return {
        text: "",
        pageCount,
        error: "No text content found in PDF. The PDF may be image-based or scanned.",
      };
    }

    return {
      text: fullText,
      pageCount,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Failed to extract PDF text from blob:", errorMessage);
    return {
      text: "",
      pageCount: 0,
      error: `Failed to extract text from PDF: ${errorMessage}`,
    };
  }
}
