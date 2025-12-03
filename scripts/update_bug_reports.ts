import fs from 'fs';
import path from 'path';

const bugReportsPath = path.join(process.cwd(), 'bug_reports.json');

const fixedBugIds = [
    "1764518500491",
    "1764638923367",
    "1764639103582",
    "1764646834696",
    "1764646908578",
    "1764646970281",
    "1764646994340",
    "1764647076427",
    "1764647694012",
    "1764720726252",
    "1764734021942",
    "1764734104829",
    "1764734144258",
    "1764786232107",
    "1764786302816",
    "1764786426806",
    "1764786499283",
    "1764786558288",
    "1764786701889"
];

try {
    const rawData = fs.readFileSync(bugReportsPath, 'utf-8');
    let bugReports = JSON.parse(rawData);

    let updatedCount = 0;

    bugReports = bugReports.map((bug: any) => {
        if (!bug.status) {
            bug.status = "open"; // Default to open
        }

        if (fixedBugIds.includes(bug.id)) {
            bug.status = "fixed";
            updatedCount++;
        }

        return bug;
    });

    fs.writeFileSync(bugReportsPath, JSON.stringify(bugReports, null, 2));
    console.log(`Updated ${updatedCount} bugs to 'fixed' status.`);
    console.log(`Total bugs in system: ${bugReports.length}`);

} catch (error) {
    console.error("Error updating bug reports:", error);
}
