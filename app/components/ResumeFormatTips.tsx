interface ResumeFormatTipsProps {
  formattingTips: ImprovedResume["formattingTips"];
}

const ResumeFormatTips = ({ formattingTips }: ResumeFormatTipsProps) => {
  return (
    <section className="bg-linear-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200 shadow-sm max-lg:mb-6">
      <p className="text-gray-700 mb-6">
        Tailored formatting recommendations based on your resume length and the
        job you're applying for.
      </p>

      {/* Page Count Recommendation */}
      {formattingTips?.pageCount && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Page Count Recommendation
          </h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <span className="text-sm text-gray-600 block mb-1">Current Length</span>
              <span className="font-semibold text-gray-900 text-lg">
                {formattingTips.pageCount?.current ?? "N/A"} page(s)
              </span>
            </div>
            <span className="text-gray-400 text-2xl">→</span>
            <div className="flex-1">
              <span className="text-sm text-gray-600 block mb-1">Recommended Length</span>
              <span className="font-semibold text-blue-600 text-lg">
                {formattingTips.pageCount?.recommended ?? "N/A"} page(s)
              </span>
            </div>
          </div>
          {formattingTips.pageCount?.reasoning && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border-l-4 border-blue-500">
              <p className="text-sm text-gray-700 leading-relaxed">
                {formattingTips.pageCount.reasoning}
              </p>
            </div>
          )}
          {formattingTips.pageCount?.current !== undefined &&
            formattingTips.pageCount?.recommended !== undefined && (
              <div className="mt-3">
                {formattingTips.pageCount.current === formattingTips.pageCount.recommended ? (
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Your resume length is optimal for your experience level.</span>
                  </div>
                ) : formattingTips.pageCount.current > formattingTips.pageCount.recommended ? (
                  <div className="flex items-center gap-2 text-amber-700 text-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Consider condensing your resume to improve recruiter attention and ATS performance.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">You have room to expand key sections with more detailed achievements.</span>
                  </div>
                )}
              </div>
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
                  aria-hidden="true"
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
                  aria-hidden="true"
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
