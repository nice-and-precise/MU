import puppeteer from 'puppeteer';
import { prisma } from '@/lib/prisma';

export interface ScrapedResponse {
    utility: string;
    status: string;
    date: string;
}

export const ScraperService = {
    checkTicketStatus: async (ticketNumber: string) => {
        let browser;
        try {
            console.log(`Starting scrape for ticket: ${ticketNumber}`);
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Navigate to search page
            await page.goto('https://mn.itic.occinc.com/search', { waitUntil: 'networkidle2' });

            // Enter ticket number
            await page.type('#ticketNumber', ticketNumber);

            // Click Search button (finding by value since ID is missing/generic)
            const searchButton = await page.$('input[value="Search"]');
            if (!searchButton) {
                throw new Error('Search button not found');
            }

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
                searchButton.click(),
            ]);

            // Parse results
            const responses = await page.evaluate(() => {
                const rows = document.querySelectorAll('tr.detail_line, tr.row_light, tr.row_dark');
                const results: any[] = [];

                rows.forEach((row) => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 3) {
                        const text = row.textContent || '';
                        if (text.includes('Marked') || text.includes('Clear') || text.includes('No Conflict')) {
                            results.push({
                                utility: cells[0]?.textContent?.trim() || 'Unknown',
                                status: cells[1]?.textContent?.trim() || 'Unknown',
                                date: cells[2]?.textContent?.trim() || ''
                            });
                        }
                    }
                });
                return results;
            });

            console.log(`Scrape complete. Found ${responses.length} responses.`);

            // Update database if we found responses
            if (responses.length > 0) {
                const ticket = await prisma.ticket811.findFirst({
                    where: { ticketNumber }
                });

                if (ticket) {
                    await prisma.ticket811Response.deleteMany({
                        where: { ticketId: ticket.id }
                    });

                    for (const res of responses) {
                        await prisma.ticket811Response.create({
                            data: {
                                ticketId: ticket.id,
                                utilityName: res.utility,
                                status: res.status,
                                responseDate: new Date(),
                                notes: `Scraped from GSOC: ${res.date}`
                            } as any
                        });
                    }
                }
            }

            return responses;

        } catch (error) {
            console.error('Error scraping ticket status:', error);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
};
