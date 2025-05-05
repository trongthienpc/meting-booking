"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileSpreadsheet, Upload, CheckCircle, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { importRooms } from "@/app/actions/import-room";

export default function ImportRoom() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    // Reset states when a new file is selected
    setResult(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a CSV or Excel file to import.");
      return;
    }

    const fileType = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileType || "")) {
      toast.error("Please select a CSV or Excel file (.csv, .xlsx, .xls).");
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
      const importResult = await importRooms(selectedFile);

      if (!importResult.success) {
        toast.error(importResult.message);
        setResult(null);
        return;
      }

      setResult(importResult);

      if (importResult.success) {
        toast.warning(`Imported: ${importResult?.imported}, Failed: ${importResult?.failed}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(message);
      setResult(null);
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => setIsUploading(false), 500);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "name",
      "capacity",
      "floor",
      "description",
      "status",
      "minBookingTime",
      "maxBookingTime",
      "maxAdvanceBooking",
      "cancellationTime",
    ];

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "room_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Import Room
          </CardTitle>
          <CardDescription>Upload a CSV or Excel file to import room data.</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList className="mb-4">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
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
                          {(selectedFile.size / 1024).toFixed(2)} KB • Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">.csv, .xlsx, or .xls files</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                  />
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {result && (
                  <Alert variant={result.success ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {result.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                      <AlertTitle>{result.success ? "Import successful" : "Import completed with issues"}</AlertTitle>
                    </div>
                    <AlertDescription className="mt-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Imported records:</span>
                        <span className="font-medium">{result.imported}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Failed records:</span>
                        <span className="font-medium">{result.failed}</span>
                      </div>

                      {result.errors.length > 0 && (
                        <div className="mt-4">
                          <p className="font-medium mb-2">Errors:</p>
                          <div className="max-h-40 overflow-y-auto border rounded p-2">
                            {result.errors.map((error, index) => (
                              <div key={index} className="text-sm py-1 border-b last:border-0">
                                <span className="font-medium">Row {error.row}:</span> {error.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </TabsContent>

            <TabsContent value="instructions">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">File Format Requirements</h3>
                  <p className="text-gray-600 mt-1">The CSV or Excel file must contain the following columns:</p>
                  <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                    <li>
                      <span className="font-medium">name</span> - Room name (required)
                    </li>
                    <li>
                      <span className="font-medium">capacity</span> - Room capacity, must be greater than 0 (required)
                    </li>
                    <li>
                      <span className="font-medium">floor</span> - Floor location (optional)
                    </li>
                    <li>
                      <span className="font-medium">description</span> - Room description (optional)
                    </li>
                    <li>
                      <span className="font-medium">status</span> - Room status (true/false)
                    </li>
                    <li>
                      <span className="font-medium">minBookingTime</span> - Minimum booking time in minutes (e.g., 30)
                    </li>
                    <li>
                      <span className="font-medium">maxBookingTime</span> - Maximum booking time in minutes (e.g., 480)
                    </li>
                    <li>
                      <span className="font-medium">maxAdvanceBooking</span> - Maximum days in advance for booking
                      (e.g., 30)
                    </li>
                    <li>
                      <span className="font-medium">cancellationTime</span> - Hours before meeting for cancellation
                      (e.g., 24)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Tips for Successful Import</h3>
                  <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                    <li>Make sure all required fields are filled</li>
                    <li>Use consistent date format (YYYY-MM-DD)</li>
                    <li>Numeric fields should contain only numbers</li>
                    <li>If a room with the same name already exists, it will be updated</li>
                  </ul>
                </div>

                <div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={downloadTemplate}>
                    <Download className="h-4 w-4" />
                    Download template
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFile(null);
              setResult(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!selectedFile || isUploading}
            onClick={handleSubmit}
            className="flex items-center gap-2"
          >
            {isUploading ? "Processing..." : "Import Data"}
            {!isUploading && <Upload className="h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
