import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";

interface ResumeItem {
  key: string;
  resume: Resume;
}

const WipeApp = () => {
  const { auth, isLoading, error, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedResumes, setSelectedResumes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    if (!fs || !kv) return;

    setLoading(true);
    try {
      // Load files
      const fileList = (await fs.readDir("./")) as FSItem[];
      setFiles(fileList || []);

      // Load resumes from KV
      const resumeList = (await kv.list("resume:*", true)) as KVItem[];
      const parsedResumes = resumeList?.map((item) => ({
        key: item.key,
        resume: JSON.parse(item.value) as Resume,
      })) || [];
      setResumes(parsedResumes);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fs || !kv) return;
    loadData();
  }, [fs, kv]);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const toggleResumeSelection = (resumeKey: string) => {
    const newSelected = new Set(selectedResumes);
    if (newSelected.has(resumeKey)) {
      newSelected.delete(resumeKey);
    } else {
      newSelected.add(resumeKey);
    }
    setSelectedResumes(newSelected);
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    }
  };

  const selectAllResumes = () => {
    if (selectedResumes.size === resumes.length) {
      setSelectedResumes(new Set());
    } else {
      setSelectedResumes(new Set(resumes.map((r) => r.key)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0 && selectedResumes.size === 0) {
      alert("Please select at least one item to delete.");
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedFiles.size + selectedResumes.size
      } selected item(s)? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleting(true);
    try {
      const deletePromises: Promise<any>[] = [];

      // Delete selected files
      for (const fileId of selectedFiles) {
        const file = files.find((f) => f.id === fileId);
        if (file) {
          deletePromises.push(
            fs.delete(file.path).catch((err: any) => {
              if (err?.code !== 'subject_does_not_exist') {
                console.warn(`Failed to delete file ${file.path}:`, err);
              }
            })
          );
        }
      }

      // Delete selected resumes and their associated files
      for (const resumeKey of selectedResumes) {
        const resumeItem = resumes.find((r) => r.key === resumeKey);
        if (resumeItem) {
          const resume = resumeItem.resume;
          // Delete KV entry
          deletePromises.push(
            kv.delete(resumeKey).catch((err) => {
              console.warn(`Failed to delete KV entry ${resumeKey}:`, err);
            })
          );
          // Delete associated files (ignore "not found" errors)
          if (resume.resumePath) {
            deletePromises.push(
              fs.delete(resume.resumePath).catch((err: any) => {
                if (err?.code !== 'subject_does_not_exist') {
                  console.warn(`Failed to delete resume file ${resume.resumePath}:`, err);
                }
              })
            );
          }
          if (resume.imagePath) {
            deletePromises.push(
              fs.delete(resume.imagePath).catch((err: any) => {
                if (err?.code !== 'subject_does_not_exist') {
                  console.warn(`Failed to delete image file ${resume.imagePath}:`, err);
                }
              })
            );
          }
        }
      }

      await Promise.all(deletePromises);

      // Clear selections and reload data
      setSelectedFiles(new Set());
      setSelectedResumes(new Set());
      await loadData();

      alert("Selected items deleted successfully!");
    } catch (error) {
      console.error("Failed to delete items:", error);
      alert("Failed to delete some items. Please check the console for details.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL app data? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      // Delete all files
      await Promise.all(
        files.map((file) =>
          fs.delete(file.path).catch((err: any) => {
            if (err?.code !== 'subject_does_not_exist') {
              console.error(`Failed to delete file ${file.path}:`, err);
            }
          })
        )
      );

      // Delete all resumes and their files
      for (const resumeItem of resumes) {
        const resume = resumeItem.resume;
        try {
          await kv.delete(resumeItem.key);
        } catch (err) {
          console.warn(`Failed to delete KV entry ${resumeItem.key}:`, err);
        }
        if (resume.resumePath) {
          await fs.delete(resume.resumePath).catch((err: any) => {
            if (err?.code !== 'subject_does_not_exist') {
              console.error(`Failed to delete resume file ${resume.resumePath}:`, err);
            }
          });
        }
        if (resume.imagePath) {
          await fs.delete(resume.imagePath).catch((err: any) => {
            if (err?.code !== 'subject_does_not_exist') {
              console.error(`Failed to delete image file ${resume.imagePath}:`, err);
            }
          });
        }
      }

      // Clear KV store
      await kv.flush();

      // Clear selections and reload
      setSelectedFiles(new Set());
      setSelectedResumes(new Set());
      await loadData();

      alert("All data deleted successfully!");
    } catch (error) {
      console.error("Failed to delete all data:", error);
      alert("Failed to delete all data. Please check the console for details.");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />
        <div className="main-section flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />
        <div className="main-section flex items-center justify-center">
          <div className="text-red-600 text-xl">Error: {error}</div>
        </div>
      </main>
    );
  }

  const totalSelected = selectedFiles.size + selectedResumes.size;
  const hasAnyData = files.length > 0 || resumes.length > 0;

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-8">
          <h1>Manage App Data</h1>
          <h2 className="text-lg font-normal mt-2">
            Select items to delete or wipe all data
          </h2>

          {!hasAnyData ? (
            <div className="mt-8 p-6 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-600">No data found. Your storage is empty.</p>
              <Link
                to="/"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                ← Back to Home
              </Link>
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-4">
                {totalSelected > 0 && (
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handleDeleteSelected}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : `Delete Selected (${totalSelected})`}
                  </button>
                )}
                <button
                  className="bg-red-800 hover:bg-red-900 text-white px-6 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={handleDeleteAll}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete All Data"}
                </button>
                <Link
                  to="/"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md cursor-pointer transition-colors inline-block"
                >
                  ← Back to Home
                </Link>
              </div>

              {/* Resumes Section */}
              {resumes.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">
                      Resumes ({resumes.length})
                    </h3>
                    <button
                      className="text-sm text-blue-600 hover:underline"
                      onClick={selectAllResumes}
                    >
                      {selectedResumes.size === resumes.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="space-y-3">
                      {resumes.map((resumeItem) => {
                        const resume = resumeItem.resume;
                        const isSelected = selectedResumes.has(resumeItem.key);
                        return (
                          <div
                            key={resumeItem.key}
                            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-colors ${isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleResumeSelection(resumeItem.key)}
                              className="mt-1 h-5 cursor-pointer"
                            />
                            <div className="grow">
                              <div className="font-semibold text-lg">
                                {resume.companyName || "Untitled Resume"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {resume.jobTitle || "No job title"}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                ID: {resume.id}
                              </div>
                              {resume.feedback && typeof resume.feedback === "object" && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Score: {resume.feedback.overallScore || "N/A"}%
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Files Section */}
              {files.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Files ({files.length})</h3>
                    <button
                      className="text-sm text-blue-600 hover:underline"
                      onClick={selectAllFiles}
                    >
                      {selectedFiles.size === files.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="space-y-2">
                      {files.map((file) => {
                        const isSelected = selectedFiles.has(file.id);
                        const fileSize = file.size
                          ? `${(file.size / 1024).toFixed(2)} KB`
                          : "Unknown size";
                        return (
                          <div
                            key={file.id}
                            className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-colors ${isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleFileSelection(file.id)}
                              className="w-5 h-5 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{file.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {fileSize} • {file.path}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default WipeApp;
