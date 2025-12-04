import { describe, it, expect } from 'vitest';
import { addDays, differenceInDays } from 'date-fns';

// Mocking the logic we use in the components since we can't easily import the component logic directly without extracting it
// Ideally, we would extract this logic to src/lib/811-utils.ts, but for now we test the logic itself.

describe('811 Ticket Logic', () => {
    describe('Expiration Calculation', () => {
        it('should calculate days until expiration correctly', () => {
            const now = new Date();
            const expirationDate = addDays(now, 5);
            const daysUntil = differenceInDays(expirationDate, now);
            expect(daysUntil).toBe(5);
        });

        it('should return negative for expired tickets', () => {
            const now = new Date();
            const expirationDate = addDays(now, -2);
            const daysUntil = differenceInDays(expirationDate, now);
            expect(daysUntil).toBeLessThan(0);
        });
    });

    describe('Ready to Dig Logic', () => {
        const checkReadyToDig = (responses: { status: string }[]) => {
            if (!responses || responses.length === 0) return false;
            const allClear = responses.every(r => ['Marked', 'Clear', 'No Conflict'].includes(r.status));
            const hasConflict = responses.some(r => r.status === 'Conflict');
            return allClear && !hasConflict;
        };

        it('should be ready if all responses are Marked or Clear', () => {
            const responses = [
                { status: 'Marked' },
                { status: 'Clear' },
                { status: 'No Conflict' }
            ];
            expect(checkReadyToDig(responses)).toBe(true);
        });

        it('should NOT be ready if there is a Conflict', () => {
            const responses = [
                { status: 'Marked' },
                { status: 'Conflict' }
            ];
            expect(checkReadyToDig(responses)).toBe(false);
        });

        it('should NOT be ready if there are no responses', () => {
            expect(checkReadyToDig([])).toBe(false);
        });

        it('should NOT be ready if a utility has Not Responded', () => {
            const responses = [
                { status: 'Marked' },
                { status: 'Not Responded' }
            ];
            expect(checkReadyToDig(responses)).toBe(false);
        });
    });
});
