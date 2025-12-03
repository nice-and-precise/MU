"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload } from "lucide-react";

interface WhiteLiningFormProps {
    projectId: string;
    onComplete: (data: any) => void;
}

export function WhiteLiningForm({ projectId, onComplete }: WhiteLiningFormProps) {
    const [description, setDescription] = useState("");
    const [isOverMarked, setIsOverMarked] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Upload files and call server action
        onComplete({ description, isOverMarked, files });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>White Lining Evidence</CardTitle>
                <CardDescription>
                    Physical white markings are required. Upload photos of the marked area.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Excavation Description</Label>
                        <Textarea
                            id="description"
                            placeholder="e.g. Boring from pedestal A to pedestal B..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="overmarked"
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                            checked={isOverMarked}
                            onChange={(e) => setIsOverMarked(e.target.checked)}
                        />
                        <Label htmlFor="overmarked">Area is Over-Marked (White + Black)</Label>
                    </div>

                    <div className="space-y-2">
                        <Label>Photos</Label>
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="dropzone-file"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="w-8 h-8 mb-4 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG (MAX. 10MB)</p>
                                </div>
                                <input
                                    id="dropzone-file"
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setFiles(e.target.files)}
                                />
                            </label>
                        </div>
                        {files && (
                            <div className="text-sm text-gray-500">
                                {files.length} file(s) selected
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full">Save Snapshot</Button>
                </form>
            </CardContent>
        </Card>
    );
}
