import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import ResumeImprovement from "~/components/ResumeImprovement";
import ResumeFormatTips from "~/components/ResumeFormatTips";
import { downloadResumePDF } from "~/lib/generateResumePDF";
import { showError, showSuccess, showLoading, updateToSuccess, updateToError } from "~/lib/toast";
import { extractErrorMessage } from "~/lib/error-handler";
import { generateImprovedResume } from "~/lib/resume-generator";

export const meta = () => [
  { title: "Resumind | Improved Resume" },
  { name: "description", content: "Your improved, ATS-optimized resume" },
];

const Improve = () => {
  const { auth, isLoading, fs, kv, ai } = usePuterStore();
  const { id } = useParams();
  const [improvedResume, setImprovedResume] = useState<ImprovedResume | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const navigate = useNavigate();

  const handleDownloadPDF = async () => {
    if (!improvedResume) return;

    setIsGeneratingPDF(true);
    const loadingToast = showLoading("Generating PDF...");
    try {
      const fileName = resumeData?.jobTitle
        ? `Resume-${resumeData.jobTitle.replace(/\s+/g, "-")}-${id}.pdf`
        : `Improved-Resume-${id}.pdf`;
      await downloadResumePDF(improvedResume, fileName);
      updateToSuccess(loadingToast, "PDF generated!", "Your resume PDF has been downloaded.");
      showSuccess("PDF downloaded successfully");
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "Failed to generate PDF");
      updateToError(loadingToast, "PDF generation failed", errorMessage);
      setError(errorMessage);
      showError("PDF generation failed", errorMessage);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated && !isLoading) {
      navigate(`/auth?next=/improve/${id}`);
    }
  }, [auth.isAuthenticated, isLoading, navigate, id]);

  useEffect(() => {
    if (!id || !kv || !fs || !ai) {
      return;
    }

    const loadAndImprove = async () => {
      const loadingToast = showLoading("Loading resume...");
      try {
        const resumeDataStr = await kv.get(`resume:${id}`);
        if (!resumeDataStr) {
          updateToError(loadingToast, "Resume not found", "Please upload a resume first.");
          setError("Resume not found. Please upload a resume first.");
          return;
        }

        const data = JSON.parse(resumeDataStr);
        setResumeData(data);

        // Check if improved resume already exists
        const improvedResumeStr = await kv.get(`improved-resume:${id}`);
        if (improvedResumeStr) {
          try {
            const improved = JSON.parse(improvedResumeStr);
            setImprovedResume(improved);
            updateToSuccess(loadingToast, "Resume loaded", "Displaying improved resume...");
            return;
          } catch (e) {
            console.error("Failed to parse existing improved resume:", e);
            // Continue to generate new one
          }
        }

        // Handle sample resumes - they already have improved resume saved
        const isSampleResume = data.isSampleResume === true;

        if (isSampleResume) {
          // Sample resumes already have improved resume - just load it
          const improvedResumeStr = await kv.get(`improved-resume:${id}`);
          if (improvedResumeStr) {
            try {
              const improved = JSON.parse(improvedResumeStr);
              setImprovedResume(improved);
              updateToSuccess(loadingToast, "Resume loaded", "Displaying sample resume...");
              return;
            } catch (e) {
              console.error("Failed to parse sample improved resume:", e);
            }
          }
        }

        // Generate improved resume if it doesn't exist
        if (!data.feedback || !data.resumePath) {
          updateToError(loadingToast, "Feedback not found", "Please analyze your resume first.");
          setError("Resume feedback not found. Please analyze your resume first.");
          return;
        }

        setIsGenerating(true);
        setError(null);
        updateToSuccess(loadingToast, "Generating improved resume...", "This may take a moment.");

        // Extract page count from PDF for formatting recommendations
        let pageCount: number | undefined;
        try {
          const { extractPdfTextFromBlob } = await import("~/lib/pdf2text");
          const pdfBlob = await fs.read(data.resumePath);
          if (pdfBlob) {
            const extractionResult = await extractPdfTextFromBlob(pdfBlob);
            pageCount = extractionResult.pageCount;
          }
        } catch (e) {
          console.warn("Failed to extract page count:", e);
          // Continue without page count
        }

        // Use shared function to generate improved resume
        const result = await generateImprovedResume(ai, {
          jobTitle: data.jobTitle || "Position",
          jobDescription: data.jobDescription || "",
          companyName: data.companyName || "",
          feedback: data.feedback,
          pageCount,
          resumePath: data.resumePath,
          isSample: false,
        });

        if (!result.success || !result.improvedResume) {
          updateToError(
            loadingToast,
            "Generation failed",
            result.error || "Failed to generate improved resume. Please try again."
          );
          setError(result.error || "Failed to generate improved resume. Please try again.");
          setIsGenerating(false);
          return;
        }

        setImprovedResume(result.improvedResume);
        await kv.set(`improved-resume:${id}`, JSON.stringify(result.improvedResume));
        updateToSuccess(loadingToast, "Resume improved!", "Your improved resume is ready.");
      } catch (error) {
        const errorMessage = extractErrorMessage(error, "Failed to generate improved resume");
        console.error("Failed to load and improve resume:", error);
        updateToError(loadingToast, "Error", errorMessage);
        setError(errorMessage);
        showError("Failed to generate improved resume", errorMessage);
      } finally {
        setIsGenerating(false);
      }
    };

    loadAndImprove();
  }, [id, kv, fs, ai]);

  return (
    <main className="pt-0!">
      <nav className="resume-nav">
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <Link
            to={`/resume/${id}`}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Review
          </Link>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-900 font-semibold">
            {resumeData?.isSampleResume ? "Sample Resume" : "Improved Resume"}
          </span>
        </nav>
        {improvedResume && (
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isGeneratingPDF ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </>
            )}
          </button>
        )}
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* Left Column - Formatting Tips (Sticky on desktop, appears after content on mobile) */}
        <section className="feedback-section no-scrollbar bg-[url('/images/bg-small.svg')] bg-cover h-screen sticky top-0 overflow-y-auto py-16 max-lg:h-auto max-lg:sticky-0 max-lg:py-0 max-lg:overflow-visible">
          <div className="max-lg:py-10">
            <h2 className="text-3xl text-black! font-bold mb-6 max-lg:mb-4">Formatting Tips</h2>
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
                {error}
              </div>
            ) : isGenerating ? (
              <div className="text-center py-12">
                <img
                  src="/images/resume-scan-2.gif"
                  className="w-full max-w-md mx-auto"
                  alt="Generating improved resume"
                />
                <p className="text-gray-600 mt-4">
                  Generating your improved, ATS-optimized resume...
                </p>
              </div>
            ) : improvedResume?.formattingTips ? (
              <ResumeFormatTips formattingTips={improvedResume.formattingTips} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading formatting tips...</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column - Improved Content (Scrollable, appears first on mobile) */}
        <section className="feedback-section pb-20">
          <div className="mb-6">
            <h1 className="text-4xl text-black! font-bold mb-2">
              {resumeData?.isSampleResume ? "Sample Resume Content" : "Improved Resume Content"}
            </h1>
            <p className="text-gray-600">
              {resumeData?.isSampleResume
                ? "A professional resume template tailored to your job application. Customize each section with your own experience and qualifications."
                : "Your ATS-optimized resume with improvements highlighted. Copy each section to update your resume."}
            </p>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              {error}
            </div>
          ) : isGenerating ? (
            <div className="text-center py-12">
              <img
                src="/images/resume-scan-2.gif"
                className="w-full max-w-md mx-auto"
                alt="Generating improved resume"
              />
              <p className="text-gray-600 mt-4">
                Generating your improved, ATS-optimized resume...
              </p>
            </div>
          ) : improvedResume ? (
            <div className="animate-in fade-in duration-1000">
              <ResumeImprovement improvedResume={improvedResume} />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Improve;
