'use client';

import React, { useState } from 'react';

export default function AutoLogUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        // Simulate OCR process with Hugging Face Donut or similar
        // In a real app, we would send the file to an API route that handles the HF call

        setTimeout(() => {
            setLogs([
                { rod: 1, time: '08:00', pressure: 1200 },
                { rod: 2, time: '08:15', pressure: 1250 },
                { rod: 3, time: '08:30', pressure: 1300 },
            ]);
            setUploading(false);
        }, 2000);
    };

    return (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold text-neon-blue mb-1">Auto-Log (OCR)</h3>
            <p className="text-xs text-gray-400 mb-4">Upload a photo of your drill log to automatically digitize it.</p>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-neon-blue file:text-black
                        hover:file:bg-blue-400 mb-2 md:mb-0"
                />
                <button
                    onClick={handleUpload}
                    disabled={uploading || !file}
                    className="px-4 py-2 bg-neon-green text-black font-bold rounded disabled:opacity-50 w-full md:w-auto"
                >
                    {uploading ? 'Scanning...' : 'Upload & Parse'}
                </button>
            </div>

            {logs.length > 0 && (
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                        <tr>
                            <th className="px-4 py-2">Rod #</th>
                            <th className="px-4 py-2">Time</th>
                            <th className="px-4 py-2">Pressure</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, i) => (
                            <tr key={i} className="border-b border-gray-700">
                                <td className="px-4 py-2">{log.rod}</td>
                                <td className="px-4 py-2">{log.time}</td>
                                <td className="px-4 py-2">{log.pressure}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
