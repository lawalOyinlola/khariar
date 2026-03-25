import { useEffect, useRef } from "react";

interface InvalidFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileType: string;
  fileDescription: string;
  onUploadAnother: () => void;
  onGenerateTemplate: () => void;
  isGenerating?: boolean;
}

const InvalidFileModal = ({
  isOpen,
  onClose,
  fileType,
  fileDescription,
  onUploadAnother,
  onGenerateTemplate,
  isGenerating = false,
}: InvalidFileModalProps) => {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isGenerating) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isGenerating, onClose]);

  // Focus trap - keep focus within modal
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus the modal when it opens
    const modal = modalRef.current;
    if (modal) {
      // Focus the first focusable element (close button)
      const firstFocusable = modal.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    // Handle Tab key for focus trap
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-grey-50/50 backdrop-blur-sm modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget && !isGenerating) {
          onClose();
        }
      }}
      onPointerDown={(e) => {
        // Prevent pointer events from reaching elements behind
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      onTouchStart={(e) => {
        // Prevent touch events from reaching elements behind
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
              File Type Mismatch
            </h2>
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isGenerating}
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <svg
                className="w-6 h-6 text-amber-600 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-semibold text-amber-900 mb-1">
                  This doesn't appear to be a resume
                </p>
                <p className="text-sm text-amber-800">
                  The file you uploaded appears to be a <strong>{fileType}</strong>.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">File Analysis:</h3>
              <p id="modal-description" className="text-gray-700 text-sm leading-relaxed">
                {fileDescription}
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>What would you like to do?</strong>
              </p>
              <p className="text-sm text-blue-800 mt-1">
                You can upload a different file or generate a sample resume template
                tailored to the job you're applying for.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={onUploadAnother}
              disabled={isGenerating}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload Another File
            </button>
            <button
              ref={lastFocusableRef}
              onClick={onGenerateTemplate}
              disabled={isGenerating}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Generate Sample Resume
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvalidFileModal;
