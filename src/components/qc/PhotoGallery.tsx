'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon, Upload, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { createPhoto } from '@/actions/qc';
import { useRouter } from 'next/navigation';

interface PhotoGalleryProps {
    photos: any[];
    projectId?: string; // Make optional to avoid breaking if not passed yet, but we should pass it
}

export default function PhotoGallery({ photos, projectId }: PhotoGalleryProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState('');

    const handleUpload = async () => {
        if (!url || !projectId) return;
        setLoading(true);

        const res = await createPhoto({
            projectId,
            url
        });

        if (res.success) {
            setIsDialogOpen(false);
            setUrl('');
            router.refresh();
        } else {
            alert('Failed to add photo');
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" /> Photo Gallery
                </CardTitle>
                {projectId && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Upload className="w-4 h-4 mr-2" /> Add Photo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Project Photo</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <label className="text-sm font-medium">Photo URL</label>
                                    <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
                                </div>
                                <Button onClick={handleUpload} disabled={loading || !url} className="w-full">
                                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Add Photo"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map(photo => (
                        <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={photo.thumbnailUrl || photo.url}
                                alt="Project Photo"
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                {new Date(photo.createdAt).toLocaleDateString()} by {photo.uploadedBy?.name || 'Unknown'}
                            </div>
                        </div>
                    ))}
                    {photos.length === 0 && (
                        <div className="col-span-full text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No photos uploaded yet.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
