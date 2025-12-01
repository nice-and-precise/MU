import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateEstimatePDF(estimate: any) {
    const doc = new jsPDF();

    // --- Header ---
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102); // Dark Blue
    doc.text('Midwest Underground', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('123 Drilling Way', 14, 26);
    doc.text('Omaha, NE 68102', 14, 30);
    doc.text('Phone: (555) 123-4567', 14, 34);

    // --- Estimate Info ---
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('ESTIMATE', 150, 20);

    doc.setFontSize(10);
    doc.text(`Estimate #: ${estimate.id.slice(-6).toUpperCase()}`, 150, 26);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 30);
    doc.text(`Valid Until: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 150, 34);

    // --- Customer Info ---
    doc.setFontSize(12);
    doc.text('Prepared For:', 14, 50);
    doc.setFontSize(10);
    doc.text(estimate.customerName || estimate.project?.name || 'Valued Customer', 14, 56);

    // --- Line Items Table ---
    const tableColumn = ["Description", "Qty", "Unit", "Unit Price", "Total"];
    const tableRows: any[] = [];

    estimate.lines.forEach((line: any) => {
        const lineData = [
            line.description,
            line.quantity,
            line.unit,
            `$${line.unitCost.toFixed(2)}`,
            `$${line.total.toFixed(2)}`,
        ];
        tableRows.push(lineData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'striped',
        headStyles: { fillColor: [0, 51, 102] },
        styles: { fontSize: 9 },
    });

    // --- Totals ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.text(`Subtotal:`, 150, finalY);
    doc.text(`$${estimate.subtotal.toFixed(2)}`, 180, finalY, { align: 'right' });

    doc.text(`Markup:`, 150, finalY + 5);
    doc.text(`$${estimate.markupAmount.toFixed(2)}`, 180, finalY + 5, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total:`, 150, finalY + 12);
    doc.text(`$${estimate.total.toFixed(2)}`, 180, finalY + 12, { align: 'right' });

    // --- Footer ---
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Terms & Conditions: Payment due within 30 days. This estimate is valid for 30 days.', 14, 280);

    // Save
    doc.save(`Estimate_${estimate.id.slice(-6)}.pdf`);
}

export function generateInvoicePDF(invoice: any) {
    const doc = new jsPDF();

    // --- Header ---
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text('APPLICATION FOR PAYMENT', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Application #: ${invoice.applicationNo}`, 150, 20);
    doc.text(`Period To: ${new Date(invoice.periodEnd).toLocaleDateString()}`, 150, 25);
    doc.text(`Project: ${invoice.project.name}`, 14, 30);

    // --- G702 Summary ---
    const startY = 40;
    doc.setFontSize(12);
    doc.text('CONTRACTOR\'S APPLICATION FOR PAYMENT', 14, startY);

    doc.setFontSize(10);
    const summaryData = [
        ['1. ORIGINAL CONTRACT SUM', `$${(invoice.items.reduce((acc: number, i: any) => acc + i.scheduledValue, 0) - invoice.items.filter((i: any) => i.description.startsWith('CO')).reduce((acc: number, i: any) => acc + i.scheduledValue, 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ['2. NET CHANGE BY CHANGE ORDERS', `$${invoice.items.filter((i: any) => i.description.startsWith('CO')).reduce((acc: number, i: any) => acc + i.scheduledValue, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ['3. CONTRACT SUM TO DATE (Line 1 + 2)', `$${invoice.items.reduce((acc: number, i: any) => acc + i.scheduledValue, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ['4. TOTAL COMPLETED & STORED TO DATE', `$${invoice.totalCompleted.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ['5. RETAINAGE', `$${invoice.retainageAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ['6. TOTAL EARNED LESS RETAINAGE (Line 4 - 5)', `$${invoice.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ['7. LESS PREVIOUS CERTIFICATES', `$${invoice.previousBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ['8. CURRENT PAYMENT DUE (Line 6 - 7)', `$${invoice.currentDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ['9. BALANCE TO FINISH, PLUS RETAINAGE', `$${(invoice.items.reduce((acc: number, i: any) => acc + i.scheduledValue, 0) - invoice.totalEarned).toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
    ];

    autoTable(doc, {
        body: summaryData,
        startY: startY + 5,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1 },
        columnStyles: { 0: { cellWidth: 120 }, 1: { halign: 'right' } },
    });

    // --- G703 Schedule of Values ---
    const tableColumn = ["Description", "Scheduled", "Previous", "This Period", "Stored", "Total", "%", "Balance", "Retainage"];
    const tableRows: any[] = [];

    invoice.items.forEach((item: any) => {
        const row = [
            item.description,
            item.scheduledValue.toFixed(2),
            item.previous.toFixed(2),
            item.thisPeriod.toFixed(2),
            item.stored.toFixed(2),
            item.totalCompleted.toFixed(2),
            item.percentComplete.toFixed(0) + '%',
            item.balance.toFixed(2),
            item.retainage.toFixed(2),
        ];
        tableRows.push(row);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: (doc as any).lastAutoTable.finalY + 15,
        theme: 'striped',
        headStyles: { fillColor: [0, 51, 102], fontSize: 8 },
        styles: { fontSize: 7 },
    });

    // Save
    doc.save(`Invoice_${invoice.applicationNo}_${invoice.project.name}.pdf`);
}

export function generateAsBuiltPDF(bore: any) {
    const doc = new jsPDF();

    // --- Header ---
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text('AS-BUILT LOG', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Bore Name: ${bore.name}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Total Length: ${bore.rodPasses.reduce((acc: number, r: any) => acc + r.linearFeet, 0).toFixed(1)} ft`, 150, 30);

    // --- Data Table ---
    const tableColumn = ["Rod #", "Length", "Pitch (%)", "Azimuth (°)", "Depth (ft)", "North (ft)", "East (ft)"];
    const tableRows: any[] = [];

    bore.rodPasses.forEach((rod: any) => {
        const row = [
            rod.sequence,
            rod.linearFeet.toFixed(1),
            rod.pitch.toFixed(1),
            rod.azimuth.toFixed(1),
            rod.depth.toFixed(1),
            rod.north.toFixed(1),
            rod.east.toFixed(1),
        ];
        tableRows.push(row);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [0, 51, 102], fontSize: 8 },
        styles: { fontSize: 8 },
    });

    // Save
    doc.save(`AsBuilt_${bore.name.replace(/\s+/g, '_')}.pdf`);
}
