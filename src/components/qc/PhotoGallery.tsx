'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoGalleryProps {
    photos: any[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" /> Photo Gallery
                </CardTitle>
                <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" /> Upload Photo
                </Button>
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
                                {new Date(photo.createdAt).toLocaleDateString()} by {photo.uploadedBy.name}
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
