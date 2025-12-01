"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { importSurveyData } from '@/actions/import';

interface DataImportDropzoneProps {
    projectId: string;
    onImportComplete?: () => void;
}

export default function DataImportDropzone({ projectId, onImportComplete }: DataImportDropzoneProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setIsUploading(true);
        setStatus(null);

        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);

        try {
            const result = await importSurveyData(formData);

            if (result.success) {
                setStatus({ type: 'success', message: `Successfully imported ${result.count} records from ${file.name}` });
                if (onImportComplete) onImportComplete();
            } else {
                setStatus({ type: 'error', message: result.error || 'Import failed' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred during upload.' });
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    }, [projectId, onImportComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/xml': ['.xml', '.witsml'],
            'text/xml': ['.xml', '.witsml']
        },
        maxFiles: 1,
        disabled: isUploading
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Import Survey Data
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    {...getRootProps()}
                    className={`
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'}
                        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center gap-3">
                        {isUploading ? (
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        ) : (
                            <FileText className="w-10 h-10 text-slate-400" />
                        )}

                        <div className="text-sm text-slate-300">
                            {isUploading ? (
                                <p>Processing file...</p>
                            ) : isDragActive ? (
                                <p className="text-blue-400 font-medium">Drop the file here...</p>
                            ) : (
                                <>
                                    <p className="font-medium">Drag & drop a WITSML or CSV file here</p>
                                    <p className="text-slate-500 mt-1">or click to select a file</p>
                                </>
                            )}
                        </div>

                        {!isUploading && (
                            <div className="text-xs text-slate-500 mt-2">
                                Supports .csv, .xml, .witsml
                            </div>
                        )}
                    </div>
                </div>

                {status && (
                    <div className={`mt-4 p-3 rounded-md flex items-start gap-2 text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400' :
                            status.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                'bg-blue-500/10 text-blue-400'
                        }`}>
                        {status.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5" /> :
                            status.type === 'error' ? <AlertCircle className="w-4 h-4 mt-0.5" /> :
                                <AlertCircle className="w-4 h-4 mt-0.5" />}
                        <span>{status.message}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
