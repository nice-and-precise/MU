export function generateAMI(
    dimensions: string[],
    references: string[]
): string {
    if (dimensions.length === 0) return "No excavation area defined.";

    let ami = "Mark the excavation area defined by the following boundary:\n\n";

    // Add Dimensions/Segments
    ami += "BOUNDARY SEGMENTS:\n";
    dimensions.forEach((dim, index) => {
        ami += `${index + 1}. ${dim}\n`;
    });

    // Add References
    if (references.length > 0) {
        ami += "\nREFERENCE POINTS:\n";
        references.forEach((ref) => {
            ami += `- ${ref}\n`;
        });
    }

    ami += "\nEnsure all markings are in white paint or flags. Maintain a 2-foot tolerance zone around all utility marks.";

    return ami;
}
