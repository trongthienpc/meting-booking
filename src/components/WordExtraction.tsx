"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, CheckCircle, Download } from "lucide-react";
import { toast } from "sonner";

export default function WordExtraction() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedContent, setExtractedContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setExtractedContent(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Vui lòng chọn file Word để trích xuất.");
      return;
    }

    const fileType = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["docx", "doc"].includes(fileType || "")) {
      toast.error("Vui lòng chọn file Word (.docx hoặc .doc).");
      return;
    }

    setIsUploading(true);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);

    try {
      // Upload file to API route
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/parse-word", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const cvData = await response.json();

      // Format extracted data for display
      const formattedContent = `
        Tên: ${cvData.name}
        Email: ${cvData.email}
        Điện thoại: ${cvData.phone}
        Địa chỉ: ${cvData.address}
      `;

      setExtractedContent(formattedContent);

      toast.success("Trích xuất thông tin thành công!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi khi trích xuất";
      toast.error(message);
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => setIsUploading(false), 500);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Trích xuất thông tin từ Word
          </CardTitle>
          <CardDescription>Tải lên file Word để trích xuất nội dung.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid w-full items-center gap-1.5">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${selectedFile ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-primary"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB • Click để đổi file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="font-medium">Click để tải lên hoặc kéo thả file</p>
                    <p className="text-sm text-gray-500">.docx hoặc .doc</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".docx,.doc"
                className="hidden"
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Đang tải lên...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button type="submit" disabled={isUploading || !selectedFile} className="w-full">
              {isUploading ? "Đang xử lý..." : "Trích xuất thông tin"}
            </Button>
          </form>

          {extractedContent && (
            <div className="mt-6 space-y-4">
              <h3 className="font-medium">Nội dung trích xuất:</h3>
              <div className="border rounded p-4 bg-gray-50 whitespace-pre-line">{extractedContent}</div>
              <Button variant="outline" className="w-full mt-2">
                <Download className="w-4 h-4 mr-2" />
                Tải xuống kết quả
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
