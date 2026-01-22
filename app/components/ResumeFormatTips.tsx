interface ResumeFormatTipsProps {
  formattingTips: ImprovedResume["formattingTips"];
}

const ResumeFormatTips = ({ formattingTips }: ResumeFormatTipsProps) => {
  return (
    <section className="bg-linear-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Resume Formatting Tips
      </h2>
      <p className="text-gray-700 mb-6">
        Tailored formatting recommendations based on your resume length and the
        job you're applying for.
      </p>

      {/* Page Count Recommendation */}
      {formattingTips?.pageCount && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Page Count Recommendation
          </h3>
          <div className="flex items-center gap-4 mb-2">
            <div>
              <span className="text-sm text-gray-600">Current: </span>
              <span className="font-semibold text-gray-900">
                {formattingTips.pageCount?.current ?? "N/A"} page(s)
              </span>
            </div>
            <span className="text-gray-400">→</span>
            <div>
              <span className="text-sm text-gray-600">Recommended: </span>
              <span className="font-semibold text-blue-600">
                {formattingTips.pageCount?.recommended ?? "N/A"} page(s)
              </span>
            </div>
          </div>
          {formattingTips.pageCount?.reasoning && (
            <p className="text-sm text-gray-700">
              {formattingTips.pageCount.reasoning}
            </p>
          )}
        </div>
      )}

      {/* Typography */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Font Family</h4>
            <p className="text-gray-700 font-mono text-sm bg-gray-50 p-2 rounded">
              {formattingTips.fontFamily}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Letter Spacing</h4>
            <p className="text-gray-700">{formattingTips.letterSpacing}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Line Spacing</h4>
            <p className="text-gray-700">{formattingTips.lineSpacing}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Margins</h4>
            <p className="text-gray-700">{formattingTips.margins}</p>
          </div>
        </div>
      </div>

      {/* Font Sizes */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Sizes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Name</h4>
            <p className="text-gray-700">{formattingTips.fontSize.name}</p>
            <p className="text-xs text-gray-600 mt-1">
              Weight: {formattingTips.fontWeight.name}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Headings</h4>
            <p className="text-gray-700">{formattingTips.fontSize.headings}</p>
            <p className="text-xs text-gray-600 mt-1">
              Weight: {formattingTips.fontWeight.headings}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Body Text</h4>
            <p className="text-gray-700">{formattingTips.fontSize.body}</p>
            <p className="text-xs text-gray-600 mt-1">
              Weight: {formattingTips.fontWeight.body}
            </p>
          </div>
        </div>
      </div>

      {/* Essential Tips */}
      {formattingTips?.essentialTips && formattingTips.essentialTips.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Essential Formatting Tips
          </h3>
          <ul className="space-y-2">
            {(formattingTips.essentialTips || []).map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700">
                <svg
                  className="w-5 h-5 text-purple-600 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Industry-Specific Tips */}
      {formattingTips?.industrySpecific && formattingTips.industrySpecific.length > 0 && (
        <div className="p-4 bg-white rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Industry-Specific Recommendations
          </h3>
          <ul className="space-y-2">
            {(formattingTips.industrySpecific || []).map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ResumeFormatTips;
