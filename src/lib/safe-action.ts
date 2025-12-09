import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

export type ActionState<T> =
    | { success: true; data: T; error?: never }
    | { success: false; error: string; data?: never };

/**
 * 🎓 The Fortress Pattern: authenticatedAction
 * 
 * This wrapper acts as a fortress around your server actions.
 * 1. Gatekeeper: It checks if the user is logged in.
 * 2. Inspector: It validates the input data against a Zod schema.
 * 3. Scribe: It catches and logs errors.
 * 
 * @param schema The Zod schema to validate the input.
 * @param handler The function that contains your business logic.
 */
export function authenticatedAction<S extends z.ZodType<any, any, any>, TOutput>(
    schema: S,
    handler: (data: z.output<S>, userId: string) => Promise<TOutput>
) {
    return async (rawData: z.input<S>): Promise<ActionState<TOutput>> => {
        // 1. Gatekeeper: Check Authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return { success: false, error: 'Unauthorized: You must be logged in.' };
        }

        // 2. Inspector: Validate Input
        const validation = schema.safeParse(rawData);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues[0].message
            };
        }

        // 3. Execute Logic & Catch Errors
        try {
            const result = await handler(validation.data, session.user.id);
            return { success: true, data: result };
        } catch (error) {
            console.error('Action failed:', error);
            // In a real app, you might want to differentiate between expected errors (e.g., "Not Found")
            // and unexpected crashes. For now, we return a generic message to the UI.
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred.'
            };
        }
    };
}

/**
 * A simpler wrapper for actions that don't require input validation (e.g., delete by ID),
 * but still need authentication.
 */
export function authenticatedActionNoInput<TOutput>(
    handler: (userId: string) => Promise<TOutput>
) {
    return async (): Promise<ActionState<TOutput>> => {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        try {
            const result = await handler(session.user.id);
            return { success: true, data: result };
        } catch (error) {
            console.error('Action failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred.'
            };
        }
    };
}
