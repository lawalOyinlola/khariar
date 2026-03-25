import { type FormEvent, useState, Activity } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import FormInput from "~/components/FormInput";
import InvalidFileModal from "~/components/InvalidFileModal";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";
import { showError, showLoading, updateToSuccess, updateToError, dismissToast } from "~/lib/toast";
import { parseAIResponseAsJSON, extractTextFromAIResponse, cleanMarkdownCodeBlocks } from "~/lib/ai-response-parser";
import { extractErrorMessage } from "~/lib/error-handler";
import { extractPdfText } from "~/lib/pdf2text";
import { generateImprovedResume } from "~/lib/resume-generator";

const Upload = () => {
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;
    file?: string;
  }>({});
  const [invalidFileModal, setInvalidFileModal] = useState<{
    isOpen: boolean;
    fileType: string;
    description: string;
  }>({
    isOpen: false,
    fileType: "",
    description: "",
  });
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [tempImagePath, setTempImagePath] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
  });

  // Helper function to cleanup stored files on error
  const cleanupFiles = async (resumePath: string | null, imagePath: string | null): Promise<void> => {
    const errors: Error[] = [];
    if (resumePath) {
      try {
        await fs.delete(resumePath);
      } catch (e) {
        errors.push(e instanceof Error ? e : new Error(String(e)));
      }
    }
    if (imagePath) {
      try {
        await fs.delete(imagePath);
      } catch (e) {
        errors.push(e instanceof Error ? e : new Error(String(e)));
      }
    }
    if (errors.length > 0) {
      console.warn("Failed to cleanup some files:", errors);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setFile(file);
    if (file) {
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };


  const validateRequired = (fieldLabel: string, value: string | File | null): string | undefined => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return `${fieldLabel} is required`;
    }
    return undefined;
  };

  const handleInputChange = (field: "companyName" | "jobTitle" | "jobDescription", value: string) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateSampleResume = async (
    companyName: string,
    jobTitle: string,
    jobDescription: string
  ) => {
    setIsProcessing(true);
    setInvalidFileModal({ isOpen: false, fileType: "", description: "" });
    const loadingToast = showLoading("Generating sample resume template...");

    let storedResumePath: string | null = null;
    let storedImagePath: string | null = null;

    try {
      setStatusText("Storing files...");

      // Only store files if user chose to generate sample resume
      // Check if we have a file to store (from the invalid file modal)
      if (uploadedFilePath && file) {
        // File was already uploaded temporarily, now store it properly
        storedResumePath = uploadedFilePath;

        // Convert and store image
        updateToSuccess(loadingToast, "Converting PDF...", "Preparing files");
        const imageFile = await convertPdfToImage(file);
        if (imageFile.file && !imageFile.error) {
          const uploadedImage = await fs.upload([imageFile.file]);
          if (uploadedImage) {
            storedImagePath = uploadedImage.path;
            setTempImagePath(uploadedImage.path);
          }
        }
      }

      setStatusText("Generating sample resume...");
      updateToSuccess(loadingToast, "Generating template...", "Creating sample resume");

      // Use shared function to generate sample resume
      const result = await generateImprovedResume(ai, {
        jobTitle,
        jobDescription,
        companyName,
        isSample: true,
      });

      if (!result.success || !result.improvedResume) {
        updateToError(
          loadingToast,
          "Generation failed",
          result.error || "Failed to generate sample resume. Please try again."
        );
        // Cleanup: delete stored files if generation failed
        await cleanupFiles(storedResumePath, storedImagePath);
        setUploadedFilePath(null);
        setTempImagePath(null);
        return;
      }

      // Create a UUID and save the sample resume data
      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: storedResumePath || "", // Store PDF path if available
        imagePath: storedImagePath || "", // Store image path if available
        companyName,
        jobTitle,
        jobDescription,
        feedback: "", // No feedback for sample resumes
        isSampleResume: true,
      };

      // Save resume data
      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      // Also save the improved resume so it can be viewed on the improve page
      await kv.set(`improved-resume:${uuid}`, JSON.stringify(result.improvedResume));

      updateToSuccess(loadingToast, "Sample resume generated!", "Redirecting to resume page...");
      navigate(`/resume/${uuid}`);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "Failed to generate sample resume");
      updateToError(loadingToast, "Error", errorMessage);
      showError("Generation failed", errorMessage);
      // Cleanup: delete stored files on error
      await cleanupFiles(storedResumePath, storedImagePath);
      setUploadedFilePath(null);
      setTempImagePath(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsValidating(true);
    setIsProcessing(true);
    const loadingToast = showLoading("Validating PDF...");

    let tempResumePath: string | null = null;
    let storedResumePath: string | null = null;
    let storedImagePath: string | null = null;

    try {
      // Step 1: Upload file temporarily (don't store in KV yet)
      setStatusText("Uploading the file...");
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) {
        updateToError(loadingToast, "Upload failed", "Failed to upload file. Please try again.");
        setStatusText("Error: Failed to upload file");
        setIsValidating(false);
        setIsProcessing(false);
        return;
      }

      tempResumePath = uploadedFile.path;
      setUploadedFilePath(uploadedFile.path);

      // Step 2: Validate PDF - check if it's actually a resume BEFORE storing
      setStatusText("Validating document type...");
      updateToSuccess(loadingToast, "Validating document...", "Checking if file is a resume");

      const validationResult = await ai.validatePdf(uploadedFile.path);

      if (!validationResult) {
        // If validation fails, proceed anyway (don't block user)
        console.warn("PDF validation failed, proceeding with analysis");
        setIsValidating(false);
        // Continue to analysis - treat as valid
      } else if (!validationResult.isValid) {
        // File is not a resume - show modal, DON'T store anything yet
        setIsValidating(false);
        setIsProcessing(false);
        dismissToast(loadingToast);
        setInvalidFileModal({
          isOpen: true,
          fileType: validationResult.fileType || "unknown document",
          description: validationResult.description || "The uploaded file does not appear to be a resume or CV.",
        });
        // Keep tempResumePath in state for potential cleanup, but don't store in KV
        return;
      }

      // Step 3: File is valid - NOW store PDF and convert to image
      setIsValidating(false);
      updateToSuccess(loadingToast, "File validated!", "Storing files...");

      setStatusText("Converting to image...");
      updateToSuccess(loadingToast, "Converting PDF...", "Preparing for analysis");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file || imageFile.error) {
        const errorMessage = imageFile.error || "Failed to convert PDF to image";
        console.error("PDF to image conversion error:", errorMessage);
        updateToError(loadingToast, "Conversion failed", errorMessage);
        setStatusText(`Error: ${errorMessage}`);
        // Cleanup: delete the uploaded PDF since conversion failed
        await cleanupFiles(tempResumePath, null);
        setUploadedFilePath(null);
        return;
      }

      setStatusText("Uploading the image...");
      const uploadedImage = await fs.upload([imageFile.file]);
      if (!uploadedImage) {
        updateToError(loadingToast, "Upload failed", "Failed to upload image. Please try again.");
        setStatusText("Error: Failed to upload image");
        // Cleanup: delete the uploaded PDF since image upload failed
        await cleanupFiles(tempResumePath, null);
        setUploadedFilePath(null);
        return;
      }

      // Store paths for cleanup if analysis fails
      storedResumePath = tempResumePath;
      storedImagePath = uploadedImage.path;
      setTempImagePath(uploadedImage.path);

      setStatusText("Extracting resume information...");
      // Extract page count from the original file for analysis
      let pageCount: number | undefined;
      try {
        const pdfExtraction = await extractPdfText(file);
        if (pdfExtraction.pageCount > 0) {
          pageCount = pdfExtraction.pageCount;
          console.log(`Resume has ${pageCount} page(s)`);
        }
      } catch (error) {
        console.warn("Failed to extract page count from file:", error);
        // Continue without page count - it will be extracted in feedback function
      }

      setStatusText("Preparing data...");
      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: storedResumePath,
        imagePath: storedImagePath,
        companyName,
        jobTitle,
        jobDescription,
        feedback: "",
      };
      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analyzing resume content...");
      updateToSuccess(loadingToast, "Analyzing resume...", "This may take a moment");
      // Use PDF path for analysis - extracts text from all pages
      // Pass pageCount to both prepareInstructions and feedback function
      const feedback = await ai.feedback(
        storedResumePath,
        prepareInstructions({ jobTitle, jobDescription, pageCount }),
        pageCount
      );

      if (!feedback) {
        updateToError(loadingToast, "Analysis failed", "Failed to analyze resume. Please try again.");
        setStatusText("Error: Failed to analyze resume. Please check console for details.");
        // Cleanup: delete stored files since analysis failed
        await cleanupFiles(storedResumePath, storedImagePath);
        await kv.delete(`resume:${uuid}`);
        setUploadedFilePath(null);
        setTempImagePath(null);
        return;
      }

      // Parse feedback using reusable utility
      const parsedFeedback = parseAIResponseAsJSON(feedback as any);

      if (!parsedFeedback) {
        // Fallback: try extracting text manually if JSON parsing fails
        const feedbackText = extractTextFromAIResponse(feedback as any);
        if (feedbackText) {
          try {
            const cleaned = cleanMarkdownCodeBlocks(feedbackText);
            const parsed = JSON.parse(cleaned);
            data.feedback = parsed;
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            updateToSuccess(loadingToast, "Analysis complete!", "Redirecting to results...");
            setStatusText("Analysis complete, redirecting...");
            navigate(`/resume/${uuid}`);
            return;
          } catch (parseError) {
            console.error("Failed to parse feedback:", parseError);
            console.error("Raw feedback text:", feedbackText);
            updateToError(loadingToast, "Parse error", extractErrorMessage(parseError, "Failed to parse feedback"));
            setStatusText(`Error: Failed to parse feedback. ${extractErrorMessage(parseError)}`);
            // Cleanup: delete stored files since parsing failed
            await cleanupFiles(storedResumePath, storedImagePath);
            await kv.delete(`resume:${uuid}`);
            setUploadedFilePath(null);
            setTempImagePath(null);
            return;
          }
        }
        updateToError(loadingToast, "Parse error", "Failed to extract feedback from response");
        setStatusText("Error: Failed to parse feedback");
        // Cleanup: delete stored files since parsing failed
        await cleanupFiles(storedResumePath, storedImagePath);
        await kv.delete(`resume:${uuid}`);
        setUploadedFilePath(null);
        setTempImagePath(null);
        return;
      }

      data.feedback = parsedFeedback;
      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      updateToSuccess(loadingToast, "Analysis complete!", "Redirecting to results...");
      setStatusText("Analysis complete, redirecting...");
      navigate(`/resume/${uuid}`);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "An unexpected error occurred");
      updateToError(loadingToast, "Error", errorMessage);
      setStatusText(`Error: ${errorMessage}`);
      showError("Analysis failed", errorMessage);
      // Cleanup: delete stored files on any error
      await cleanupFiles(storedResumePath, storedImagePath);
      setUploadedFilePath(null);
      setTempImagePath(null);
    } finally {
      setIsProcessing(false);
      setIsValidating(false);
    }
  };

  const handleUploadAnother = async () => {
    setInvalidFileModal({ isOpen: false, fileType: "", description: "" });
    setFile(null);
    // Delete the temporary uploaded file (no need to store since user chose not to proceed)
    await cleanupFiles(uploadedFilePath, tempImagePath);
    setUploadedFilePath(null);
    setTempImagePath(null);
    // Form values are preserved by Activity component
  };

  const handleGenerateTemplate = () => {
    // Use formValues state instead of reading from FormData
    const { companyName, jobTitle, jobDescription } = formValues;
    handleGenerateSampleResume(companyName, jobTitle, jobDescription);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Use formValues state instead of reading from FormData
    const { companyName, jobTitle, jobDescription } = formValues;

    // Validate all fields
    const newErrors: typeof errors = {};
    const companyNameError = validateRequired("Company Name", companyName);
    const jobTitleError = validateRequired("Job Title", jobTitle);
    const jobDescriptionError = validateRequired("Job Description", jobDescription);
    const fileError = validateRequired("Resume File", file);

    if (companyNameError) newErrors.companyName = companyNameError;
    if (jobTitleError) newErrors.jobTitle = jobTitleError;
    if (jobDescriptionError) newErrors.jobDescription = jobDescriptionError;
    if (fileError) newErrors.file = fileError;

    setErrors(newErrors);

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showError("Validation Error", firstError);
      return;
    }

    handleAnalyze({ companyName, jobTitle, jobDescription, file: file! });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" alt="Resume scanning animation" className="w-full max-w-md mx-auto" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}
          <Activity mode={!isProcessing ? "visible" : "hidden"}>
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <FormInput
                label="Company Name"
                name="company-name"
                id="company-name"
                placeholder="Company Name"
                value={formValues.companyName}
                error={errors.companyName}
                required
                disabled={isProcessing || isValidating}
                onChange={(value) => handleInputChange("companyName", value)}
              />
              <FormInput
                label="Job Title"
                name="job-title"
                id="job-title"
                placeholder="Job Title"
                value={formValues.jobTitle}
                error={errors.jobTitle}
                required
                disabled={isProcessing || isValidating}
                onChange={(value) => handleInputChange("jobTitle", value)}
              />
              <FormInput
                label="Job Description"
                name="job-description"
                id="job-description"
                placeholder="Job Description"
                as="textarea"
                rows={5}
                value={formValues.jobDescription}
                error={errors.jobDescription}
                required
                disabled={isProcessing || isValidating}
                onChange={(value) => handleInputChange("jobDescription", value)}
              />

              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader
                  key={file ? `file-${file.name}` : "no-file"}
                  onFileSelect={handleFileSelect}
                  file={file}
                  error={errors.file}
                />
              </div>

              <button
                className="upload-button"
                type="submit"
                disabled={isProcessing || isValidating}
              >
                {isValidating ? "Validating..." : isProcessing ? "Processing..." : "Save & Analyze Resume"}
              </button>
            </form>
          </Activity>
        </div>
      </section>

      <InvalidFileModal
        isOpen={invalidFileModal.isOpen}
        onClose={async () => {
          setInvalidFileModal({ isOpen: false, fileType: "", description: "" });
          // Cleanup temporary files if user closes modal without choosing an option
          await cleanupFiles(uploadedFilePath, tempImagePath);
          setUploadedFilePath(null);
          setTempImagePath(null);
          setFile(null);
        }}
        fileType={invalidFileModal.fileType}
        fileDescription={invalidFileModal.description}
        onUploadAnother={handleUploadAnother}
        onGenerateTemplate={handleGenerateTemplate}
        isGenerating={isProcessing}
      />
    </main>
  );
};
export default Upload;
