import { useCallback, useState, useEffect } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { formatSize } from "~/lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
  file?: File | null;
  onError?: (error: string | null) => void;
  error?: string;
}

const FileUploader = ({
  onFileSelect,
  file: controlledFile,
  onError,
  error: externalError,
}: FileUploaderProps) => {
  const [error, setError] = useState<string | null>(null);
  const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      setError(null);
      onError?.(null);
      onFileSelect?.(file);
    },
    [onFileSelect, onError]
  );

  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      const rejection = fileRejections[0];
      if (!rejection) return;

      let errorMessage = "File upload failed";

      if (rejection.errors.length > 0) {
        const error = rejection.errors[0];
        if (error.code === "file-too-large") {
          errorMessage = `File size exceeds the maximum limit of ${formatSize(
            maxFileSize
          )}`;
        } else if (error.code === "file-invalid-type") {
          errorMessage = "Only PDF files are allowed";
        } else {
          errorMessage = error.message || "Invalid file";
        }
      }

      setError(errorMessage);
      onError?.(errorMessage);
      onFileSelect?.(null);
    },
    [onFileSelect, onError, maxFileSize]
  );

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: maxFileSize,
  });

  // Use controlled file if provided, otherwise use dropzone's acceptedFiles
  const file =
    controlledFile !== undefined ? controlledFile : acceptedFiles[0] || null;

  // Clear error when file is cleared externally
  useEffect(() => {
    if (controlledFile === null) {
      setError(null);
      onError?.(null);
    }
  }, [controlledFile, onError]);

  const displayError = externalError || error;

  return (
    <div className="w-full">
      <div className={`gradient-border ${displayError ? "uploader-error" : ""}`}>
        <div {...getRootProps()}>
          <input {...getInputProps()} />

          <div className="space-y-4 cursor-pointer">
            {file ? (
              <div
                className="uploader-selected-file"
                onClick={(e) => e.stopPropagation()}
              >
                <img src="/images/pdf.png" alt="pdf" className="size-10" />
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-2 cursor-pointer"
                  onClick={() => {
                    onFileSelect?.(null);
                  }}
                >
                  <img
                    src="/icons/cross.svg"
                    alt="remove"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            ) : (
              <div>
                <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                  <img src="/icons/info.svg" alt="info" className="size-20" />
                </div>
                <p className="text-lg text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-lg text-gray-500">
                  PDF (max {formatSize(maxFileSize)})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {displayError && (
        <span className="error-message">{displayError}</span>
      )}
    </div>
  );
};
export default FileUploader;
