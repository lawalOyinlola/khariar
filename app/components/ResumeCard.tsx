import { useEffect, useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
  resume: Resume;
}) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    if (!imagePath || !fs) {
      setResumeUrl("");
      return;
    }

    let aborted = false;
    let objectUrl: string | undefined;

    const loadResumeImage = async () => {
      try {
        const blob = await fs.read(imagePath);

        if (aborted || !blob) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);

        if (aborted) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        setResumeUrl(objectUrl);
      } catch (error) {
        console.error("Failed to load resume preview:", error);
        setResumeUrl("");
      }
    };

    loadResumeImage();

    return () => {
      aborted = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fs, imagePath]);

  return (
    <Link
      to={`/resume/${id}`}
      className="resume-card animate-in fade-in duration-1000"
    >
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          {companyName && (
            <h2 className="text-black! font-bold wrap-break-word">{companyName}</h2>
          )}
          {jobTitle && (
            <h3 className="text-lg wrap-break-word text-gray-500">{jobTitle}</h3>
          )}
          {!companyName && !jobTitle && (
            <h2 className="text-black! font-bold">Resume</h2>
          )}
        </div>
        <div className="shrink-0">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>

      {resumeUrl && (
        <div className="gradient-border animate-in fade-in duration-1000">
          <div className="w-full h-full">
            <img
              src={resumeUrl}
              alt={`Resume preview${companyName ? ` for ${companyName}` : ""}${jobTitle ? ` - ${jobTitle}` : ""
                }`}
              className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
            />
          </div>
        </div>
      )}
    </Link>
  );
};
export default ResumeCard;
