
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Users
  const owner = await prisma.user.upsert({
    where: { email: 'owner@midwestunderground.com' },
    update: {},
    create: {
      email: 'owner@midwestunderground.com',
      name: 'John Owner',
      password: '$2b$10$PHv0g4qkTzwRKGkeGxGPf.x1QtOOgCkKVh2Og9RCw6VfXA6XaGYT6', // password123
      role: 'OWNER',
    },
  });

  const superint = await prisma.user.upsert({
    where: { email: 'super@midwestunderground.com' },
    update: {},
    create: {
      email: 'super@midwestunderground.com',
      name: 'Mike Super',
      password: '$2b$10$PHv0g4qkTzwRKGkeGxGPf.x1QtOOgCkKVh2Og9RCw6VfXA6XaGYT6', // password123
      role: 'SUPER',
    },
  });

  // 2. Create Cost Categories & Items (for Estimating)
  const laborCat = await prisma.costCategory.upsert({ where: { name: 'Labor' }, update: {}, create: { name: 'Labor' } });
  const equipCat = await prisma.costCategory.upsert({ where: { name: 'Equipment' }, update: {}, create: { name: 'Equipment' } });
  const matCat = await prisma.costCategory.upsert({ where: { name: 'Materials' }, update: {}, create: { name: 'Materials' } });

  const items = [
    { categoryId: laborCat.id, code: 'LAB-001', name: 'Drill Operator', unit: 'HR', unitCost: 85.00 },
    { categoryId: laborCat.id, code: 'LAB-002', name: 'Locator', unit: 'HR', unitCost: 75.00 },
    { categoryId: equipCat.id, code: 'EQP-001', name: 'Vermeer D24x40', unit: 'HR', unitCost: 150.00 },
    { categoryId: matCat.id, code: 'MAT-001', name: 'HDPE 4" SDR11', unit: 'LF', unitCost: 4.50 },
    { categoryId: matCat.id, code: 'MAT-002', name: 'Bentonite (Bag)', unit: 'EA', unitCost: 12.00 },
  ];

  for (const item of items) {
    await prisma.costItem.upsert({
      where: { code: item.code },
      update: {},
      create: item
    });
  }

  // 3. Create Project: "Fiber Expansion Phase 1"
  const project = await prisma.project.create({
    data: {
      name: 'Fiber Expansion Phase 1',
      description: 'Downtown fiber backbone installation.',
      status: 'IN_PROGRESS',
      location: 'Minneapolis, MN',
      customerName: 'MetroNet',
      createdById: owner.id,
      startDate: new Date(),
    }
  });

  // 4. Create Geotech Report & Layers
  const geoReport = await prisma.geotechReport.create({
    data: {
      projectId: project.id,
      title: 'Bore 1 Soil Analysis',
      reportDate: new Date(),
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

  // 5. Create Bore
  const bore = await prisma.bore.create({
    data: {
      projectId: project.id,
      name: 'Bore A-1 (Main Crossing)',
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
          pullbackForce: 15000, // Simulated calc
          fracOutRisk: 'LOW',
          fluidPlan: {
            create: {
              soilType: 'Mixed',
              pumpRate: 45,
              fluidType: 'Bentonite',
              totalVolume: 2500,
              volumePerFt: 5
            }
          }
        }
      }
    }
  });

  // 6. Create Daily Reports with Production Logs (for Analytics & As-Builts)
  // Day 1: 0-200ft
  await prisma.dailyReport.create({
    data: {
      projectId: project.id,
      reportDate: new Date(Date.now() - 86400000), // Yesterday
      createdById: superint.id,
      status: 'APPROVED',
      production: JSON.stringify([
        { boreId: bore.id, activity: 'Drill', lf: 15, pitch: -2, azimuth: 90, startTime: '08:00', endTime: '08:30' },
        { boreId: bore.id, activity: 'Drill', lf: 15, pitch: -4, azimuth: 90, startTime: '08:30', endTime: '09:00' },
        { boreId: bore.id, activity: 'Drill', lf: 15, pitch: -6, azimuth: 91, startTime: '09:00', endTime: '09:30' },
        // ... more logs simulated
      ]),
      crew: JSON.stringify([{ name: 'Mike Super', role: 'Foreman', hours: 10 }]),
    }
  });

  // Day 2: 200-400ft (Today)
  await prisma.dailyReport.create({
    data: {
      projectId: project.id,
      reportDate: new Date(),
      createdById: superint.id,
      status: 'DRAFT',
      production: JSON.stringify([
        { boreId: bore.id, activity: 'Drill', lf: 15, pitch: 0, azimuth: 92, startTime: '08:00', endTime: '08:30' },
        { boreId: bore.id, activity: 'Drill', lf: 15, pitch: 1, azimuth: 92, startTime: '08:30', endTime: '09:00' },
      ]),
      crew: JSON.stringify([{ name: 'Mike Super', role: 'Foreman', hours: 10 }]),
    }
  });

  // 7. Create Estimate
  await prisma.estimate.create({
    data: {
      projectId: project.id,
      name: 'Change Order #1 - Rock Drilling',
      status: 'DRAFT',
      createdById: owner.id,
      lines: {
        create: [
          { lineNumber: 1, description: 'Rock Drilling Surcharge', quantity: 100, unit: 'LF', unitCost: 25.00, subtotal: 2500, total: 2500 },
          { lineNumber: 2, description: 'Additional Bentonite', quantity: 10, unit: 'Bag', unitCost: 12.00, subtotal: 120, total: 120 },
        ]
      },
      total: 2620
    }
  });

  // 8. Robust Seeding - Additional Projects & Data

  // Commercial Project
  const commercialProject = await prisma.project.create({
    data: {
      name: 'Willmar Industrial Park Fiber',
      description: 'Fiber backbone for new industrial zone.',
      status: 'PLANNING',
      location: 'Willmar, MN',
      customerName: 'City of Willmar',
      createdById: owner.id,
      startDate: new Date(Date.now() + 86400000 * 30), // Starts in 30 days
      budget: 150000,
    }
  });

  // Residential Project
  const residentialProject = await prisma.project.create({
    data: {
      name: 'Lakeside Drive Utilities',
      description: 'Underground power and comms for residential subdivision.',
      status: 'COMPLETED',
      location: 'Spicer, MN',
      customerName: 'Xcel Energy',
      createdById: owner.id,
      startDate: new Date(Date.now() - 86400000 * 60), // Started 60 days ago
      budget: 45000,
    }
  });

  // Additional Cost Items
  const subCat = await prisma.costCategory.upsert({ where: { name: 'Subcontractor' }, update: {}, create: { name: 'Subcontractor' } });

  const robustItems = [
    { categoryId: subCat.id, code: 'SUB-001', name: 'Traffic Control', unit: 'DAY', unitCost: 1200.00 },
    { categoryId: subCat.id, code: 'SUB-002', name: 'Restoration Crew', unit: 'SQFT', unitCost: 8.50 },
    { categoryId: equipCat.id, code: 'EQP-005', name: 'Mud Mixing System', unit: 'DAY', unitCost: 450.00 },
    { categoryId: equipCat.id, code: 'EQP-006', name: 'Excavator (Mini)', unit: 'DAY', unitCost: 550.00 },
    { categoryId: equipCat.id, code: 'EQP-007', name: 'Vac Truck (Large)', unit: 'DAY', unitCost: 1800.00 },
    { categoryId: matCat.id, code: 'MAT-004', name: 'Drill Bit (Dirt)', unit: 'EA', unitCost: 850.00 },
    { categoryId: matCat.id, code: 'MAT-005', name: 'Drill Bit (Rock)', unit: 'EA', unitCost: 2500.00 },
    { categoryId: matCat.id, code: 'MAT-006', name: '2" HDPE SDR11', unit: 'LF', unitCost: 2.25 },
    { categoryId: matCat.id, code: 'MAT-007', name: '6" HDPE SDR11', unit: 'LF', unitCost: 8.50 },
    { categoryId: matCat.id, code: 'MAT-008', name: 'Tracer Wire (Copper)', unit: 'LF', unitCost: 0.18 },
    { categoryId: laborCat.id, code: 'LAB-003', name: 'Laborer', unit: 'HR', unitCost: 45.00 },
    { categoryId: laborCat.id, code: 'LAB-004', name: 'Foreman', unit: 'HR', unitCost: 95.00 },
  ];

  for (const item of robustItems) {
    await prisma.costItem.upsert({
      where: { code: item.code },
      update: {},
      create: item
    });
  }

  // Add Bores to Commercial Project
  await prisma.bore.create({
    data: {
      projectId: commercialProject.id,
      name: 'Bore C-1 (Road Crossing)',
      status: 'PLANNED',
      totalLength: 320,
      diameterIn: 4,
      productMaterial: 'HDPE',
      borePlan: {
        create: {
          totalLength: 320,
          pipeDiameter: 4,
          pipeMaterial: 'HDPE',
          designMethod: 'PRCI',
          safetyFactor: 2.5,
          notes: 'Watch for existing gas line at station 1+50'
        }
      }
    }
  });

  // Add Estimate to Commercial Project
  await prisma.estimate.create({
    data: {
      projectId: commercialProject.id,
      name: 'Initial Bid',
      status: 'SENT',
      createdById: owner.id,
      lines: {
        create: [
          { lineNumber: 1, description: 'Mob/Demob', quantity: 1, unit: 'LS', unitCost: 2500.00, subtotal: 2500, total: 2500 },
          { lineNumber: 2, description: 'Directional Drill 4" HDPE', quantity: 320, unit: 'LF', unitCost: 35.00, subtotal: 11200, total: 11200 },
          { lineNumber: 3, description: 'Traffic Control', quantity: 2, unit: 'DAY', unitCost: 1200.00, subtotal: 2400, total: 2400 },
          { lineNumber: 4, description: 'Potholing Utilities', quantity: 8, unit: 'HR', unitCost: 250.00, subtotal: 2000, total: 2000 },
        ]
      },
      total: 18100
    }
  });

  console.log('✅ Robust Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
