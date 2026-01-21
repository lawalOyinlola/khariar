import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import ResumeImprovement from "~/components/ResumeImprovement";
import ResumeFormatTips from "~/components/ResumeFormatTips";
import { prepareImprovementInstructions } from "../../constants";

export const meta = () => [
  { title: "Resumind | Improved Resume" },
  { name: "description", content: "Your improved, ATS-optimized resume" },
];

const Improve = () => {
  const { auth, isLoading, fs, kv, ai } = usePuterStore();
  const { id } = useParams();
  const [improvedResume, setImprovedResume] = useState<ImprovedResume | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const navigate = useNavigate();

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
      try {
        const resumeDataStr = await kv.get(`resume:${id}`);
        if (!resumeDataStr) {
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
            return;
          } catch (e) {
            console.error("Failed to parse existing improved resume:", e);
          }
        }

        // Generate improved resume if it doesn't exist
        if (!data.feedback || !data.resumePath) {
          setError("Resume feedback not found. Please analyze your resume first.");
          return;
        }

        setIsGenerating(true);
        setError(null);

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

        const improvementInstructions = prepareImprovementInstructions({
          jobTitle: data.jobTitle || "Position",
          jobDescription: data.jobDescription || "",
          feedback: data.feedback,
          pageCount,
        });

        const response = await ai.improveResume(
          data.resumePath,
          improvementInstructions
        );

        if (!response) {
          setError("Failed to generate improved resume. Please try again.");
          setIsGenerating(false);
          return;
        }

        // Extract and parse the improved resume
        let improvedResumeText: string | undefined;
        try {
          if (typeof response.message.content === "string") {
            improvedResumeText = response.message.content;
          } else if (Array.isArray(response.message.content)) {
            const textItem = response.message.content.find(
              (item: any) => item.type === "text" && item.text
            );
            if (textItem?.text) {
              improvedResumeText = textItem.text;
            } else if (response.message.content[0]?.text) {
              improvedResumeText = response.message.content[0].text;
            }
          }

          if (!improvedResumeText) {
            throw new Error("No text content found in improvement response");
          }

          // Clean up markdown code blocks if present
          improvedResumeText = improvedResumeText.trim();
          if (improvedResumeText.startsWith("```json")) {
            improvedResumeText = improvedResumeText
              .replace(/^```json\s*/i, "")
              .replace(/\s*```$/i, "");
          } else if (improvedResumeText.startsWith("```")) {
            improvedResumeText = improvedResumeText
              .replace(/^```\s*/, "")
              .replace(/\s*```$/, "");
          }

          const parsedImprovedResume = JSON.parse(improvedResumeText);
          setImprovedResume(parsedImprovedResume);

          // Save improved resume for future use
          await kv.set(
            `improved-resume:${id}`,
            JSON.stringify(parsedImprovedResume)
          );
        } catch (parseError) {
          console.error("Failed to parse improved resume:", parseError);
          console.error("Raw response:", improvedResumeText || "Not extracted");
          setError(
            `Failed to parse improved resume. ${parseError instanceof Error ? parseError.message : "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Failed to load and improve resume:", error);
        setError("Failed to generate improved resume. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    };

    loadAndImprove();
  }, [id, kv, fs, ai]);

  return (
    <main className="pt-0!">
      <nav className="resume-nav">
        <Link to={`/resume/${id}`} className="back-button">
          <img
            src="/icons/back.svg"
            alt=""
            aria-hidden="true"
            className="w-2.5 h-2.5"
          />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Review
          </span>
        </Link>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl text-black! font-bold mb-2">
            Improved Resume
          </h1>
          <hr className="border-gray-200 mb-2" />
          <p className="text-gray-600">Your ATS-optimized resume with improvements highlighted.</p>
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
          <div className="space-y-8">
            {improvedResume.formattingTips && (
              <ResumeFormatTips formattingTips={improvedResume.formattingTips} />
            )}
            <div>
              <h2 className="text-4xl! text-black! font-bold pt-8 mb-2">Improved Resume Content</h2>
              <hr className="border-gray-200" />
              <p className="text-gray-600">Copy each section to update your resume.</p>
            </div>
            <ResumeImprovement improvedResume={improvedResume} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Improve;
