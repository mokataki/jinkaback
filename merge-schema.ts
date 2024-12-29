const fs = require('fs');
const path = require('path');

const files = ['schema.prisma', 'enums.prisma']; // Replace with your actual filenames
const outputFile = 'prisma/merged-schema.prisma';

const combinedSchema = files
    .map((file) => {
        const filePath = path.join(__dirname, 'prisma', file); // Ensure correct path
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        return fs.readFileSync(filePath, 'utf-8');
    })
    .join('\n\n');

fs.writeFileSync(outputFile, combinedSchema);
console.log(`Merged schema written to ${outputFile}`);
