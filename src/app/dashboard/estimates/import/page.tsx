"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { EstimateReview } from "@/components/estimates/EstimateReview";
import { extractEstimateData } from "@/actions/import";

export default function ImportEstimatesPage() {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [extractedData, setExtractedData] = useState<any[] | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const newFiles = Array.from(e.dataTransfer.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        try {
            const allExtracted: any[] = [];

            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const result = await extractEstimateData(formData);

                if (result?.data) {
                    allExtracted.push(...result.data);
                } else {
                    console.error(`Failed to process ${file.name}:`, result?.error);
                }
            }

            setExtractedData(allExtracted);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    if (extractedData) {
        return (
            <div className="container mx-auto p-6 space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Review Extracted Data</h1>
                    <Button variant="outline" onClick={() => setExtractedData(null)}>
                        Upload New File
                    </Button>
                </div>
                <EstimateReview initialData={extractedData} />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Import Estimates</h1>
                <p className="text-slate-500">
                    Upload PDF takeoffs or Excel estimates to automatically extract line items.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>File Upload</CardTitle>
                    <CardDescription>
                        Drag and drop your files here, or click to select. Supported formats: PDF, XLSX, CSV.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            multiple
                            onChange={handleChange}
                            accept=".pdf,.xlsx,.xls,.csv"
                        />
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className={`w-12 h-12 mb-4 ${dragActive ? "text-blue-500" : "text-slate-400"}`} />
                            <p className="mb-2 text-sm text-slate-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">PDF, Excel, or CSV (MAX. 10MB)</p>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-6 space-y-4">
                            <h3 className="text-sm font-medium text-slate-900">Selected Files</h3>
                            <div className="grid gap-4">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{file.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFiles(files.filter((_, i) => i !== index));
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={handleUpload} disabled={uploading}>
                                    {uploading ? "Processing..." : "Start Extraction"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
