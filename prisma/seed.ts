
import { PrismaClient, AssetState, ReportStatus, TicketStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper to get random item from array
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
// Helper for random int range
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log('🌱 Starting robust database seed...');

  // --- 1. USERS & CREW ---
  console.log('Creating Users...');
  const passwordHash = '$2b$10$PHv0g4qkTzwRKGkeGxGPf.x1QtOOgCkKVh2Og9RCw6VfXA6XaGYT6'; // password123

  const owner = await prisma.user.upsert({
    where: { email: 'owner@midwestunderground.com' },
    update: {},
    create: { email: 'owner@midwestunderground.com', name: 'John Owner', role: 'OWNER', password: passwordHash },
  });

  const superint = await prisma.user.upsert({
    where: { email: 'super@midwestunderground.com' },
    update: {},
    create: { email: 'super@midwestunderground.com', name: 'Mike Super', role: 'SUPER', password: passwordHash },
  });

  const foreman = await prisma.user.upsert({
    where: { email: 'foreman@midwestunderground.com' },
    update: {},
    create: { email: 'foreman@midwestunderground.com', name: 'Mike "Tophand" Williams', role: 'FOREMAN', password: passwordHash },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@midwestunderground.com' },
    update: {},
    create: { email: 'operator@midwestunderground.com', name: 'Sarah Jenkins', role: 'OPERATOR', password: passwordHash },
  });

  const laborer = await prisma.user.upsert({
    where: { email: 'laborer@midwestunderground.com' },
    update: {},
    create: { email: 'laborer@midwestunderground.com', name: 'Tom Davis', role: 'LABORER', password: passwordHash },
  });

  const mechanic = await prisma.user.upsert({
    where: { email: 'mechanic@midwestunderground.com' },
    update: {},
    create: { email: 'mechanic@midwestunderground.com', name: 'Dave Fixit', role: 'MECHANIC', password: passwordHash },
  });

  // Famous People Seed Data
  await prisma.user.upsert({ where: { email: 'george@midwestunderground.com' }, update: {}, create: { email: 'george@midwestunderground.com', name: 'George Washington', role: 'FOREMAN', password: passwordHash } });
  await prisma.user.upsert({ where: { email: 'abe@midwestunderground.com' }, update: {}, create: { email: 'abe@midwestunderground.com', name: 'Abraham Lincoln', role: 'OPERATOR', password: passwordHash } });
  await prisma.user.upsert({ where: { email: 'ben@midwestunderground.com' }, update: {}, create: { email: 'ben@midwestunderground.com', name: 'Benjamin Franklin', role: 'LOCATOR', password: passwordHash } });
  await prisma.user.upsert({ where: { email: 'teddy@midwestunderground.com' }, update: {}, create: { email: 'teddy@midwestunderground.com', name: 'Teddy Roosevelt', role: 'LABORER', password: passwordHash } });
  await prisma.user.upsert({ where: { email: 'amelia@midwestunderground.com' }, update: {}, create: { email: 'amelia@midwestunderground.com', name: 'Amelia Earhart', role: 'OPERATOR', password: passwordHash } });
  await prisma.user.upsert({ where: { email: 'tom@midwestunderground.com' }, update: {}, create: { email: 'tom@midwestunderground.com', name: 'Thomas Edison', role: 'LOCATOR', password: passwordHash } });
  await prisma.user.upsert({ where: { email: 'henry@midwestunderground.com' }, update: {}, create: { email: 'henry@midwestunderground.com', name: 'Henry Ford', role: 'MECHANIC', password: passwordHash } });

  const users = [owner, superint, foreman, operator, laborer, mechanic];

  // --- 2. COST CATEGORIES & ITEMS ---
  console.log('Creating Cost Catalog...');
  const laborCat = await prisma.costCategory.upsert({ where: { name: 'Labor' }, update: {}, create: { name: 'Labor', sortOrder: 1 } });
  const equipCat = await prisma.costCategory.upsert({ where: { name: 'Equipment' }, update: {}, create: { name: 'Equipment', sortOrder: 2 } });
  const matCat = await prisma.costCategory.upsert({ where: { name: 'Materials' }, update: {}, create: { name: 'Materials', sortOrder: 3 } });
  const subCat = await prisma.costCategory.upsert({ where: { name: 'Subcontractor' }, update: {}, create: { name: 'Subcontractor', sortOrder: 4 } });

  const costItemsData = [
    { categoryId: laborCat.id, code: 'LAB-001', name: 'Drill Operator', unit: 'HR', unitCost: 85.00 },
    { categoryId: laborCat.id, code: 'LAB-002', name: 'Locator', unit: 'HR', unitCost: 75.00 },
    { categoryId: laborCat.id, code: 'LAB-003', name: 'Laborer', unit: 'HR', unitCost: 45.00 },
    { categoryId: laborCat.id, code: 'LAB-004', name: 'Foreman', unit: 'HR', unitCost: 95.00 },
    { categoryId: equipCat.id, code: 'EQP-001', name: 'Vermeer D24x40', unit: 'HR', unitCost: 150.00 },
    { categoryId: equipCat.id, code: 'EQP-002', name: 'Vermeer D40x55', unit: 'HR', unitCost: 220.00 },
    { categoryId: equipCat.id, code: 'EQP-003', name: 'Vac Tron 500', unit: 'HR', unitCost: 110.00 },
    { categoryId: equipCat.id, code: 'EQP-004', name: 'Excavator (Mini)', unit: 'HR', unitCost: 95.00 },
    { categoryId: matCat.id, code: 'MAT-001', name: 'HDPE 2" SDR11', unit: 'LF', unitCost: 2.50 },
    { categoryId: matCat.id, code: 'MAT-002', name: 'HDPE 4" SDR11', unit: 'LF', unitCost: 4.50 },
    { categoryId: matCat.id, code: 'MAT-003', name: 'Bentonite (Bag)', unit: 'EA', unitCost: 12.00 },
    { categoryId: matCat.id, code: 'MAT-004', name: 'Polymer (Jug)', unit: 'EA', unitCost: 45.00 },
    { categoryId: subCat.id, code: 'SUB-001', name: 'Traffic Control', unit: 'DAY', unitCost: 1200.00 },
    { categoryId: subCat.id, code: 'SUB-002', name: 'Restoration', unit: 'SQFT', unitCost: 8.50 },
  ];

  for (const item of costItemsData) {
    await prisma.costItem.upsert({ where: { code: item.code }, update: {}, create: item });
  }

  // --- 3. INVENTORY & WAREHOUSE ---
  console.log('Creating Inventory...');
  const inventoryItemsData = [
    { name: 'Bentonite Clay', sku: 'BEN-50LB', category: 'Drilling Fluid', unit: 'Bag', quantity: 400, cost: 12.00, location: 'Warehouse A' },
    { name: 'Polymer Additive', sku: 'POLY-5G', category: 'Drilling Fluid', unit: 'Jug', quantity: 50, cost: 45.00, location: 'Warehouse A' },
    { name: '2" HDPE SDR11', sku: 'PIPE-2-SDR11', category: 'Pipe', unit: 'LF', quantity: 5000, cost: 2.50, location: 'Yard' },
    { name: '4" HDPE SDR11', sku: 'PIPE-4-SDR11', category: 'Pipe', unit: 'LF', quantity: 2000, cost: 4.50, location: 'Yard' },
    { name: 'Pulling Eye 2"', sku: 'TOOL-PE-2', category: 'Tools', unit: 'EA', quantity: 4, cost: 150.00, location: 'Tool Room' },
    { name: 'Pulling Eye 4"', sku: 'TOOL-PE-4', category: 'Tools', unit: 'EA', quantity: 2, cost: 220.00, location: 'Tool Room' },
    { name: 'Starter Rod', sku: 'ROD-START', category: 'Drill Parts', unit: 'EA', quantity: 5, cost: 450.00, location: 'Shop' },
    { name: 'Transmitter Housing', sku: 'SONDE-HSG', category: 'Drill Parts', unit: 'EA', quantity: 3, cost: 1200.00, location: 'Shop' },
  ];

  const inventoryItems = [];
  for (const item of inventoryItemsData) {
    const inv = await prisma.inventoryItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: {
        name: item.name,
        sku: item.sku,
        category: item.category,
        unit: item.unit,
        quantityOnHand: item.quantity,
        costPerUnit: item.cost,
        location: item.location,
        transactions: {
          create: {
            type: 'STOCK_IN',
            quantity: item.quantity,
            userId: owner.id,
            notes: 'Initial Stock',
            createdAt: faker.date.past({ years: 0.5 }),
          }
        }
      }
    });
    inventoryItems.push(inv);
  }

  // --- 4. ASSETS & FLEET ---
  console.log('Creating Fleet...');
  const assetsData = [
    { name: 'Vermeer D24x40 S3', type: 'Drill', model: 'D24x40', serial: 'VRM-2440-001', status: 'AVAILABLE', hours: 2450 },
    { name: 'Vermeer D40x55 S3', type: 'Drill', model: 'D40x55', serial: 'VRM-4055-002', status: 'IN_USE', hours: 1800 },
    { name: 'Vac-Tron LP 500', type: 'Vac', model: 'LP 500', serial: 'VAC-500-003', status: 'AVAILABLE', hours: 1200 },
    { name: 'Ford F-550 Flatbed', type: 'Truck', model: 'F-550', serial: 'FRD-550-004', status: 'IN_USE', hours: 45000 }, // miles really
    { name: 'Kubota KX040', type: 'Excavator', model: 'KX040', serial: 'KUB-040-005', status: 'MAINTENANCE', hours: 3200 },
  ];

  const assets = [];
  for (const asset of assetsData) {
    const a = await prisma.asset.create({
      data: {
        name: asset.name,
        type: asset.type,
        model: asset.model,
        serialNumber: asset.serial,
        status: asset.status as AssetState,
        hours: asset.hours,
        purchaseDate: faker.date.past({ years: 3 }),
      }
    });
    assets.push(a);

    // Create Maintenance History
    const numLogs = randomInt(2, 5);
    for (let i = 0; i < numLogs; i++) {
      await prisma.maintenanceLog.create({
        data: {
          assetId: a.id,
          date: faker.date.past({ years: 1 }),
          type: random(['Preventative', 'Repair', 'Inspection']),
          description: faker.helpers.arrayElement(['Oil Change', 'Hydraulic Hose Replacement', 'Track Tensioning', 'Filter Replacement', 'Annual Inspection']),
          cost: parseFloat(faker.commerce.price({ min: 100, max: 2000 })),
          performedBy: mechanic.name || 'Mechanic',
        }
      });
    }
  }

  // --- 5. PROJECTS ---
  console.log('Creating Projects...');

  // Project 1: Fiber Expansion (Active)
  const fiberProject = await prisma.project.create({
    data: {
      name: 'Fiber Expansion Phase 1',
      description: 'Downtown fiber backbone installation.',
      status: 'IN_PROGRESS',
      location: 'Minneapolis, MN',
      customerName: 'MetroNet',
      customerContact: 'Steve Johnson',
      createdById: owner.id,
      startDate: faker.date.recent({ days: 30 }),
      budget: 250000,
    }
  });

  // Project 2: River Crossing (Complex, Planning)
  const riverProject = await prisma.project.create({
    data: {
      name: 'Mississippi River Crossing',
      description: '1500ft bore under the Mississippi River for 12" Steel Gas Main.',
      status: 'PLANNING',
      location: 'St. Louis, MO',
      customerName: 'Spire Energy',
      createdById: owner.id,
      startDate: faker.date.future({ years: 0.1 }),
      budget: 850000,
    }
  });

  // Project 3: Residential (Completed)
  const resiProject = await prisma.project.create({
    data: {
      name: 'Lakeside Drive Utilities',
      description: 'Underground power and comms for residential subdivision.',
      status: 'COMPLETED',
      location: 'Spicer, MN',
      customerName: 'Xcel Energy',
      createdById: owner.id,
      startDate: faker.date.past({ years: 0.5 }),
      endDate: faker.date.past({ years: 0.1 }),
      budget: 45000,
    }
  });

  // --- 6. PROJECT DETAILS (Fiber Project) ---
  console.log('Populating Fiber Project...');

  // Geotech
  await prisma.geotechReport.create({
    data: {
      projectId: fiberProject.id,
      title: 'Downtown Soil Analysis',
      reportDate: faker.date.recent({ days: 40 }),
      engineer: 'GeoTech Inc.',
      soilLayers: {
        create: [
          { startDepth: 0, endDepth: 15, soilType: 'Clay', description: 'Stiff Clay', color: '#8B4513', hardness: 4 },
          { startDepth: 15, endDepth: 40, soilType: 'Sand', description: 'Wet Sand', color: '#F4A460', hardness: 2 },
          { startDepth: 40, endDepth: 100, soilType: 'Rock', description: 'Limestone', color: '#808080', hardness: 8, rockStrengthPsi: 12000 },
        ]
      }
    }
  });

  // Bores
  const bore1 = await prisma.bore.create({
    data: {
      projectId: fiberProject.id,
      name: 'Bore A-1 (Main St Crossing)',
      status: 'IN_PROGRESS',
      totalLength: 500,
      diameterIn: 6,
      productMaterial: 'HDPE',
      borePlan: {
        create: {
          totalLength: 500,
          pipeDiameter: 6,
          pipeMaterial: 'HDPE',
          designMethod: 'ASTM F1962',
          safetyFactor: 2.0,
          fluidPlan: {
            create: { soilType: 'Mixed', pumpRate: 45, fluidType: 'Bentonite', totalVolume: 2500 }
          }
        }
      }
    }
  });

  // Daily Reports & History (Last 10 days)
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (10 - i));

    const isToday = i === 9;
    const status = isToday ? 'DRAFT' : 'APPROVED';

    // Create Report
    const report = await prisma.dailyReport.create({
      data: {
        projectId: fiberProject.id,
        reportDate: date,
        createdById: foreman.id,
        signedById: isToday ? null : superint.id,
        status: status as ReportStatus,
        weather: random(['Sunny', 'Cloudy', 'Rain', 'Windy']),
        notes: faker.lorem.sentence(),

      }
    });

    // Link Inventory Usage to Report (Simulated)
    if (!isToday) {
      await prisma.inventoryTransaction.create({
        data: {
          itemId: inventoryItems[0].id, // Bentonite
          type: 'USAGE',
          quantity: 5,
          projectId: fiberProject.id,
          userId: foreman.id,
          notes: `Used on Daily Report ${date.toLocaleDateString()}`,
          createdAt: date,
        }
      });
    }
  }

  // Safety Data
  // JSAs
  for (let i = 0; i < 5; i++) {
    await prisma.jSA.create({
      data: {
        projectId: fiberProject.id,
        date: faker.date.recent({ days: 14 }),
        taskDescription: 'Boring under roadway',
        hazards: JSON.stringify(['Traffic', 'Underground Utilities', 'Pinch Points']),
        controls: JSON.stringify(['Traffic Control Plan', 'Potholing', 'PPE']),
        signatures: JSON.stringify([foreman.name!, operator.name!, laborer.name!]),
      }
    });
  }

  // Toolbox Talks
  await prisma.safetyMeeting.create({
    data: {
      projectId: fiberProject.id,
      date: faker.date.recent({ days: 7 }),
      topic: 'Trench Safety & Excavation',
      attendees: [foreman.name!, operator.name!, laborer.name!],
      notes: 'Discussed spoil pile placement and ladder access.',
    }
  });

  // Inspections
  await prisma.inspection.create({
    data: {
      projectId: fiberProject.id,
      type: 'Vehicle',
      assetId: assets[3].id, // F-550
      status: 'CLOSED',
      passed: true,
      assigneeId: operator.id,
      createdById: operator.id,
      items: JSON.stringify({ tires: 'Pass', lights: 'Pass', fluids: 'Pass' }),
      completedAt: faker.date.recent({ days: 1 }),
    }
  });

  // QC Punch List
  await prisma.punchItem.create({
    data: {
      projectId: fiberProject.id,
      title: 'Restore Sod at Station 10+00',
      description: 'Sod was damaged by vac truck tires.',
      status: 'OPEN',
      priority: 'MEDIUM',
      assigneeId: laborer.id,
      dueDate: faker.date.soon({ days: 3 }),
    }
  });

  await prisma.punchItem.create({
    data: {
      projectId: fiberProject.id,
      title: 'Clean Mud from Sidewalk',
      description: 'Drilling fluid spilled near exit pit.',
      status: 'COMPLETED',
      priority: 'HIGH',
      assigneeId: laborer.id,
      completedAt: faker.date.recent({ days: 2 }),
    }
  });

  // --- 7. RIVER PROJECT DETAILS (Complex) ---
  console.log('Populating River Project...');

  // River Obstacles
  await prisma.obstacle.createMany({
    data: [
      { projectId: riverProject.id, name: 'Old Bridge Piling', type: 'structure', startX: 500, startY: 0, startZ: 60, diameter: 48, safetyBuffer: 10 },
      { projectId: riverProject.id, name: 'Gas Main (30")', type: 'gas', startX: 1200, startY: 0, startZ: 15, diameter: 30, safetyBuffer: 5 },
      { projectId: riverProject.id, name: 'River Bottom', type: 'water', startX: 200, startY: 0, startZ: 20, endX: 1300, endY: 0, endZ: 20, diameter: 12, safetyBuffer: 0 }
    ]
  });

  // River Bore
  await prisma.bore.create({
    data: {
      projectId: riverProject.id,
      name: 'River Crossing Main',
      status: 'PLANNED',
      totalLength: 1500,
      diameterIn: 12,
      productMaterial: 'Steel',
      dip: 68,
      declination: -1,
      borePlan: {
        create: {
          totalLength: 1500,
          pipeDiameter: 12,
          pipeMaterial: 'Steel',
          designMethod: 'PRCI',
          safetyFactor: 3.0,
          notes: 'Deep bore required to avoid river scour.'
        }
      }
    }
  });

  // --- 8. EXPENSES (Phase 5) ---
  console.log('Creating Expenses...');
  const expenseCategories = ['Fuel', 'Per Diem', 'Materials', 'Repairs', 'Lodging'];
  for (let i = 0; i < 15; i++) {
    await prisma.expense.create({
      data: {
        projectId: fiberProject.id,
        date: faker.date.recent({ days: 30 }),
        category: random(expenseCategories),
        amount: parseFloat(faker.commerce.price({ min: 50, max: 500 })),
        vendor: faker.company.name(),
        description: faker.lorem.sentence(),
        status: random(['PENDING', 'APPROVED', 'PAID']),
        createdById: foreman.id,
      }
    });
  }


  // ... existing code ...

  // --- 9. ROD PLANS (Phase 6) ---
  console.log('Creating Rod Plans...');
  // Generate a simple straight bore plan for Bore 1
  const plannedRods = [];
  let currentPitch = -12; // Start with entry pitch
  for (let i = 0; i < 30; i++) {
    // Flatten out gradually
    if (i > 5 && currentPitch < 0) currentPitch += 2;
    if (currentPitch > 0) currentPitch = 0;

    plannedRods.push({
      id: faker.string.uuid(),
      length: 15,
      pitch: currentPitch,
      azimuth: 90,
      pullback: 0,
      pMax: 0
    });
  }

  await prisma.borePlan.update({
    where: { boreId: bore1.id },
    data: {
      planData: JSON.stringify(plannedRods),
      notes: 'Auto-generated demo plan'
    }
  });

  console.log('✅ Base Seed complete!');

  // --- 10. 811 TICKETS (Phase 2) ---
  console.log('Creating 811 Tickets...');

  // 1. Active Ticket (Expiring Soon)
  const activeTicket = await prisma.ticket811.create({
    data: {
      ticketNumber: '240101-001',
      type: 'NORMAL',
      status: 'ACTIVE' as TicketStatus,
      submittedAt: faker.date.recent({ days: 10 }),
      workToBeginDate: faker.date.recent({ days: 2 }),
      expirationDate: faker.date.soon({ days: 2 }), // Expiring in 2 days
      company: 'Midwest Underground',
      caller: foreman.name || 'Foreman',
      phone: '555-0123',
      email: 'foreman@midwestunderground.com',
      workSiteAddress: '123 Main St',
      city: 'Minneapolis',
      county: 'Hennepin',
      nearestIntersection: 'Main St & 1st Ave',
      markingInstructions: 'Mark entire lot',
      projectId: fiberProject.id,
      responses: {
        create: [
          { utilityName: 'Xcel Energy', status: 'Marked', responseDate: faker.date.recent({ days: 1 }), notes: 'Gas marked in yellow' },
          { utilityName: 'CenturyLink', status: 'Clear', responseDate: faker.date.recent({ days: 1 }) },
          { utilityName: 'Comcast', status: 'Not Responded' } // Not ready yet
        ]
      }
    }
  });

  // 2. Ready to Dig Ticket
  await prisma.ticket811.create({
    data: {
      ticketNumber: '240101-002',
      type: 'NORMAL',
      status: 'ACTIVE' as TicketStatus,
      submittedAt: faker.date.recent({ days: 12 }),
      workToBeginDate: faker.date.recent({ days: 5 }),
      expirationDate: faker.date.soon({ days: 5 }),
      company: 'Midwest Underground',
      caller: foreman.name || 'Foreman',
      phone: '555-0123',
      email: 'foreman@midwestunderground.com',
      workSiteAddress: '456 Lake Dr',
      city: 'Spicer',
      county: 'Kandiyohi',
      projectId: resiProject.id,
      responses: {
        create: [
          { utilityName: 'Xcel Energy', status: 'Clear', responseDate: faker.date.recent({ days: 2 }) },
          { utilityName: 'Charter', status: 'Clear', responseDate: faker.date.recent({ days: 2 }) },
          { utilityName: 'City Sewer', status: 'Marked', responseDate: faker.date.recent({ days: 2 }) }
        ]
      }
    }
  });

  // 3. Expired Ticket
  await prisma.ticket811.create({
    data: {
      ticketNumber: '231201-999',
      type: 'EMERGENCY',
      status: 'EXPIRED' as TicketStatus,
      submittedAt: faker.date.past({ years: 0.1 }),
      workToBeginDate: faker.date.past({ years: 0.1 }),
      expirationDate: faker.date.recent({ days: 5 }), // Already expired
      company: 'Midwest Underground',
      caller: owner.name || 'Owner',
      phone: '555-9999',
      workSiteAddress: '789 River Rd',
      city: 'St. Cloud',
      county: 'Stearns',
      responses: {
        create: [
          { utilityName: 'CenterPoint', status: 'Conflict', responseDate: faker.date.past({ years: 0.1 }), notes: 'High pressure main conflict' }
        ]
      }
    }
  });

  // --- 11. EXECUTE HELPER SCRIPTS ---
  console.log('🚀 Running Helper Scripts...');

  const { execSync } = require('child_process');

  try {
    // 1. Generate Employees
    console.log('Running generate_dummy_employees.ts...');
    execSync('npx ts-node scripts/generate_dummy_employees.ts', { stdio: 'inherit' });

    // 2. Seed Time & Crews
    console.log('Running seed-time-data.ts...');
    execSync('npx ts-node scripts/seed-time-data.ts', { stdio: 'inherit' });

    // 3. Seed Operational Data
    console.log('Running seed-operational-data.ts...');
    execSync('npx ts-node scripts/seed-operational-data.ts', { stdio: 'inherit' });

    // 4. Seed Financial Data
    console.log('Running seed-financials.ts...');
    execSync('npx ts-node scripts/seed-financials.ts', { stdio: 'inherit' });

  } catch (error) {
    console.error('Error running helper scripts:', error);
  }

  console.log('🎉 All Seeding Operations Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

