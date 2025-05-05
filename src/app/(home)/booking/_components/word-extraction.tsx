// app/word-extraction/page.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, CheckCircle, Download, Eye, Cpu } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CVData } from "@/lib/schemas/cv";

export default function WordExtraction() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<CVData | null>(null);
  const [formattedText, setFormattedText] = useState<string | null>(null);
  const [extractionMethod, setExtractionMethod] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useAI, setUseAI] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setExtractedData(null);
    setFormattedText(null);
    setUploadProgress(0);
    setExtractionMethod(null);
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

    // Mô phỏng tiến trình tải lên
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + (useAI ? 3 : 5); // AI chậm hơn một chút
      });
    }, 100);

    try {
      // Tải file lên API route
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("useAI", useAI.toString());

      const response = await fetch("/api/parse-word", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi không xác định");
      }

      const result = await response.json();
      setExtractedData(result);
      setFormattedText(result.formattedText);
      setExtractionMethod(result.method);

      toast.success(`Trích xuất thông tin thành công bằng ${result.method === "ai" ? "AI" : "phân tích cú pháp"}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi khi trích xuất";
      toast.error(message);
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => setIsUploading(false), 500);
    }
  };

  const downloadResults = () => {
    if (!formattedText) return;

    const blob = new Blob([formattedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `CV_${extractedData?.name || "extracted"}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const downloadJSON = () => {
    if (!extractedData) return;

    const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `CV_${extractedData?.name || "extracted"}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto py-8 overflow-auto">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Trích xuất thông tin từ CV Word
          </CardTitle>
          <CardDescription>
            Tải lên file CV Word để trích xuất thông tin cá nhân, học vấn, kinh nghiệm và kỹ năng.
          </CardDescription>
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

            <div className="flex items-center space-x-2">
              <Switch id="use-ai" checked={useAI} onCheckedChange={setUseAI} />
              <Label htmlFor="use-ai" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" /> Sử dụng AI để trích xuất thông tin (chính xác hơn)
              </Label>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Đang xử lý{useAI ? " với AI" : ""}...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button type="submit" disabled={isUploading || !selectedFile} className="w-full">
              {isUploading ? "Đang xử lý..." : "Trích xuất thông tin"}
            </Button>
          </form>

          {extractedData && formattedText && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Thông tin đã trích xuất:</h3>
                {extractionMethod && (
                  <span className="text-sm px-2 py-1  rounded-full">
                    {extractionMethod === "ai" ? "Trích xuất bằng AI" : "Trích xuất bằng phân tích cú pháp"}
                  </span>
                )}
              </div>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-2" />
                    Xem trước
                  </TabsTrigger>
                  <TabsTrigger value="json">
                    <FileText className="h-4 w-4 mr-2" />
                    Dữ liệu JSON
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-4">
                  <div className="border rounded-md p-4  whitespace-pre-line">{formattedText}</div>
                  <Button variant="outline" className="mt-4 w-full" onClick={downloadResults}>
                    <Download className="w-4 h-4 mr-2" />
                    Tải xuống dạng văn bản
                  </Button>
                </TabsContent>

                <TabsContent value="json" className="mt-4">
                  <pre className="border rounded-md p-4  text-xs overflow-auto max-h-96">
                    {JSON.stringify(extractedData, null, 2)}
                  </pre>
                  <Button variant="outline" className="mt-4 w-full" onClick={downloadJSON}>
                    <Download className="w-4 h-4 mr-2" />
                    Tải xuống dạng JSON
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
