import { type FormEvent, useState } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

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
    try {
      setStatusText("Uploading the file...");
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) {
        setStatusText("Error: Failed to upload file");
        return;
      }
      setStatusText("Converting to image...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file) {
        setStatusText("Error: Failed to convert PDF to image");
        return;
      }
      setStatusText("Uploading the image...");
      const uploadedImage = await fs.upload([imageFile.file]);
      if (!uploadedImage) {
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
        console.error("Feedback is null or undefined");
        setStatusText("Error: Failed to analyze resume. Please check console for details.");
        return;
      }

      console.log("Feedback response structure:", feedback);
      console.log("Feedback message:", feedback.message);
      console.log("Feedback content:", feedback.message?.content);

      // Extract feedback text from response
      let feedbackText: string | undefined;
      try {
        if (typeof feedback.message.content === "string") {
          feedbackText = feedback.message.content;
        } else if (Array.isArray(feedback.message.content)) {
          // Find text content in array
          const textItem = feedback.message.content.find(
            (item: any) => item.type === "text" && item.text
          );
          if (textItem?.text) {
            feedbackText = textItem.text;
          } else if (feedback.message.content[0]?.text) {
            feedbackText = feedback.message.content[0].text;
          } else {
            throw new Error("No text content found in feedback response array");
          }
        } else {
          throw new Error(`Unexpected content type: ${typeof feedback.message.content}`);
        }

        if (!feedbackText) {
          throw new Error("Failed to extract feedback text from response");
        }

        console.log("Extracted feedback text length:", feedbackText.length);
        console.log("Feedback text preview:", feedbackText.substring(0, 200));

        // Clean up markdown code blocks if present
        feedbackText = feedbackText.trim();
        if (feedbackText.startsWith("```json")) {
          feedbackText = feedbackText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
        } else if (feedbackText.startsWith("```")) {
          feedbackText = feedbackText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        // Parse JSON feedback
        const parsedFeedback = JSON.parse(feedbackText);
        console.log("Successfully parsed feedback:", parsedFeedback);

        data.feedback = parsedFeedback;
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText("Analysis complete, redirecting...");

        navigate(`/resume/${uuid}`);
      } catch (parseError) {
        console.error("Failed to parse feedback:", parseError);
        console.error("Raw feedback text:", feedbackText || "Not extracted");
        console.error("Full feedback response:", JSON.stringify(feedback, null, 2));
        setStatusText(
          `Error: Failed to parse feedback. ${parseError instanceof Error ? parseError.message : "Unknown error"}. Check console for details.`
        );
        // Still save the resume data so user can see it
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
      }
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
      setStatusText("Please select a resume file to upload");
      return;
    }

    if (!companyName || !jobTitle || !jobDescription) {
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
