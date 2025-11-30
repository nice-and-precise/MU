const fs = require('fs');
const path = require('path');

const BUG_REPORTS_FILE = path.join(process.cwd(), 'bug_reports.json');
const ARCHIVE_FILE = path.join(process.cwd(), 'bug_reports_archive.json');

function archiveBugs() {
    if (!fs.existsSync(BUG_REPORTS_FILE)) {
        console.log('No bug reports file found.');
        return;
    }

    let reports = [];
    try {
        const data = fs.readFileSync(BUG_REPORTS_FILE, 'utf-8');
        reports = JSON.parse(data);
    } catch (e) {
        console.error('Error reading bug reports:', e);
        return;
    }

    if (reports.length === 0) {
        console.log('No bug reports to archive.');
        return;
    }

    let archive = [];
    if (fs.existsSync(ARCHIVE_FILE)) {
        try {
            const archiveData = fs.readFileSync(ARCHIVE_FILE, 'utf-8');
            archive = JSON.parse(archiveData);
        } catch (e) {
            console.error('Error reading archive:', e);
            // Continue with empty archive if corrupt
        }
    }

    // Add current reports to archive
    archive = [...archive, ...reports];

    // Write to archive
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(archive, null, 2));
    console.log(`Archived ${reports.length} reports to ${ARCHIVE_FILE}`);

    // Clear current reports
    fs.writeFileSync(BUG_REPORTS_FILE, JSON.stringify([], null, 2));
    console.log('Cleared bug_reports.json');
}

archiveBugs();
