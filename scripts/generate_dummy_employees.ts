
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Configuration
const INPUT_DIR = path.join(process.cwd(), 'employee_input');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'avatars');
const NAMES_FILE = path.join(INPUT_DIR, 'names.json'); // Optional: JSON file mapping filename to name

async function main() {
    console.log('Starting dummy employee generation...');

    // Ensure directories exist
    if (!fs.existsSync(INPUT_DIR)) {
        console.log(`Creating input directory: ${INPUT_DIR}`);
        fs.mkdirSync(INPUT_DIR, { recursive: true });
        console.log('Please place employee images in this directory and run the script again.');
        console.log('You can optionally add a names.json file like: { "image1.jpg": "John Doe" }');
        return;
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Read input directory
    const files = fs.readdirSync(INPUT_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

    if (files.length === 0) {
        console.log('No images found in input directory.');
        return;
    }

    let namesMap: Record<string, string> = {};
    if (fs.existsSync(NAMES_FILE)) {
        try {
            namesMap = JSON.parse(fs.readFileSync(NAMES_FILE, 'utf-8'));
        } catch (e) {
            console.error('Error reading names.json:', e);
        }
    }

    for (const file of files) {
        console.log(`Processing ${file}...`);

        // 1. Process Image
        const inputPath = path.join(INPUT_DIR, file);
        const outputFilename = `avatar_${Date.now()}_${file}`;
        const outputPath = path.join(OUTPUT_DIR, outputFilename);
        const publicPath = `/avatars/${outputFilename}`;

        try {
            await sharp(inputPath)
                .resize(256, 256, { fit: 'cover', position: 'center' }) // Crop to square
                .toFile(outputPath);
        } catch (e) {
            console.error(`Failed to process image ${file}:`, e);
            continue;
        }

        // 2. Determine Name
        let firstName, lastName;
        if (namesMap[file]) {
            const parts = namesMap[file].split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ') || '';
        } else {
            // Try to guess from filename if no map (e.g. "John_Doe.jpg")
            const namePart = path.parse(file).name.replace(/[_-]/g, ' ');
            const parts = namePart.split(' ');
            if (parts.length >= 2) {
                firstName = parts[0];
                lastName = parts.slice(1).join(' ');
            } else {
                firstName = parts[0]; // Use filename as first name
                lastName = faker.person.lastName(); // Generate random last name
            }
        }

        // 3. Generate Dummy Data
        const email = faker.internet.email({ firstName, lastName }).toLowerCase();
        const role = faker.helpers.arrayElement(['Laborer', 'Operator', 'Foreman', 'Truck Driver']);
        const hourlyRate = faker.number.int({ min: 25, max: 45 });

        // 4. Create User (for avatar)
        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: `${firstName} ${lastName}`,
                    password: 'password123', // Dummy password
                    role: 'CREW',
                    avatar: publicPath,
                }
            });
        } else {
            // Update avatar if user exists
            user = await prisma.user.update({
                where: { id: user.id },
                data: { avatar: publicPath }
            });
        }

        // 5. Create Employee
        // Check if employee exists
        const existingEmployee = await prisma.employee.findFirst({
            where: {
                firstName: { equals: firstName, mode: 'insensitive' },
                lastName: { equals: lastName, mode: 'insensitive' }
            }
        });

        if (!existingEmployee) {
            await prisma.employee.create({
                data: {
                    userId: user.id,
                    firstName,
                    lastName,
                    email,
                    phone: faker.phone.number(),
                    address: faker.location.streetAddress(true),
                    ssn: faker.string.numeric(9), // Dummy SSN
                    dob: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }),
                    role,
                    status: 'ACTIVE',
                    hireDate: faker.date.past({ years: 5 }),
                    payType: 'HOURLY',
                    hourlyRate,
                    taxStatus: 'W-4 Single',
                }
            });
            console.log(`Created employee: ${firstName} ${lastName}`);
        } else {
            // Link to user if not linked
            if (!existingEmployee.userId) {
                await prisma.employee.update({
                    where: { id: existingEmployee.id },
                    data: { userId: user.id }
                });
                console.log(`Linked existing employee: ${firstName} ${lastName}`);
            } else {
                console.log(`Employee already exists and linked: ${firstName} ${lastName}`);
            }
        }
    }

    console.log('Done!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
