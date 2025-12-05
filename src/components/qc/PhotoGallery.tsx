'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Image as ImageIcon, Upload, Loader2, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { createPhoto, deletePhoto } from '@/actions/qc';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PhotoGalleryProps {
    photos: any[];
    projectId?: string;
}

export default function PhotoGallery({ photos, projectId }: PhotoGalleryProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
    const [deletingPhoto, setDeletingPhoto] = useState<any>(null);

    const handleUpload = async () => {
        if (!url || !projectId) return;
        setLoading(true);

        if (!url.startsWith('http')) {
            toast.error("Please enter a valid URL starting with http:// or https://");
            setLoading(false);
            return;
        }

        const res = await createPhoto({
            projectId,
            url
        });

        if (res.success) {
            setIsDialogOpen(false);
            setUrl('');
            router.refresh();
            toast.success("Photo added successfully");
        } else {
            toast.error("Failed to add photo");
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!deletingPhoto || !projectId) return;
        setLoading(true);
        const res = await deletePhoto({ id: deletingPhoto.id, projectId });

        if (res.success) {
            toast.success("Photo deleted");
            setDeletingPhoto(null);
            setSelectedPhoto(null); // Close lightbox if open
            router.refresh();
        } else {
            toast.error("Failed to delete photo");
        }
        setLoading(false);
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-xl font-heading tracking-tight">
                        <ImageIcon className="w-5 h-5 text-primary" /> Photo Gallery
                    </CardTitle>
                    <CardDescription>
                        {photos.length} photos uploaded
                    </CardDescription>
                </div>
                {projectId && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Upload className="w-4 h-4" /> Add Photo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Project Photo</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Photo URL</label>
                                    <Input
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="bg-background"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Paste a direct link to the image file.
                                    </p>
                                </div>
                                <Button onClick={handleUpload} disabled={loading || !url} className="w-full">
                                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Save Photo"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                    {photos.map(photo => (
                        <div
                            key={photo.id}
                            className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-muted/20 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-primary/20 cursor-pointer"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={photo.thumbnailUrl || photo.url}
                                alt="Project Photo"
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                                <p className="text-white text-xs font-medium truncate flex-1 mr-2">
                                    Added by {photo.uploadedBy?.name || 'Unknown'}
                                </p>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingPhoto(photo);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {photos.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center space-y-3 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                            <ImageIcon className="w-10 h-10 opacity-20" />
                            <div className="space-y-1">
                                <p className="font-medium text-foreground">No photos yet</p>
                                <p className="text-xs">Upload photos to document progress</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Lightbox Dialog */}
            <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={selectedPhoto?.url}
                            alt="Full view"
                            className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain bg-black/50 backdrop-blur-sm"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                            {projectId && (
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-full shadow-lg"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingPhoto(selectedPhoto);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 rounded-full shadow-lg"
                                onClick={() => setSelectedPhoto(null)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingPhoto} onOpenChange={(open) => !open && setDeletingPhoto(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove the photo from the project.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
