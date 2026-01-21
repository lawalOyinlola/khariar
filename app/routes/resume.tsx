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
        const resumeData = await kv.get(`resume:${id}`);
        if (aborted || !resumeData) return;
        console.log("I am testing the resume data", resumeData);

        const data = JSON.parse(resumeData);

        const resumeBlob = await fs.read(data.resumePath);
        if (aborted || !resumeBlob) return;

        const imageBlob = await fs.read(data.imagePath);
        if (aborted || !imageBlob) return;

        const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
        resumeUrl = URL.createObjectURL(pdfBlob);
        imageUrl = URL.createObjectURL(imageBlob);

        if (aborted) {
          URL.revokeObjectURL(resumeUrl);
          URL.revokeObjectURL(imageUrl);
          return;
        }

        setFeedback(data.feedback);
        setResumeUrl(resumeUrl);
        setImageUrl(imageUrl);
      } catch (error) {
        console.error("Failed to load and process resume:", error);
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
          {imageUrl && resumeUrl && (
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
          )}
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
