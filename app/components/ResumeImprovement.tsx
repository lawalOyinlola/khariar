import { useState, useRef, useEffect } from "react";

interface ResumeImprovementProps {
  improvedResume: ImprovedResume;
}

const ResumeImprovement = ({ improvedResume }: ResumeImprovementProps) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);

      // Clear any existing timeout before creating a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Create new timeout and store it in the ref
      timeoutRef.current = setTimeout(() => {
        setCopiedSection(null);
        timeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const SectionHeader = ({
    title,
    sectionId,
    content,
    isNew,
    changes,
  }: {
    title: string;
    sectionId: string;
    content: string;
    isNew: boolean;
    changes: string;
  }) => (
    <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-gray-200">
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {isNew && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
              NEW/IMPROVED
            </span>
          )}
          {!isNew && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
              MAINTAINED
            </span>
          )}
          <span className="text-sm text-gray-600">{changes}</span>
        </div>
      </div>
      <button
        type="button"
        title="Copy to clipboard"
        onClick={() => copyToClipboard(content, sectionId)}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        {copiedSection === sectionId ? (
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Copied!
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  );

  const formatDescription = (description: string) => {
    // Split by bullet points or new lines
    const lines = description
      .split(/\n|•|-\s+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return (
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        {lines.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Improvement Summary
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Overall Improvements:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {improvedResume.summary.overallImprovements.map((improvement, idx) => (
                <li key={idx}>{improvement}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              ATS Optimizations:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {improvedResume.summary.atsOptimization.map((opt, idx) => (
                <li key={idx}>{opt}</li>
              ))}
            </ul>
          </div>
          {improvedResume.summary.keywordsAdded.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Keywords Added:
              </h3>
              <div className="flex flex-wrap gap-2">
                {improvedResume.summary.keywordsAdded.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <SectionHeader
          title="Contact Information"
          sectionId="contact"
          content={improvedResume.contactInformation.content}
          isNew={improvedResume.contactInformation.isNew}
          changes={improvedResume.contactInformation.changes}
        />
        <div className="text-gray-700 whitespace-pre-line">
          {improvedResume.contactInformation.content}
        </div>
      </section>

      {/* Professional Summary */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <SectionHeader
          title="Professional Summary"
          sectionId="summary"
          content={improvedResume.professionalSummary.content}
          isNew={improvedResume.professionalSummary.isNew}
          changes={improvedResume.professionalSummary.changes}
        />
        <div className="text-gray-700 whitespace-pre-line">
          {improvedResume.professionalSummary.content}
        </div>
      </section>

      {/* Work Experience */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Work Experience</h3>
          <button
            onClick={() => {
              const allExperience = improvedResume.workExperience.items
                .map(
                  (item) =>
                    `${item.position} at ${item.company}\n${item.duration}${item.location ? ` | ${item.location}` : ""
                    }\n${item.description}`
                )
                .join("\n\n");
              copyToClipboard(allExperience, "work-experience-all");
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {copiedSection === "work-experience-all" ? (
              <>Copied!</>
            ) : (
              <>Copy All</>
            )}
          </button>
        </div>
        <div className="space-y-6">
          {improvedResume.workExperience.items.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${item.isNew
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {item.position}
                  </h4>
                  <p className="text-gray-700 font-medium">{item.company}</p>
                  <p className="text-sm text-gray-600">
                    {item.duration}
                    {item.location && ` | ${item.location}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.isNew && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                      NEW
                    </span>
                  )}
                  <button
                    onClick={() => {
                      const content = `${item.position} at ${item.company}\n${item.duration}${item.location ? ` | ${item.location}` : ""
                        }\n${item.description}`;
                      copyToClipboard(content, `work-${idx}`);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    {copiedSection === `work-${idx}` ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 mb-2">
                {item.changes}
              </div>
              <div className="text-gray-700">
                {formatDescription(item.description)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Education</h3>
          <button
            onClick={() => {
              const allEducation = improvedResume.education.items
                .map(
                  (item) =>
                    `${item.degree}${item.fieldOfStudy ? ` in ${item.fieldOfStudy}` : ""}\n${item.institution}\n${item.duration}${item.location ? ` | ${item.location}` : ""
                    }${item.achievements ? `\n${item.achievements}` : ""}`
                )
                .join("\n\n");
              copyToClipboard(allEducation, "education-all");
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {copiedSection === "education-all" ? <>Copied!</> : <>Copy All</>}
          </button>
        </div>
        <div className="space-y-4">
          {improvedResume.education.items.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${item.isNew
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {item.degree}
                    {item.fieldOfStudy && (
                      <span className="text-gray-600"> in {item.fieldOfStudy}</span>
                    )}
                  </h4>
                  <p className="text-gray-700 font-medium">{item.institution}</p>
                  <p className="text-sm text-gray-600">
                    {item.duration}
                    {item.location && ` | ${item.location}`}
                  </p>
                  {item.achievements && (
                    <p className="text-sm text-gray-700 mt-1">
                      {item.achievements}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.isNew && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                      NEW
                    </span>
                  )}
                  <button
                    onClick={() => {
                      const content = `${item.degree}${item.fieldOfStudy ? ` in ${item.fieldOfStudy}` : ""}\n${item.institution}\n${item.duration}${item.location ? ` | ${item.location}` : ""
                        }${item.achievements ? `\n${item.achievements}` : ""}`;
                      copyToClipboard(content, `education-${idx}`);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    {copiedSection === `education-${idx}` ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">{item.changes}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <SectionHeader
          title="Skills"
          sectionId="skills"
          content={`Technical Skills: ${improvedResume.skills.technical.join(", ")}\n\nSoft Skills: ${improvedResume.skills.soft.join(", ")}${improvedResume.skills.certifications
            ? `\n\nCertifications: ${improvedResume.skills.certifications.join(", ")}`
            : ""
            }`}
          isNew={improvedResume.skills.isNew}
          changes={improvedResume.skills.changes}
        />
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              Technical Skills:
            </h4>
            <div className="flex flex-wrap gap-2">
              {improvedResume.skills.technical.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Soft Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {improvedResume.skills.soft.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          {improvedResume.skills.certifications &&
            improvedResume.skills.certifications.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Certifications:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {improvedResume.skills.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      </section>

      {/* Additional Sections */}
      {improvedResume.additionalSections &&
        Object.entries(improvedResume.additionalSections).map(
          ([sectionName, section]) => (
            <section
              key={sectionName}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4 capitalize">
                {sectionName.replace(/([A-Z])/g, " $1").trim()}
              </h3>
              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${item.isNew
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {item.title}
                        </h4>
                        <div className="text-gray-700 mt-1">
                          {formatDescription(item.description)}
                        </div>
                      </div>
                      {item.isNew && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded ml-2">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {item.changes}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        )}
    </div>
  );
};

export default ResumeImprovement;
