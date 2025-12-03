import { addDays, isWeekend, isSameDay, startOfDay, addHours, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

// Minnesota Holidays (Fixed for 2025/2026 as a first pass, ideally this should be dynamic or config-based)
// GSOC Holidays: New Year's, MLK, Presidents, Memorial, Juneteenth, Independence, Labor, Veterans, Thanksgiving, Friday after Thanksgiving, Christmas Eve, Christmas
export const MN_HOLIDAYS = [
  '2025-01-01', // New Year's Day
  '2025-01-20', // MLK Day
  '2025-02-17', // Presidents' Day
  '2025-05-26', // Memorial Day
  '2025-06-19', // Juneteenth
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-11-11', // Veterans Day
  '2025-11-27', // Thanksgiving
  '2025-11-28', // Friday after Thanksgiving
  '2025-12-24', // Christmas Eve
  '2025-12-25', // Christmas Day
  '2026-01-01', // New Year's Day
  // Add more as needed
];

export function isHoliday(date: Date): boolean {
  const dateString = date.toISOString().split('T')[0];
  return MN_HOLIDAYS.includes(dateString);
}

export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

/**
 * Calculates the Legal Locate Ready Date.
 * Rule: The locate period begins at 12:01 a.m. the day after the ticket is filed.
 * Then runs for 48 hours, excluding weekends and holidays.
 */
export function calculateLocateReadyAt(ticketFiledAt: Date): Date {
  // Start clock at 12:01 AM the next day
  let clockStart = startOfDay(addDays(ticketFiledAt, 1));
  clockStart = setHours(clockStart, 0);
  clockStart = setMinutes(clockStart, 1);

  // We need to add 48 hours of "business time"
  // Since the clock runs continuously but pauses on weekends/holidays,
  // we can just count 2 business days from the clock start.
  // Actually, the rule is "48 hours excluding weekends and holidays".
  // So if we start on Friday 12:01 AM, +48 hours would be Sunday 12:01 AM (if no exclusion).
  // But with exclusion:
  // Friday 12:01 AM -> Saturday 12:01 AM (24h) - Wait, Sat is weekend.
  // So Friday 12:01 AM -> Friday 11:59 PM is 24h (approx).
  // Let's simplify: It's basically 2 full business days starting from the next day.
  
  // If ticket filed Monday:
  // Clock starts Tuesday 12:01 AM.
  // +48 hours = Thursday 12:01 AM. (Tue, Wed are business days).
  
  // If ticket filed Friday:
  // Clock starts Saturday 12:01 AM? No, clock starts next day.
  // If next day is weekend/holiday, does the clock start?
  // "The locate period begins at 12:01 a.m. the day after the ticket is filed"
  // If filed Friday, day after is Saturday.
  // "excluding weekends and holidays".
  // So the 48 hour clock effectively starts counting on the next BUSINESS day at 12:01 AM?
  // Or does it start on Saturday but pause immediately?
  // GSOC FAQ: "The 48-hour notice period begins at 12:01 a.m. on the day after the request is made... The 48-hour notice period excludes weekends and holidays."
  // Interpretation:
  // Filed Friday. Day after is Saturday. Clock starts Sat 12:01 AM.
  // Sat/Sun excluded. Clock effectively starts Monday 12:01 AM.
  // +48 hours = Wednesday 12:01 AM.
  
  let current = clockStart;
  let hoursAdded = 0;
  
  // We'll iterate hour by hour to be safe and precise, or day by day.
  // Day by day is safer for "48 hours".
  // We need to find 2 full business days.
  
  let businessDaysFound = 0;
  let checkDate = clockStart;
  
  // If the "start day" (day after filing) is a weekend/holiday, we move to the next business day?
  // Actually, let's just count 2 business days starting from the day after filing.
  // If day after filing is Sat, it doesn't count. Sun doesn't count. Mon counts (1). Tue counts (2).
  // Result: Wed 12:01 AM.
  
  // If day after filing is Mon (filed Sun). Mon counts (1). Tue counts (2).
  // Result: Wed 12:01 AM.
  
  // If filed Mon. Day after Tue. Tue counts (1). Wed counts (2).
  // Result: Thu 12:01 AM.
  
  // Algorithm:
  // 1. Start at day after filing.
  // 2. Count 2 business days.
  // 3. Result is 12:01 AM on the day AFTER the 2nd business day.
  
  let d = addDays(ticketFiledAt, 1);
  let validDays = 0;
  
  while (validDays < 2) {
    if (isBusinessDay(d)) {
      validDays++;
    }
    // If we haven't reached 2 days yet, move to next day
    if (validDays < 2) {
       d = addDays(d, 1);
    }
  }
  
  // Now d is the 2nd business day.
  // The time is 12:01 AM on the NEXT day?
  // "at least 48 hours".
  // Mon (1) + Tue (2) = 48 hours ends at end of Tue? Or start of Wed?
  // "starts 12:01 AM day after".
  // 12:01 AM Tue -> 12:01 AM Wed (24h) -> 12:01 AM Thu (48h).
  // So if Tue and Wed are the business days, we need to end at Thu 12:01 AM.
  
  // So we find the 2nd business day, and the result is the day AFTER that at 12:01 AM.
  
  const resultDay = addDays(d, 1);
  return setMinutes(setHours(resultDay, 0), 1);
}

/**
 * Calculates Earliest Excavation Time for Meet Tickets.
 * Rule: Meet must be at least 48 hours after request (excluding weekends/holidays).
 * Excavation must be at least 48 hours after the meet (excluding weekends/holidays).
 */
export function calculateExcavationEarliestFromMeet(meetHeldAt: Date): Date {
  // Same logic as locate ready: 48 hours after the meet time, excluding weekends/holidays.
  // But here the start time is the meet time itself, not "12:01 AM next day".
  // Wait, GSOC says: "Excavation can begin... at least 48 hours after the meet date and time".
  
  // So we add 48 hours, skipping weekends and holidays.
  
  let remainingHours = 48;
  let current = meetHeldAt;
  
  // We'll advance hour by hour for precision if needed, or just use business days if it aligns.
  // Since meets happen during the day, 48 hours is exactly 2 business days later at the same time.
  // Example: Meet Mon 10 AM. +48h = Wed 10 AM.
  // Meet Fri 10 AM. Sat/Sun skip. +48h = Tue 10 AM.
  
  while (remainingHours > 0) {
    current = addHours(current, 1);
    // If the new hour falls on a weekend or holiday, we don't count it?
    // Actually, usually "excluding weekends and holidays" means the clock stops.
    // So if we are in a weekend, we just keep advancing time but don't decrement remainingHours?
    // Or do we jump over the weekend?
    
    // Better approach:
    // If current time is in a weekend/holiday, we skip to the next business day at 12:00 AM?
    // No, that's complex.
    
    // Let's stick to the "2 business days" logic if it's 48 hours.
    // If I meet Fri 2 PM.
    // Fri 2 PM -> Fri Midnight (10 hours).
    // Sat/Sun skip.
    // Mon Midnight -> Mon 2 PM (14 hours). Total 24h.
    // Mon 2 PM -> Tue 2 PM (24 hours). Total 48h.
    // Result: Tue 2 PM.
    
    // So basically: Find the date 2 business days later, keep the same time.
    // Exception: If the calculated time falls on a holiday? (Unlikely if we skipped holidays).
    
    // Algorithm:
    // 1. Add 2 business days to the date.
    // 2. Keep the time.
    
    // Let's verify Fri 2 PM -> Tue 2 PM.
    // Fri (part), Mon (full), Tue (part).
    // Fri 2PM-Midnight + Mon + Tue Midnight-2PM = 10 + 24 + 14 = 48. Correct.
    
    // What if meet is on a holiday? (Shouldn't happen, but logic should handle).
    
    // We iterate days.
    // Start date: Meet date.
    // Count 2 business days forward.
    
    // Wait, if meet is Fri 2 PM.
    // Day 0: Fri.
    // Day 1: Mon.
    // Day 2: Tue.
    // Result Tue 2 PM.
    
    // Logic:
    // Start with meet date.
    // Find next business day. (Mon)
    // Find next business day. (Tue)
    // Set time to meet time.
    
    // Is it always exactly 2 business days?
    // Yes, 48 hours = 2 * 24 hours.
  }
  
  let d = meetHeldAt;
  let daysAdded = 0;
  
  while (daysAdded < 2) {
    d = addDays(d, 1);
    if (isBusinessDay(d)) {
      daysAdded++;
    }
  }
  
  // Preserve original time
  const h = meetHeldAt.getHours();
  const m = meetHeldAt.getMinutes();
  
  d = setHours(d, h);
  d = setMinutes(d, m);
  
  return d;
}

/**
 * Calculates Ticket Expiration.
 * Rule: Valid for 14 calendar days from the start date and time.
 */
export function calculateTicketExpiration(startTime: Date): Date {
  // 14 calendar days, straight addition.
  return addDays(startTime, 14);
}
