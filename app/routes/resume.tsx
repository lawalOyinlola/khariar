import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { showError } from "~/lib/toast";
import { extractErrorMessage } from "~/lib/error-handler";

export const meta = () => [
  { title: "KHARIAR | Review" },
  { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [hasImprovedResume, setHasImprovedResume] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated && !isLoading) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [auth.isAuthenticated, isLoading, navigate, id]);

  useEffect(() => {
    if (!id || !kv || !fs) {
      return;
    }

    let aborted = false;
    let resumeUrl: string | undefined;
    let imageUrl: string | undefined;

    const loadResume = async () => {
      try {
        // Load feedback first (fast - from KV store)
        const resumeData = await kv.get(`resume:${id}`);
        if (aborted || !resumeData) return;

        const data = JSON.parse(resumeData);

        // Check if this is a sample resume
        const isSample = data.isSampleResume === true;

        // Set feedback immediately so UI can render
        if (data.feedback) {
          setFeedback(data.feedback);
        }

        // Check if improved resume exists
        const improvedResumeStr = await kv.get(`improved-resume:${id}`);
        if (improvedResumeStr) {
          try {
            JSON.parse(improvedResumeStr);
            setHasImprovedResume(true);
          } catch (e) {
            // Invalid JSON, treat as not existing
            setHasImprovedResume(false);
          }
        }

        // Handle sample resumes (no actual PDF/image files)
        if (isSample) {
          // Sample resumes don't have PDF/image files - skip loading
          setIsLoadingImages(false);
          return;
        }

        // Load images asynchronously (slower - file system reads) only if paths exist
        if (!data.resumePath || !data.imagePath) {
          // No paths available - skip image loading
          setIsLoadingImages(false);
          return;
        }

        setIsLoadingImages(true);
        Promise.all([
          fs.read(data.resumePath),
          fs.read(data.imagePath)
        ]).then(([resumeBlob, imageBlob]) => {
          if (aborted || !resumeBlob || !imageBlob) {
            setIsLoadingImages(false);
            return;
          }

          const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
          resumeUrl = URL.createObjectURL(pdfBlob);
          imageUrl = URL.createObjectURL(imageBlob);

          if (aborted) {
            URL.revokeObjectURL(resumeUrl);
            URL.revokeObjectURL(imageUrl);
            setIsLoadingImages(false);
            return;
          }

          setResumeUrl(resumeUrl);
          setImageUrl(imageUrl);
          setIsLoadingImages(false);
        }).catch((error) => {
          console.error("Failed to load resume images:", error);
          setIsLoadingImages(false);
          // Only show error if it's not a sample resume (sample resumes don't have images)
          if (!isSample) {
            const errorMessage = extractErrorMessage(error, "Failed to load resume images");
            showError("Image loading failed", errorMessage);
          }
        });
      } catch (error) {
        console.error("Failed to load resume data:", error);
        const errorMessage = extractErrorMessage(error, "Failed to load resume");
        setError(errorMessage);
        showError("Failed to load resume", errorMessage);
        if (resumeUrl) URL.revokeObjectURL(resumeUrl);
        if (imageUrl) URL.revokeObjectURL(imageUrl);
      }
    };

    loadResume();

    return () => {
      aborted = true;
      if (resumeUrl) {
        URL.revokeObjectURL(resumeUrl);
      }
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [id, kv, fs]);

  return (
    <main className="pt-0!">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img
            src="/icons/back.svg"
            alt=""
            aria-hidden="true"
            className="w-2.5 h-2.5"
          />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-screen sticky top-0 items-center justify-center">
          {isLoadingImages ? (
            <div className="flex flex-col items-center justify-center h-[90%] max-w-xl:w-full">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600 text-sm font-medium">
                Loading resume preview...
              </p>
            </div>
          ) : imageUrl && resumeUrl ? (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-w-xl:h-fit w-fit">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageUrl}
                  className="w-full h-full object-contain rounded-2xl"
                  title="resume"
                  alt="Your resume preview"
                />
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[90%] max-w-xl:w-full px-4">
              <div className="text-center">
                <svg
                  className="w-24 h-24 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 text-sm font-medium">
                  Resume preview not available
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  This is a sample resume template
                </p>
              </div>
            </div>
          )}
        </section>
        <section className="feedback-section pb-20">
          <h2 className="text-4xl text-black! font-bold">Resume Review</h2>
          {error ? (
            <div className="text-red-600 text-center p-4">{error}</div>
          ) : feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.tips || []}
              />
              <Details feedback={feedback} />
              <div className="mt-4 p-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {hasImprovedResume ? "View your improved resume" : "Ready to improve your resume?"}
                </h3>
                <p className="text-gray-700 mb-4">
                  {hasImprovedResume
                    ? "View your ATS-optimized, improved resume with specific content for each section."
                    : "Get an ATS-optimized, improved version of your resume with specific content for each section."}
                </p>
                <Link
                  to={`/improve/${id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>{hasImprovedResume ? "View Improved Resume" : "Generate Improved Resume"}</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ) : hasImprovedResume ? (
            // Sample resume - show direct link to improved resume
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <div className="p-6 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Sample Resume Template Ready
                </h3>
                <p className="text-gray-700 mb-4">
                  Your sample resume template has been generated. View and customize it to match your experience.
                </p>
                <Link
                  to={`/improve/${id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span>View Sample Resume</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <img
              src="/images/resume-scan-2.gif"
              className="w-full max-w-md mx-auto"
              alt="Scanning your resume for feedback"
            />
          )}
        </section>
      </div>
    </main>
  );
};
export default Resume;
