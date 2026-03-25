import { create } from "zustand";
import { extractErrorMessage } from "./error-handler";
import { extractPdfTextFromPath, validatePdfExtraction } from "./pdf-utils";
import { validateAIResponse, extractTextFromAIResponse } from "./ai-response-parser";
import { showErrorFromException, showLoading, dismissToast } from "./toast";

declare global {
  interface Window {
    puter: {
      auth: {
        getUser: () => Promise<PuterUser>;
        isSignedIn: () => Promise<boolean>;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
      };
      fs: {
        write: (
          path: string,
          data: string | File | Blob
        ) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob>;
        upload: (file: File[] | Blob[]) => Promise<FSItem>;
        delete: (path: string) => Promise<void>;
        readdir: (path: string) => Promise<FSItem[] | undefined>;
      };
      ai: {
        chat: (
          prompt: string | ChatMessage[],
          imageURL?: string | PuterChatOptions,
          testMode?: boolean,
          options?: PuterChatOptions
        ) => Promise<Object>;
        img2txt: (
          image: string | File | Blob,
          testMode?: boolean
        ) => Promise<string>;
      };
      kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        list: (pattern: string, returnValues?: boolean) => Promise<string[]>;
        flush: () => Promise<boolean>;
      };
    };
  }
}

interface PuterStore {
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;
  auth: {
    user: PuterUser | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    getUser: () => PuterUser | null;
  };
  fs: {
    write: (
      path: string,
      data: string | File | Blob
    ) => Promise<File | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
  };
  ai: {
    chat: (
      prompt: string | ChatMessage[],
      imageURL?: string | PuterChatOptions,
      testMode?: boolean,
      options?: PuterChatOptions
    ) => Promise<AIResponse | undefined>;
    feedback: (
      path: string,
      message: string,
      pageCount?: number
    ) => Promise<AIResponse | undefined>;
    validatePdf: (
      path: string
    ) => Promise<{ isValid: boolean; fileType?: string; description?: string } | undefined>;
    improveResume: (
      path: string,
      message: string
    ) => Promise<AIResponse | undefined>;
    img2txt: (
      image: string | File | Blob,
      testMode?: boolean
    ) => Promise<string | undefined>;
  };
  kv: {
    get: (key: string) => Promise<string | null | undefined>;
    set: (key: string, value: string) => Promise<boolean | undefined>;
    delete: (key: string) => Promise<boolean | undefined>;
    list: (
      pattern: string,
      returnValues?: boolean
    ) => Promise<string[] | KVItem[] | undefined>;
    flush: () => Promise<boolean | undefined>;
  };

  init: () => void;
  clearError: () => void;
}

const getPuter = (): typeof window.puter | null =>
  typeof window !== "undefined" && window.puter ? window.puter : null;

export const usePuterStore = create<PuterStore>((set, get) => {
  const createAuthState = (
    user: PuterUser | null,
    isAuthenticated: boolean
  ) => ({
    user,
    isAuthenticated,
    signIn: () => signIn(),
    signOut: () => signOut(),
    refreshUser: () => refreshUser(),
    checkAuthStatus: () => checkAuthStatus(),
    getUser: () => get().auth.user,
  });

  const setError = (msg: string) => {
    const { puterReady } = get();
    // Don't show errors if Puter.js is still loading
    if (!puterReady) {
      // Just set the error state silently, don't show toast
      set({
        error: msg,
        isLoading: false,
        auth: createAuthState(null, false),
      });
      return;
    }
    
    // Only show toast if Puter.js has finished loading (either successfully or failed)
    set({
      error: msg,
      isLoading: false,
      auth: createAuthState(null, false),
    });
    showErrorFromException(msg, "An error occurred");
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    const puter = getPuter();
    const { puterReady } = get();
    
    // If Puter.js is not available but still loading, just return false silently
    if (!puter && !puterReady) {
      return false;
    }
    
    if (!puter) {
      setError("Puter.js not available");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const isSignedIn = await puter.auth.isSignedIn();
      if (isSignedIn) {
        const user = await puter.auth.getUser();
        set({
          auth: createAuthState(user, true),
          isLoading: false,
        });
        return true;
      } else {
        set({
          auth: createAuthState(null, false),
          isLoading: false,
        });
        return false;
      }
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to check auth status");
      setError(msg);
      return false;
    }
  };

  const signIn = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signIn();
      await checkAuthStatus();
    } catch (err) {
      const msg = extractErrorMessage(err, "Sign in failed");
      setError(msg);
    }
  };

  const signOut = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signOut();
      set({
        auth: createAuthState(null, false),
        isLoading: false,
      });
    } catch (err) {
      const msg = extractErrorMessage(err, "Sign out failed");
      setError(msg);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await puter.auth.getUser();
      set({
        auth: createAuthState(user, true),
        isLoading: false,
      });
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to refresh user");
      setError(msg);
    }
  };

  // Poll for Puter.js availability every 100ms for up to 10 seconds
  // This handles the case where the external script loads asynchronously
  let pollingInterval: NodeJS.Timeout | null = null;
  let pollingTimeout: NodeJS.Timeout | null = null;
  let loadingToastId: string | number | null = null;

  const init = (): void => {
    // Clean up any existing timers
    if (pollingInterval) clearInterval(pollingInterval);
    if (pollingTimeout) clearTimeout(pollingTimeout);
    if (loadingToastId) {
      dismissToast(loadingToastId);
      loadingToastId = null;
    }

    const puter = getPuter();
    if (puter) {
      set({ puterReady: true });
      checkAuthStatus();
      return;
    }

    // Show loading toast
    loadingToastId = showLoading("Initializing...");

    pollingInterval = setInterval(() => {
      if (getPuter()) {
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = null;
        if (loadingToastId) {
          dismissToast(loadingToastId);
          loadingToastId = null;
        }
        set({ puterReady: true });
        checkAuthStatus();
      }
    }, 100);

    pollingTimeout = setTimeout(() => {
      if (pollingInterval) clearInterval(pollingInterval);
      pollingInterval = null;
      pollingTimeout = null;
      if (loadingToastId) {
        dismissToast(loadingToastId);
        loadingToastId = null;
      }
      // Mark as ready (even if failed) so we can show errors
      set({ puterReady: true });
      if (!getPuter()) {
        setError("Puter.js failed to load within 10 seconds");
      }
    }, 10000);
  };

  const write = async (path: string, data: string | File | Blob) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.write(path, data);
  };

  const readDir = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.readdir(path);
  };

  const readFile = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.read(path);
  };

  const upload = async (files: File[] | Blob[]) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.upload(files);
  };

  const deleteFile = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.delete(path);
  };

  const chat = async (
    prompt: string | ChatMessage[],
    imageURL?: string | PuterChatOptions,
    testMode?: boolean,
    options?: PuterChatOptions
  ) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.chat(prompt, imageURL, testMode, options) as Promise<
      AIResponse | undefined
    >;
  };

  const feedback = async (path: string, message: string, pageCount?: number) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    try {
      console.log("Calling Puter AI with PDF file path:", path);
      console.log("Message length:", message.length);
      console.log("Message preview:", message.substring(0, 200));
      
      // Extract text from PDF file using reusable utility
      console.log("Extracting text from PDF resume...");
      const extractionResult = await extractPdfTextFromPath(readFile, path);
      
      const validation = validatePdfExtraction(extractionResult);
      if (!validation.valid) {
        setError(validation.error || "Failed to extract text from PDF");
        return undefined;
      }

      const { text: resumeText, pageCount: extractedPageCount } = extractionResult;
      // Use provided pageCount if available, otherwise use extracted pageCount
      const finalPageCount = pageCount !== undefined ? pageCount : extractedPageCount;
      console.log(`Extracted resume text from ${finalPageCount} page(s), length: ${resumeText.length} characters`);

      // Create comprehensive prompt with extracted PDF text
      const enhancedMessage = `${message}\n\n--- RESUME CONTENT (Extracted from PDF, ${finalPageCount} page(s)) ---\n${resumeText}\n\n--- END OF RESUME CONTENT ---\n\nPlease analyze the resume content above and provide detailed feedback. Pay special attention to the resume's page count (${finalPageCount} page(s)) and evaluate whether this length is appropriate for the candidate's experience level and the target job.`;

      // Use text-based chat instead of vision model since we have the text
      const response = await puter.ai.chat(
        [
          {
            role: "user",
            content: enhancedMessage,
          },
        ],
        { model: "gpt-5-nano" }
      ) as AIResponse | undefined;

      console.log("Puter AI response received:", response);
      
      // Validate response using reusable utility
      const responseValidation = validateAIResponse(response);
      if (!responseValidation.valid) {
        setError(responseValidation.error || "Invalid AI response");
        return undefined;
      }

      return response;
    } catch (error) {
      console.error("Error calling Puter AI:", error);
      const errorMessage = extractErrorMessage(error, "Unknown error");
      setError(`Failed to get AI feedback: ${errorMessage}`);
      return undefined;
    }
  };

  const validatePdf = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return undefined;
    }

    try {
      console.log("Validating PDF file type:", path);
      
      // Extract text from PDF file
      const extractionResult = await extractPdfTextFromPath(readFile, path);
      
      const validation = validatePdfExtraction(extractionResult);
      if (!validation.valid) {
        // If we can't extract text, it might be a scanned/image PDF
        // We'll still try to analyze it
        console.warn("PDF text extraction had issues:", validation.error);
      }

      const { text: pdfText, pageCount } = extractionResult;
      console.log(`Extracted text from ${pageCount} page(s) for validation, length: ${pdfText.length} characters`);

      // Create validation prompt
      const validationPrompt = `Analyze the following PDF content and determine:
1. Is this document a resume/CV? (Answer: yes or no)
2. If not a resume, what type of document is it? (e.g., "invoice", "contract", "letter", "report", "academic paper", "form", etc.)
3. Provide a brief description (maximum 200 characters) of what the document contains.

PDF Content (${pageCount} page(s)):
${pdfText.substring(0, 5000)}${pdfText.length > 5000 ? '...' : ''}

Respond in JSON format:
{
  "isResume": boolean,
  "fileType": "string (if not resume)",
  "description": "string (maximum 200 characters, brief description of document content)"
}`;

      // Use Gemini 2.0 Flash-Lite for cost-effective validation
      const response = await puter.ai.chat(
        [
          {
            role: "user",
            content: validationPrompt,
          },
        ],
        { model: "google/gemini-2.0-flash-lite" }
      ) as any;

      console.log("PDF validation response:", response);

      // Try to extract JSON from response
      let validationResult: { isResume: boolean; fileType?: string; description?: string };
      
      // Extract text from AIResponse if needed
      let responseText: string | null = null;
      if (response && typeof response === 'object' && 'message' in response) {
        // It's an AIResponse object
        responseText = extractTextFromAIResponse(response as any);
      } else if (typeof response === 'string') {
        responseText = response;
      } else if (response && typeof response === 'object') {
        // Response is already a parsed object
        validationResult = response as { isResume: boolean; fileType?: string; description?: string };
        return {
          isValid: validationResult.isResume === true,
          fileType: validationResult.fileType || "unknown",
          description: validationResult.description || "Unable to determine document type.",
        };
      } else {
        // Default: assume it's a resume if we can't determine
         console.warn("PDF validation response had unexpected format, defaulting to valid:", response);
        return {
          isValid: true,
          fileType: "unknown",
          description: "Validation response was unclear, proceeding with analysis.",
        };
      }

      if (responseText) {
        // Try to parse JSON from text response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            validationResult = JSON.parse(jsonMatch[0]);
          } catch (e) {
            // Fallback: try to extract information from text
            const isResume = /resume|cv|curriculum vitae/i.test(responseText);
            validationResult = {
              isResume,
              fileType: isResume ? undefined : "unknown document",
              description: responseText.substring(0, 200),
            };
          }
        } else {
          // Fallback: try to extract information from text
          const isResume = /resume|cv|curriculum vitae/i.test(responseText);
          const rawDescription = responseText.substring(0, 200);
          validationResult = {
            isResume,
            fileType: isResume ? undefined : "unknown document",
            description: rawDescription.length > 200 ? rawDescription.substring(0, 197) + "..." : rawDescription,
          };
        }
      } else {
        // Default: assume it's a resume if we can't determine
        validationResult = {
          isResume: true,
        };
      }

      // Truncate description to 200 characters
      const description = validationResult.description || "Unable to determine document type.";
      const truncatedDescription = description.length > 200 
        ? description.substring(0, 197) + "..." 
        : description;

      return {
        isValid: validationResult.isResume === true,
        fileType: validationResult.fileType || "unknown",
        description: truncatedDescription,
      };
    } catch (error) {
      console.error("Error validating PDF:", error);
      const errorMessage = extractErrorMessage(error, "Unknown error");
      setError(`Failed to validate PDF: ${errorMessage}`);
      // Default to valid if validation fails (don't block user)
      return {
        isValid: true,
        fileType: "unknown",
        description: "Validation failed, but proceeding with analysis.",
      };
    }
  };

  const improveResume = async (path: string, message: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    try {
      console.log("Generating improved resume with PDF file path:", path);
      console.log("Improvement instructions length:", message.length);
      
      // Extract text from PDF file using reusable utility
      console.log("Extracting text from PDF resume for improvement...");
      const extractionResult = await extractPdfTextFromPath(readFile, path);
      
      const validation = validatePdfExtraction(extractionResult);
      if (!validation.valid) {
        setError(validation.error || "Failed to extract text from PDF");
        return undefined;
      }

      const { text: resumeText, pageCount } = extractionResult;
      console.log(`Extracted resume text from ${pageCount} page(s) for improvement`);

      // Create comprehensive prompt with extracted PDF text and improvement instructions
      const enhancedMessage = `${message}\n\n--- ORIGINAL RESUME CONTENT (${pageCount} page(s)) ---\n${resumeText}\n\n--- END OF ORIGINAL RESUME CONTENT ---\n\nPlease generate an improved, ATS-optimized resume based on the original content above, the job requirements, and the feedback provided.`;

      // Use text-based chat for resume improvement
      const response = await puter.ai.chat(
        [
          {
            role: "user",
            content: enhancedMessage,
          },
        ],
        { model: "gpt-5-nano" }
      ) as AIResponse | undefined;

      console.log("Resume improvement response received.");
      
      // Validate response using reusable utility
      const responseValidation = validateAIResponse(response);
      if (!responseValidation.valid) {
        setError(responseValidation.error || "Invalid AI response");
        return undefined;
      }

      return response;
    } catch (error) {
      console.error("Error generating improved resume:", error);
      const errorMessage = extractErrorMessage(error, "Unknown error");
      setError(`Failed to generate improved resume: ${errorMessage}`);
      return undefined;
    }
  };

  const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.img2txt(image, testMode);
  };

  const getKV = async (key: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.get(key);
  };

  const setKV = async (key: string, value: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.set(key, value);
  };

  const deleteKV = async (key: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    // Puter.js API might use 'del' instead of 'delete'
    // Try both methods for compatibility
    const kvStore = puter.kv as any;
    if (typeof kvStore.del === 'function') {
      return kvStore.del(key);
    } else if (typeof kvStore.delete === 'function') {
      return kvStore.delete(key);
    } else {
      throw new Error("KV delete method not available");
    }
  };

  const listKV = async (pattern: string, returnValues?: boolean) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    if (returnValues === undefined) {
      returnValues = false;
    }
    return puter.kv.list(pattern, returnValues);
  };

  const flushKV = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.flush();
  };

  return {
    isLoading: true,
    error: null,
    puterReady: false,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user,
    },
    fs: {
      write: (path: string, data: string | File | Blob) => write(path, data),
      read: (path: string) => readFile(path),
      readDir: (path: string) => readDir(path),
      upload: (files: File[] | Blob[]) => upload(files),
      delete: (path: string) => deleteFile(path),
    },
    ai: {
      chat: (
        prompt: string | ChatMessage[],
        imageURL?: string | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions
      ) => chat(prompt, imageURL, testMode, options),
      feedback: (path: string, message: string, pageCount?: number) => feedback(path, message, pageCount),
      validatePdf: (path: string) => validatePdf(path),
      improveResume: (path: string, message: string) => improveResume(path, message),
      img2txt: (image: string | File | Blob, testMode?: boolean) =>
        img2txt(image, testMode),
    },
    kv: {
      get: (key: string) => getKV(key),
      set: (key: string, value: string) => setKV(key, value),
      delete: (key: string) => deleteKV(key),
      list: (pattern: string, returnValues?: boolean) =>
        listKV(pattern, returnValues),
      flush: () => flushKV(),
    },
    init,
    clearError: () => set({ error: null }),
  };
});
