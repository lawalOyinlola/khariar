import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => [
  { title: "Resumind | Review" },
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

        // Set feedback immediately so UI can render
        if (data.feedback) {
          setFeedback(data.feedback);
        }

        // Load images asynchronously (slower - file system reads)
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
          // Don't set error here - feedback is already shown
        });
      } catch (error) {
        console.error("Failed to load resume data:", error);
        setError("Failed to load resume. Please try again.");
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
          ) : null}
        </section>
        <section className="feedback-section">
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
                  Ready to improve your resume?
                </h3>
                <p className="text-gray-700 mb-4">
                  Get an ATS-optimized, improved version of your resume with
                  specific content for each section.
                </p>
                <Link
                  to={`/improve/${id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Generate Improved Resume</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
              className="w-full"
              alt="Scanning your resume for feedback"
            />
          )}
        </section>
      </div>
    </main>
  );
};
export default Resume;
