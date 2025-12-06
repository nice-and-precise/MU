"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WhiteLiningFormProps {
    projectId: string;
    onComplete: (data: any) => void;
}

export function WhiteLiningForm({ projectId, onComplete }: WhiteLiningFormProps) {
    const [description, setDescription] = useState("");
    const [isOverMarked, setIsOverMarked] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const newPhotos: string[] = [];
        Array.from(e.target.files).forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`File ${file.name} too large (max 5MB)`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setPhotos(prev => [...prev, reader.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { createWhiteLining } = await import("@/actions/216d/compliance");

            const res = await createWhiteLining({
                projectId,
                description,
                isOverMarked,
                photoUrls: photos,
            });

            if (res?.data) {
                toast.success("White Lining Snapshots Saved");
                onComplete(res.data);
            } else {
                toast.error(res?.error || "Failed to save snapshot");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
                <CardTitle className="text-xl">White Lining Evidence</CardTitle>
                <CardDescription>
                    Physical white markings are required. Upload photos of the marked area.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-900 dark:text-slate-100 font-medium">Excavation Description</Label>
                        <Textarea
                            id="description"
                            placeholder="e.g. Boring from pedestal A to pedestal B..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-emerald-500 min-h-[100px]"
                        />
                    </div>

                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
                        <input
                            type="checkbox"
                            id="overmarked"
                            className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                            checked={isOverMarked}
                            onChange={(e) => setIsOverMarked(e.target.checked)}
                        />
                        <Label htmlFor="overmarked" className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                            Area is Over-Marked (White + Black for existing)
                        </Label>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-slate-900 dark:text-slate-100 font-medium">Photos</Label>

                        {/* Photo Grid */}
                        {photos.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {photos.map((photo, i) => (
                                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                        <img src={photo} alt={`Evidence ${i}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(i)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="dropzone-file"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="w-8 h-8 mb-4 text-slate-400" />
                                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="font-semibold text-emerald-600 hover:text-emerald-500">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">PNG, JPG (MAX. 5MB)</p>
                                </div>
                                <input
                                    id="dropzone-file"
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving...
                            </>
                        ) : "Save Snapshot"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
