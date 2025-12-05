'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ImportService } from '@/services/import';

export async function importSurveyData(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const file = formData.get('file') as File;
        const projectId = formData.get('projectId') as string;

        if (!file || !projectId) {
            return { success: false, error: 'Missing file or project ID' };
        }

        const buffer = await file.arrayBuffer();
        const content = new TextDecoder().decode(buffer);

        const result = await ImportService.processSurveyFile(projectId, file.name, content);

        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true, count: result.count };

    } catch (error: any) {
        console.error('Import error:', error);
        return { success: false, error: error.message || 'Failed to process file' };
    }
}
