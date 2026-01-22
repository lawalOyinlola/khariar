import { type FormEvent, useState } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";
import { showError, showLoading, updateToSuccess, updateToError } from "~/lib/toast";
import { parseAIResponseAsJSON, extractTextFromAIResponse, cleanMarkdownCodeBlocks } from "~/lib/ai-response-parser";
import { extractErrorMessage } from "~/lib/error-handler";

const Upload = () => {
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
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
    setIsProcessing(true);
    const loadingToast = showLoading("Starting analysis...");

    try {
      setStatusText("Uploading the file...");
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) {
        updateToError(loadingToast, "Upload failed", "Failed to upload file. Please try again.");
        setStatusText("Error: Failed to upload file");
        return;
      }

      setStatusText("Converting to image...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file || imageFile.error) {
        const errorMessage = imageFile.error || "Failed to convert PDF to image";
        console.error("PDF to image conversion error:", errorMessage);
        updateToError(loadingToast, "Conversion failed", errorMessage);
        setStatusText(`Error: ${errorMessage}`);
        return;
      }

      setStatusText("Uploading the image...");
      const uploadedImage = await fs.upload([imageFile.file]);
      if (!uploadedImage) {
        updateToError(loadingToast, "Upload failed", "Failed to upload image. Please try again.");
        setStatusText("Error: Failed to upload image");
        return;
      }

      setStatusText("Preparing data...");
      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: "",
      };
      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analyzing PDF content...");
      // Use PDF path for analysis - extracts text from all pages
      const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({ jobTitle, jobDescription })
      );

      if (!feedback) {
        updateToError(loadingToast, "Analysis failed", "Failed to analyze resume. Please try again.");
        setStatusText("Error: Failed to analyze resume. Please check console for details.");
        return;
      }

      // Parse feedback using reusable utility
      const parsedFeedback = parseAIResponseAsJSON(feedback);

      if (!parsedFeedback) {
        // Fallback: try extracting text manually if JSON parsing fails
        const feedbackText = extractTextFromAIResponse(feedback);
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
            // Still save the resume data so user can see it
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            return;
          }
        }
        updateToError(loadingToast, "Parse error", "Failed to extract feedback from response");
        setStatusText("Error: Failed to parse feedback");
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) {
      showError("File required", "Please select a resume file to upload");
      setStatusText("Please select a resume file to upload");
      return;
    }

    if (!companyName || !jobTitle || !jobDescription) {
      showError("Fields required", "Please fill in all required fields");
      setStatusText("Please fill in all required fields");
      return;
    }

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
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
              <img src="/images/resume-scan.gif" alt="Resume scanning animation" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>

              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader
                  key={file ? `file-${file.name}` : "no-file"}
                  onFileSelect={handleFileSelect}
                  file={file}
                />
              </div>

              <button className="upload-button" type="submit">
                Save & Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};
export default Upload;
