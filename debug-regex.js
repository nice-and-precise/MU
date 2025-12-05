const emailBody = `
TICKET NUMBER: 24000000-000001
TICKET TYPE: NORMAL
SUBMITTED: 05/01/2024 08:00 AM
WORK TO BEGIN: 05/03/2024 08:00 AM
EXPIRES: 05/20/2024 08:00 AM
COMPANY: ACME Construction
CALLER: John Doe
PHONE: 555-0100
WORK SITE:
123 Main St
Minneapolis, MN 55401
County: Hennepin
MEMBERS NOTIFIED:
Xcel Energy
CenterPoint Energy

View Ticket
`.replace(/^\s+/gm, '');

const patterns = {
    ticketNumber: /TICKET NUMBER:?\s*(\d{8}-\d{6})/i,
    ticketType: /TICKET TYPE:\s*(.+)/i,
    submitted: /SUBMITTED:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)/i,
    workToBegin: /WORK TO BEGIN:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)/i,
    expires: /EXPIRES:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)/i,
    company: /COMPANY:\s*(.+)/i,
    caller: /CALLER:\s*(.+)/i,
    phone: /PHONE:\s*(.+)/i,
    workSite: /WORK SITE:\s*([\s\S]+?)(?=\n[A-Z][A-Z]+:|$)/i,
    county: /County:\s*(.+)|(\w+)\s+County/i,
    membersNotified: /MEMBERS NOTIFIED:\s*([\s\S]+)/i
};

const extract = (regex) => {
    try {
        const match = emailBody.match(regex);
        return match ? (match[1] || match[2] || '').trim() : null;
    } catch (e) {
        console.error("Regex error:", e);
        return null;
    }
};

const result = {
    ticketNumber: extract(patterns.ticketNumber),
    membersNotified: extract(patterns.membersNotified)
};

console.log("Email Body:\n", emailBody);
console.log("Result:", result);
