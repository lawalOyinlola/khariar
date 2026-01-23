export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
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
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("PDF.js import error:", errorMessage, err);
      throw new Error(`Failed to load PDF.js library: ${errorMessage}`);
    });

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    let lib;
    try {
      lib = await loadPdfJs();
    } catch (loadError) {
      const errorMessage = loadError instanceof Error ? loadError.message : String(loadError);
      console.error("Failed to load PDF.js library:", loadError);
      return {
        imageUrl: "",
        file: null,
        error: `Failed to load PDF.js library: ${errorMessage}. Please ensure the PDF.js worker file is available.`,
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    let pdf;
    try {
      pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    } catch (pdfError) {
      const errorMessage = pdfError instanceof Error ? pdfError.message : String(pdfError);
      console.error("Failed to load PDF document:", pdfError);
      return {
        imageUrl: "",
        file: null,
        error: `Failed to load PDF document: ${errorMessage}. The file may be corrupted or not a valid PDF.`,
      };
    }
    
    let page;
    try {
      page = await pdf.getPage(1);
    } catch (pageError) {
      const errorMessage = pageError instanceof Error ? pageError.message : String(pageError);
      console.error("Failed to get PDF page:", pageError);
      return {
        imageUrl: "",
        file: null,
        error: `Failed to get PDF page: ${errorMessage}. The PDF may be empty or corrupted.`,
      };
    }

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to get canvas 2d context",
      };
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    await page.render({ canvasContext: context, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("PDF to image conversion error:", err);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${errorMessage}`,
    };
  }
}
