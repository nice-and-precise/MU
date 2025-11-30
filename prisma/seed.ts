
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
      password: 'hashed_password_here', // In real app, hash this
      role: 'OWNER',
    },
  });

  const superint = await prisma.user.upsert({
    where: { email: 'super@midwestunderground.com' },
    update: {},
    create: {
      email: 'super@midwestunderground.com',
      name: 'Mike Super',
      password: 'hashed_password_here',
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

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
