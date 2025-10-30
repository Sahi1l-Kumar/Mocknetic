"use client";

import { File, UploadCloud, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface FileUploadProgress {
  progress: number;
  file: File;
}

const PdfColor = {
  bgColor: "bg-blue-400",
  fillColor: "fill-blue-400",
};

export default function ResumeParserPage() {
  const router = useRouter();
  const [filesToUpload, setFilesToUpload] = useState<FileUploadProgress[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [parsedText, setParsedText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getFileIconAndColor = (file: File) => {
    if (file.type.includes("pdf")) {
      return {
        icon: <File size={40} className={PdfColor.fillColor} />,
        color: PdfColor.bgColor,
      };
    }
    return null;
  };

  const removeFile = (file: File) => {
    setFilesToUpload((prevUploadProgress) => {
      return prevUploadProgress.filter((item) => item.file !== file);
    });
  };

  const uploadFileToApi = async (file: File) => {
    const formData = new FormData();
    formData.append("FILE", file);

    try {
      setIsParsing(true);
      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const parsedText = await response.text();
      setParsedText(parsedText);
      setParseStatus("success");
      toast.success("Resume parsed and saved successfully!");
    } catch (error) {
      setParseStatus("error");
      setErrorMessage((error as Error).message);
      toast.error("Upload Failed", {
        description: (error as Error).message,
      });
    } finally {
      setIsParsing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      toast.error("Multiple files not allowed", {
        description: "Please upload only one PDF file.",
      });
      return;
    }

    const file = acceptedFiles[0];
    setFilesToUpload([{ file, progress: 100 }]);
    setUploadedFile(file);
    setParseStatus("idle");
    setErrorMessage("");
    setParsedText("");
    toast.success("File Uploaded", {
      description: `${file.name} has been uploaded successfully.`,
    });
    await uploadFileToApi(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 8 * 1024 * 1024,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium transition-all"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Resume Parser</h1>
          </div>
          <p className="text-slate-600 mb-8">
            Upload your resume to extract and save information to your profile
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label
                {...getRootProps()}
                className="relative flex flex-col items-center justify-center w-full py-6 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="text-center">
                  <div className="border p-2 rounded-md max-w-min mx-auto mb-3">
                    <UploadCloud size={20} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">
                      Drag and drop PDF files
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Click to upload files (files should be under 8 MB)
                  </p>
                </div>
              </label>
              <Input
                {...getInputProps()}
                id="dropzone-file"
                accept="application/pdf"
                type="file"
                className="hidden"
              />

              {filesToUpload.length > 0 && (
                <div className="mt-4">
                  <ScrollArea className="h-40">
                    <p className="font-medium my-2 text-slate-600 text-sm">
                      Files to upload
                    </p>
                    <div className="space-y-2 pr-3">
                      {filesToUpload.map((fileUploadProgress) => {
                        return (
                          <div
                            key={fileUploadProgress.file.lastModified}
                            className="flex justify-between gap-2 rounded-lg overflow-hidden border border-slate-100 group hover:pr-0 pr-2"
                          >
                            <div className="flex items-center flex-1 p-2">
                              <div className="text-blue-400">
                                {
                                  getFileIconAndColor(fileUploadProgress.file)
                                    ?.icon
                                }
                              </div>
                              <div className="w-full ml-2 space-y-1">
                                <div className="text-sm flex justify-between">
                                  <p className="text-slate-600">
                                    {fileUploadProgress.file.name.slice(0, 25)}
                                  </p>
                                  <span className="text-xs">
                                    {fileUploadProgress.progress}%
                                  </span>
                                </div>
                                <Progress value={fileUploadProgress.progress} />
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                removeFile(fileUploadProgress.file)
                              }
                              className="bg-red-500 text-white transition-all items-center justify-center cursor-pointer px-2 hidden group-hover:flex"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {errorMessage && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}

              {parseStatus === "success" && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">
                    Resume parsed and saved successfully!
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 h-full">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Parsed Information
                </h3>

                {!parsedText && parseStatus === "idle" && (
                  <p className="text-slate-500 text-center py-8">
                    Upload and parse a resume to see extracted information
                  </p>
                )}

                {isParsing && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}

                {parsedText && (
                  <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                      {parsedText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
