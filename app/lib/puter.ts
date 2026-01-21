import { create } from "zustand";

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
    set({
      error: msg,
      isLoading: false,
      auth: createAuthState(null, false),
    });
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    const puter = getPuter();
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
      const msg =
        err instanceof Error ? err.message : "Failed to check auth status";
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
      const msg = err instanceof Error ? err.message : "Sign in failed";
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
      const msg = err instanceof Error ? err.message : "Sign out failed";
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
      const msg = err instanceof Error ? err.message : "Failed to refresh user";
      setError(msg);
    }
  };

  // Poll for Puter.js availability every 100ms for up to 10 seconds
  // This handles the case where the external script loads asynchronously
  let pollingInterval: NodeJS.Timeout | null = null;
  let pollingTimeout: NodeJS.Timeout | null = null;

  const init = (): void => {
    // Clean up any existing timers
    if (pollingInterval) clearInterval(pollingInterval);
    if (pollingTimeout) clearTimeout(pollingTimeout);

    const puter = getPuter();
    if (puter) {
      set({ puterReady: true });
      checkAuthStatus();
      return;
    }

    pollingInterval = setInterval(() => {
      if (getPuter()) {
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = null;
        set({ puterReady: true });
        checkAuthStatus();
      }
    }, 100);

    pollingTimeout = setTimeout(() => {
      if (pollingInterval) clearInterval(pollingInterval);
      pollingInterval = null;
      pollingTimeout = null;
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

  const feedback = async (path: string, message: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    try {
      console.log("Calling Puter AI with PDF file path:", path);
      console.log("Message length:", message.length);
      console.log("Message preview:", message.substring(0, 200));
      
      // Extract text from PDF file (all pages)
      console.log("Extracting text from PDF resume...");
      let resumeText: string | undefined;
      let pageCount = 0;
      
      try {
        const { extractPdfTextFromBlob } = await import("~/lib/pdf2text");
        const pdfBlob = await readFile(path);
        
        if (pdfBlob) {
          const extractionResult = await extractPdfTextFromBlob(pdfBlob);
          
          if (extractionResult.error) {
            console.warn("PDF text extraction warning:", extractionResult.error);
            // Continue with empty text if extraction failed
            resumeText = "";
          } else {
            resumeText = extractionResult.text;
            pageCount = extractionResult.pageCount;
            console.log(`Extracted resume text from ${pageCount} page(s), length: ${resumeText?.length || 0} characters`);
            
            if (resumeText) {
              if (resumeText.length > 400) {
                console.log(
                  "Resume text first 200 chars:", 
                  resumeText.substring(0, 200)
                );
                console.log(
                  "Resume text last 200 chars:", 
                  resumeText.substring(resumeText.length - 200)
                );
              } else {
                console.log("Resume text (full):", resumeText);
              }
              console.log("Resume text preview:", resumeText.substring(0, 500));
            }
          }
        }
      } catch (extractionError) {
        console.error("PDF text extraction failed:", extractionError);
        const errorMessage = extractionError instanceof Error ? extractionError.message : "Unknown error";
        setError(`Failed to extract text from PDF: ${errorMessage}`);
        return undefined;
      }

      if (!resumeText || resumeText.trim().length === 0) {
        console.error("No text content extracted from PDF");
        setError("Failed to extract text from PDF. The PDF may be image-based or scanned. Please ensure your resume PDF contains selectable text.");
        return undefined;
      }

      // Create comprehensive prompt with extracted PDF text
      // Include the full resume text in the message for analysis
      const enhancedMessage = `${message}\n\n--- RESUME CONTENT (Extracted from PDF, ${pageCount} page(s)) ---\n${resumeText}\n\n--- END OF RESUME CONTENT ---\n\nPlease analyze the resume content above and provide detailed feedback.`;

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
      
      if (!response) {
        console.error("Puter AI returned undefined/null response");
        return undefined;
      }

      if (response.message?.refusal) {
        console.error("Puter AI refused the request:", response.message.refusal);
        setError(`AI refused the request: ${response.message.refusal}`);
        return undefined;
      }

      return response;
    } catch (error) {
      console.error("Error calling Puter AI:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to get AI feedback: ${errorMessage}`);
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
      feedback: (path: string, message: string) => feedback(path, message),
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
