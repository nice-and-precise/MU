
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Configuration
// Use the specific path requested by the user
const INPUT_DIR = 'C:\\Users\\Owner\\Desktop\\MU\\EE info\\random_people';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'avatars');

// Helper to calculate file hash for deduplication
function getFileHash(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

async function main() {
    console.log('Starting realistic employee generation...');

    // Ensure directories exist
    if (!fs.existsSync(INPUT_DIR)) {
        console.error(`Input directory not found: ${INPUT_DIR}`);
        // Fallback to local directory if the absolute path doesn't exist (dev environment safety)
        const localInput = path.join(process.cwd(), 'employee_input');
        if (fs.existsSync(localInput)) {
             console.log(`Falling back to local input: ${localInput}`);
             // We'll just use the variable, but in a real run we'd want the specific path
        } else {
            console.log('Please ensure the image directory exists.');
            return;
        }
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Read input directory
    let files: string[] = [];
    try {
        files = fs.readdirSync(INPUT_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    } catch (e) {
        console.error(`Error reading input directory: ${e}`);
        return;
    }

    if (files.length === 0) {
        console.log('No images found in input directory.');
        return;
    }

    console.log(`Found ${files.length} images.`);

    // Track processed hashes to avoid duplicates
    const processedHashes = new Set<string>();

    for (const file of files) {
        const inputPath = path.join(INPUT_DIR, file);
        
        // Deduplicate by content hash
        const fileHash = getFileHash(inputPath);
        if (processedHashes.has(fileHash)) {
            console.log(`Skipping duplicate image: ${file}`);
            continue;
        }
        processedHashes.add(fileHash);

        console.log(`Processing ${file}...`);

        // 1. Process Image
        const outputFilename = `avatar_${fileHash.substring(0, 8)}_${path.parse(file).name}.jpg`; // Use hash in name
        const outputPath = path.join(OUTPUT_DIR, outputFilename);
        const publicPath = `/avatars/${outputFilename}`;

        // Only process if it doesn't exist or we want to overwrite
        if (!fs.existsSync(outputPath)) {
            try {
                await sharp(inputPath)
                    .resize(256, 256, { fit: 'cover', position: 'center' })
                    .jpeg({ quality: 80 })
                    .toFile(outputPath);
            } catch (e) {
                console.error(`Failed to process image ${file}:`, e);
                continue;
            }
        }

        // 2. Generate Identity
        // Try to derive gender/style from filename if possible, otherwise random
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet.email({ firstName, lastName }).toLowerCase();
        
        // 3. Determine Role & Pay
        const roles = [
            { name: 'Laborer', rate: [25, 35], type: 'HOURLY' },
            { name: 'Operator', rate: [35, 55], type: 'HOURLY' },
            { name: 'Locator', rate: [30, 45], type: 'HOURLY' },
            { name: 'Foreman', rate: [45, 65], type: 'HOURLY' },
            { name: 'Mechanic', rate: [40, 60], type: 'HOURLY' },
            { name: 'Truck Driver', rate: [30, 40], type: 'HOURLY' },
            { name: 'Superintendent', rate: [90000, 130000], type: 'SALARY' },
        ];
        
        const roleData = faker.helpers.arrayElement(roles);
        const isSalary = roleData.type === 'SALARY';
        const payRate = isSalary 
            ? faker.number.int({ min: roleData.rate[0], max: roleData.rate[1] }) 
            : faker.number.float({ min: roleData.rate[0], max: roleData.rate[1], multipleOf: 0.25 });

        // 4. Create User (for Login/Avatar)
        // Check if user exists by email
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: `${firstName} ${lastName}`,
                    password: '$2b$10$PHv0g4qkTzwRKGkeGxGPf.x1QtOOgCkKVh2Og9RCw6VfXA6XaGYT6', // password123
                    role: 'CREW', // Default, can be upgraded manually or by script logic
                    avatar: publicPath,
                }
            });
        } else {
            // Update avatar
            await prisma.user.update({
                where: { id: user.id },
                data: { avatar: publicPath }
            });
        }

        // 5. Create Employee Profile
        const hireDate = faker.date.past({ years: randomInt(1, 7) });
        
        const existingEmployee = await prisma.employee.findFirst({
            where: { userId: user.id }
        });

        if (!existingEmployee) {
            const employee = await prisma.employee.create({
                data: {
                    userId: user.id,
                    firstName,
                    lastName,
                    email,
                    phone: faker.phone.number(),
                    address: faker.location.streetAddress(true),
                    ssn: faker.string.numeric(9),
                    dob: faker.date.birthdate({ min: 20, max: 55, mode: 'age' }),
                    role: roleData.name,
                    status: 'ACTIVE',
                    hireDate: hireDate,
                    payType: roleData.type,
                    hourlyRate: isSalary ? 0 : payRate,
                    salary: isSalary ? payRate : null,
                    taxStatus: faker.helpers.arrayElement(['W-4 Single', 'W-4 Married', 'W-4 Head of Household']),
                    emergencyContact: JSON.stringify({
                        name: faker.person.fullName(),
                        phone: faker.phone.number(),
                        relation: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling'])
                    }),
                }
            });
            console.log(`Created employee: ${firstName} ${lastName} (${roleData.name})`);

            // 6. Create Employment History
            await prisma.employmentStatusHistory.create({
                data: {
                    employeeId: employee.id,
                    status: 'ACTIVE',
                    reason: 'New Hire',
                    effectiveDate: hireDate,
                    createdBy: 'System Seed'
                }
            });

        } else {
            console.log(`Employee already exists: ${firstName} ${lastName}`);
        }
    }

    console.log('Done generating employees!');
}

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
