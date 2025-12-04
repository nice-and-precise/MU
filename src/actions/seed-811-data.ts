'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function seed811Data() {
    try {
        // Clear existing tickets to avoid clutter (optional, but good for demo reset)
        // await prisma.ticket811.deleteMany({}); 

        const tickets = [
            {
                ticketNumber: '25001001',
                type: 'NORMAL',
                status: 'ACTIVE',
                submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                workToBeginDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
                expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In 14 days
                company: 'Midwest Underground',
                caller: 'John Doe',
                phone: '612-555-0101',
                email: 'john.doe@midwestunderground.com',
                workSiteAddress: '123 Main St',
                city: 'Minneapolis',
                county: 'Hennepin',
                nearestIntersection: 'Main St & 1st Ave',
                gpsCoordinates: JSON.stringify([[44.9778, -93.2650], [44.9780, -93.2650], [44.9780, -93.2648], [44.9778, -93.2648]]),
                workDescription: 'Directional drilling for fiber optic installation.',
                duration: '3 days',
                utilitiesNotified: JSON.stringify(['Xcel Energy', 'CenterPoint Energy', 'CenturyLink', 'Comcast']),
                projectId: null,
            },
            {
                ticketNumber: '25001002',
                type: 'EMERGENCY',
                status: 'ACTIVE',
                submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
                workToBeginDate: new Date(Date.now()), // Immediately
                expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                company: 'Midwest Underground',
                caller: 'Jane Smith',
                phone: '612-555-0102',
                email: 'jane.smith@midwestunderground.com',
                workSiteAddress: '456 Washington Ave',
                city: 'Minneapolis',
                county: 'Hennepin',
                nearestIntersection: 'Washington Ave & 3rd Ave',
                gpsCoordinates: JSON.stringify([[44.9800, -93.2630], [44.9802, -93.2630], [44.9802, -93.2628], [44.9800, -93.2628]]),
                workDescription: 'Emergency gas leak repair.',
                duration: '1 day',
                explosives: false,
                tunneling: false,
                rightOfWay: true,
                utilitiesNotified: JSON.stringify(['CenterPoint Energy']),
                projectId: null,
            },
            {
                ticketNumber: '25000998',
                type: 'NORMAL',
                status: 'EXPIRED',
                submittedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
                workToBeginDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
                expirationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Expired 2 days ago
                company: 'Midwest Underground',
                caller: 'Mike Johnson',
                phone: '612-555-0103',
                email: 'mike.j@midwestunderground.com',
                workSiteAddress: '789 Broadway St NE',
                city: 'Minneapolis',
                county: 'Hennepin',
                nearestIntersection: 'Broadway & Central',
                gpsCoordinates: JSON.stringify([[44.9990, -93.2450], [44.9992, -93.2450], [44.9992, -93.2448], [44.9990, -93.2448]]),
                workDescription: 'Hydrant replacement.',
                duration: '2 days',
                utilitiesNotified: JSON.stringify(['City of Minneapolis', 'Xcel Energy']),
                projectId: null,
            },
            {
                ticketNumber: '25001005',
                type: 'MEET',
                status: 'ACTIVE',
                submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                workToBeginDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
                expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                company: 'Midwest Underground',
                caller: 'Sarah Connor',
                phone: '612-555-0104',
                email: 'sarah.c@midwestunderground.com',
                workSiteAddress: '1000 Lake St',
                city: 'Minneapolis',
                county: 'Hennepin',
                nearestIntersection: 'Lake St & Hennepin Ave',
                gpsCoordinates: JSON.stringify([[44.9490, -93.2950], [44.9492, -93.2950], [44.9492, -93.2948], [44.9490, -93.2948]]),
                workDescription: 'Large scale excavation meeting required.',
                duration: '1 week',
                utilitiesNotified: JSON.stringify(['All Utilities']),
                projectId: null,
            },
            {
                ticketNumber: '25001010',
                type: 'NORMAL',
                status: 'ACTIVE',
                submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                workToBeginDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                company: 'Midwest Underground',
                caller: 'Tom Hardy',
                phone: '612-555-0105',
                email: 'tom.h@midwestunderground.com',
                workSiteAddress: '500 University Ave SE',
                city: 'Minneapolis',
                county: 'Hennepin',
                nearestIntersection: 'University & 10th',
                gpsCoordinates: JSON.stringify([[44.9820, -93.2350], [44.9822, -93.2350], [44.9822, -93.2348], [44.9820, -93.2348]]),
                workDescription: 'Sewer line repair.',
                duration: '4 days',
                utilitiesNotified: JSON.stringify(['City of Minneapolis', 'CenterPoint']),
                projectId: null,
            }
        ];

        for (const ticket of tickets) {
            await prisma.ticket811.upsert({
                where: { ticketNumber: ticket.ticketNumber },
                update: ticket,
                create: ticket,
            });
        }

        revalidatePath('/811');
        return { success: true, message: 'Dummy data seeded successfully!' };
    } catch (error) {
        console.error('Error seeding data:', error);
        return { success: false, message: 'Failed to seed data.' };
    }
}
