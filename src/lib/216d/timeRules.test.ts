import { describe, it, expect } from 'vitest';
import { calculateLocateReadyAt, calculateExcavationEarliestFromMeet, calculateTicketExpiration } from './timeRules';

describe('216D Time Rules', () => {
    describe('calculateLocateReadyAt', () => {
        it('should calculate 48 hours correctly for a Monday filing', () => {
            // Filed Monday 10 AM -> Starts Tue 12:01 AM -> +48h (Tue, Wed) -> Thu 12:01 AM
            const filedAt = new Date('2025-06-02T10:00:00'); // Mon June 2, 2025
            const expected = new Date('2025-06-05T00:01:00'); // Thu June 5, 2025
            const result = calculateLocateReadyAt(filedAt);
            expect(result).toEqual(expected);
        });

        it('should calculate 48 hours correctly for a Friday filing', () => {
            // Filed Friday 2 PM -> Starts Sat 12:01 AM (skip Sat, Sun) -> Starts Mon 12:01 AM effectively?
            // Mon (1), Tue (2) -> Wed 12:01 AM.
            const filedAt = new Date('2025-06-06T14:00:00'); // Fri June 6, 2025
            const expected = new Date('2025-06-11T00:01:00'); // Wed June 11, 2025
            const result = calculateLocateReadyAt(filedAt);
            expect(result).toEqual(expected);
        });

        it('should handle holidays correctly', () => {
            // Filed Thursday before July 4th (Friday).
            // Filed Thu July 3, 2025.
            // Clock starts Fri July 4 12:01 AM.
            // Fri is Holiday. Sat/Sun Weekend.
            // Mon (1), Tue (2).
            // Result: Wed July 9 12:01 AM.
            const filedAt = new Date('2025-07-03T10:00:00'); // Thu July 3
            const expected = new Date('2025-07-09T00:01:00'); // Wed July 9
            const result = calculateLocateReadyAt(filedAt);
            expect(result).toEqual(expected);
        });
    });

    describe('calculateExcavationEarliestFromMeet', () => {
        it('should add 48 hours (2 business days) to meet time', () => {
            // Meet Mon 10 AM -> Wed 10 AM
            const meetAt = new Date('2025-06-02T10:00:00');
            const expected = new Date('2025-06-04T10:00:00');
            const result = calculateExcavationEarliestFromMeet(meetAt);
            expect(result).toEqual(expected);
        });

        it('should skip weekends for meet time', () => {
            // Meet Fri 2 PM -> Tue 2 PM
            const meetAt = new Date('2025-06-06T14:00:00');
            const expected = new Date('2025-06-10T14:00:00');
            const result = calculateExcavationEarliestFromMeet(meetAt);
            expect(result).toEqual(expected);
        });
    });

    describe('calculateTicketExpiration', () => {
        it('should add 14 calendar days', () => {
            const start = new Date('2025-06-01T08:00:00');
            const expected = new Date('2025-06-15T08:00:00');
            const result = calculateTicketExpiration(start);
            expect(result).toEqual(expected);
        });
    });
});
