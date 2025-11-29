import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // ============================================================================
  // 1. CREATE USERS
  // ============================================================================
  console.log('👥 Creating users...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const owner = await prisma.user.create({
    data: {
      email: 'owner@midwestunderground.com',
      name: 'Mike Anderson',
      password: passwordHash,
      role: 'OWNER',
      phone: '320-382-6636',
    },
  });

  const super1 = await prisma.user.create({
    data: {
      email: 'super@midwestunderground.com',
      name: 'Tom Jenkins',
      password: passwordHash,
      role: 'SUPER',
      phone: '320-555-0101',
    },
  });

  const super2 = await prisma.user.create({
    data: {
      email: 'supervisor@midwestunderground.com',
      name: 'Sarah Miller',
      password: passwordHash,
      role: 'SUPER',
      phone: '320-555-0102',
    },
  });

  const crew1 = await prisma.user.create({
    data: {
      email: 'crew@midwestunderground.com',
      name: 'Dave Johnson',
      password: passwordHash,
      role: 'CREW',
      phone: '320-555-0201',
    },
  });

  const crew2 = await prisma.user.create({
    data: {
      email: 'operator@midwestunderground.com',
      name: 'Rick Thompson',
      password: passwordHash,
      role: 'CREW',
      phone: '320-555-0202',
    },
  });

  const crew3 = await prisma.user.create({
    data: {
      email: 'locator@midwestunderground.com',
      name: 'James Rodriguez',
      password: passwordHash,
      role: 'CREW',
      phone: '320-555-0203',
    },
  });

  console.log(`✅ Created 6 users (1 OWNER, 2 SUPER, 3 CREW)\n`);

  // ============================================================================
  // 2. CREATE PROJECTS
  // ============================================================================
  console.log('📋 Creating projects...');

  const project1 = await prisma.project.create({
    data: {
      name: 'Willmar Fiber Optic Network - Phase 1',
      description: 'Installation of fiber optic infrastructure for city-wide broadband network. Primary routes along County Road 5 and 3rd Street SW.',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2025-03-31'),
      budget: 487500.00,
      location: JSON.stringify({ city: 'Willmar', state: 'MN', county: 'Kandiyohi' }),
      customerName: 'City of Willmar',
      customerContact: 'John Peterson - (320) 235-4913',
      createdById: owner.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Kandiyohi County Rural Broadband',
      description: 'BEAD-funded rural fiber deployment covering 42 miles of new underground infrastructure serving underserved communities.',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-06-30'),
      budget: 1250000.00,
      location: JSON.stringify({ city: 'Various', state: 'MN', county: 'Kandiyohi' }),
      customerName: 'Kandiyohi County',
      customerContact: 'Susan Martinez - (320) 231-6200',
      createdById: owner.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'NIPSCO Gas Main Extension',
      description: 'Natural gas service line extension for new residential development. 1,850 LF of 4-inch HDPE gas main.',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-11-15'),
      endDate: new Date('2025-01-15'),
      budget: 95000.00,
      location: JSON.stringify({ city: 'New London', state: 'MN', county: 'Kandiyohi' }),
      customerName: 'NIPSCO Gas',
      customerContact: 'Brad Wilson - (574) 647-5000',
      createdById: owner.id,
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'Spicer Water Main Replacement',
      description: 'Replace aging 6-inch water main with new 8-inch ductile iron. HDD under County Road 10.',
      status: 'PLANNING',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-05-31'),
      budget: 125000.00,
      location: JSON.stringify({ city: 'Spicer', state: 'MN', county: 'Kandiyohi' }),
      customerName: 'City of Spicer',
      customerContact: 'Mary Johnson - (320) 796-5562',
      createdById: owner.id,
    },
  });

  const project5 = await prisma.project.create({
    data: {
      name: 'Highway 71 Fiber Crossing',
      description: 'Directional drill under Highway 71 for telecommunications conduit. MnDOT permit required.',
      status: 'COMPLETED',
      startDate: new Date('2024-08-15'),
      endDate: new Date('2024-09-30'),
      budget: 45000.00,
      location: JSON.stringify({ city: 'Willmar', state: 'MN', county: 'Kandiyohi' }),
      customerName: 'Frontier Communications',
      customerContact: 'Steve Davis - (612) 555-0150',
      createdById: owner.id,
    },
  });

  const project6 = await prisma.project.create({
    data: {
      name: 'Industrial Park Power Conduit',
      description: 'Underground 3-inch PVC conduit for electrical service to new warehouse facility.',
      status: 'ON_HOLD',
      startDate: new Date('2025-02-01'),
      budget: 32000.00,
      location: JSON.stringify({ city: 'Willmar', state: 'MN', county: 'Kandiyohi' }),
      customerName: 'Willmar Industrial Development',
      customerContact: 'Todd Anderson - (320) 231-5161',
      createdById: owner.id,
    },
  });

  const project7 = await prisma.project.create({
    data: {
      name: 'Lake Lillian Geothermal Loop Field',
      description: 'Horizontal geothermal ground loop installation for community center HVAC system. 8 bores @ 350 feet each.',
      status: 'PLANNING',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-06-30'),
      budget: 78000.00,
      location: JSON.stringify({ city: 'Lake Lillian', state: 'MN', county: 'Kandiyohi' }),
      customerName: 'Lake Lillian City Council',
      customerContact: 'Patricia Lee - (320) 664-4357',
      createdById: owner.id,
    },
  });

  console.log(`✅ Created 7 projects (3 IN_PROGRESS, 2 PLANNING, 1 COMPLETED, 1 ON_HOLD)\n`);

  // ============================================================================
  // 3. CREATE PITS
  // ============================================================================
  console.log('⛏️  Creating pits...');

  const pit1Entry = await prisma.pit.create({
    data: {
      projectId: project1.id,
      type: 'entry',
      location: JSON.stringify({ lat: 45.1219, lon: -95.0432 }),
      elevation: 1125.5,
      notes: 'Entry pit on south side of County Road 5, 15ft from centerline',
      photos: JSON.stringify([]),
    },
  });

  const pit1Exit = await prisma.pit.create({
    data: {
      projectId: project1.id,
      type: 'exit',
      location: JSON.stringify({ lat: 45.1223, lon: -95.0428 }),
      elevation: 1122.8,
      notes: 'Exit pit on north side of County Road 5, clear of all utilities',
    },
  });

  const pit2Entry = await prisma.pit.create({
    data: {
      projectId: project1.id,
      type: 'entry',
      location: JSON.stringify({ lat: 45.1185, lon: -95.0465 }),
      elevation: 1128.2,
      notes: '3rd Street SW crossing - entry pit in right-of-way',
    },
  });

  const pit2Exit = await prisma.pit.create({
    data: {
      projectId: project1.id,
      type: 'exit',
      location: JSON.stringify({ lat: 45.1188, lon: -95.0462 }),
      elevation: 1127.5,
    },
  });

  const pit3Entry = await prisma.pit.create({
    data: {
      projectId: project2.id,
      type: 'entry',
      location: JSON.stringify({ lat: 45.2341, lon: -95.1234 }),
      elevation: 1142.0,
      notes: 'Rural crossing at Township Road 12',
    },
  });

  const pit3Exit = await prisma.pit.create({
    data: {
      projectId: project2.id,
      type: 'exit',
      location: JSON.stringify({ lat: 45.2348, lon: -95.1228 }),
      elevation: 1138.5,
    },
  });

  console.log(`✅ Created 6 pits\n`);

  // ============================================================================
  // 4. CREATE BORES
  // ============================================================================
  console.log('🔨 Creating bores...');

  const bore1 = await prisma.bore.create({
    data: {
      projectId: project1.id,
      name: 'CR-5 Crossing North',
      alignment: JSON.stringify({
        type: 'LineString',
        coordinates: [[-95.0432, 45.1219], [-95.0428, 45.1223]],
      }),
      depthProfile: JSON.stringify([
        { station: 0, depth: 8, elevation: 1117.5 },
        { station: 50, depth: 12, elevation: 1113.5 },
        { station: 100, depth: 14, elevation: 1111.5 },
        { station: 150, depth: 12, elevation: 1113.8 },
        { station: 185, depth: 8, elevation: 1117.8 },
      ]),
      diameterIn: 3.0,
      productMaterial: 'HDPE Conduit (2" ID)',
      tracerWire: true,
      entryPitId: pit1Entry.id,
      exitPitId: pit1Exit.id,
      status: 'COMPLETED',
      totalLength: 185.0,
    },
  });

  const bore2 = await prisma.bore.create({
    data: {
      projectId: project1.id,
      name: '3rd Street SW Fiber Route',
      alignment: JSON.stringify({
        type: 'LineString',
        coordinates: [[-95.0465, 45.1185], [-95.0462, 45.1188]],
      }),
      depthProfile: JSON.stringify([
        { station: 0, depth: 6, elevation: 1122.2 },
        { station: 40, depth: 10, elevation: 1118.2 },
        { station: 85, depth: 12, elevation: 1116.2 },
        { station: 120, depth: 10, elevation: 1117.5 },
      ]),
      diameterIn: 4.0,
      productMaterial: 'HDPE Conduit (3" ID) with 96-strand fiber',
      tracerWire: true,
      entryPitId: pit2Entry.id,
      exitPitId: pit2Exit.id,
      status: 'IN_PROGRESS',
      totalLength: 120.0,
    },
  });

  const bore3 = await prisma.bore.create({
    data: {
      projectId: project2.id,
      name: 'Township Road 12 Crossing',
      alignment: JSON.stringify({
        type: 'LineString',
        coordinates: [[-95.1234, 45.2341], [-95.1228, 45.2348]],
      }),
      depthProfile: JSON.stringify([
        { station: 0, depth: 8, elevation: 1134.0 },
        { station: 75, depth: 15, elevation: 1127.0 },
        { station: 150, depth: 18, elevation: 1124.0 },
        { station: 225, depth: 15, elevation: 1123.5 },
        { station: 280, depth: 10, elevation: 1128.5 },
      ]),
      diameterIn: 4.0,
      productMaterial: '4-duct HDPE bundle',
      tracerWire: true,
      entryPitId: pit3Entry.id,
      exitPitId: pit3Exit.id,
      status: 'IN_PROGRESS',
      totalLength: 280.0,
    },
  });

  const bore4 = await prisma.bore.create({
    data: {
      projectId: project3.id,
      name: 'New London Gas Main - Bore 1',
      diameterIn: 6.0,
      productMaterial: '4" HDPE Gas Main (SDR 11)',
      tracerWire: true,
      status: 'PLANNED',
      totalLength: 425.0,
    },
  });

  const bore5 = await prisma.bore.create({
    data: {
      projectId: project3.id,
      name: 'New London Gas Main - Bore 2',
      diameterIn: 6.0,
      productMaterial: '4" HDPE Gas Main (SDR 11)',
      tracerWire: true,
      status: 'PLANNED',
      totalLength: 380.0,
    },
  });

  const bore6 = await prisma.bore.create({
    data: {
      projectId: project5.id,
      name: 'Highway 71 Telecom Crossing',
      diameterIn: 4.5,
      productMaterial: '3" Schedule 40 PVC Conduit',
      tracerWire: true,
      status: 'COMPLETED',
      totalLength: 95.0,
    },
  });

  console.log(`✅ Created 6 bores (2 COMPLETED, 2 IN_PROGRESS, 2 PLANNED)\n`);

  // ============================================================================
  // 5. CREATE ROD PASSES
  // ============================================================================
  console.log('📏 Creating rod passes...');

  // Bore 1 - Completed with all passes
  const rodPasses1 = [
    { sequence: 1, passNumber: 1, linearFeet: 10, fluidMix: 'Bentonite 6%', fluidVolumeGal: 35, notes: 'Pilot bore started' },
    { sequence: 2, passNumber: 1, linearFeet: 20, fluidMix: 'Bentonite 6%', fluidVolumeGal: 45, notes: 'Good steering response' },
    { sequence: 3, passNumber: 1, linearFeet: 30, fluidMix: 'Bentonite 6%', fluidVolumeGal: 50, notes: 'Clay layer encountered' },
    { sequence: 4, passNumber: 1, linearFeet: 40, fluidMix: 'Bentonite 7%', fluidVolumeGal: 55, notes: 'Increased viscosity' },
    { sequence: 5, passNumber: 1, linearFeet: 50, fluidMix: 'Bentonite 7%', fluidVolumeGal: 60, notes: 'Midpoint reached' },
    { sequence: 6, passNumber: 1, linearFeet: 60, fluidMix: 'Bentonite 7%', fluidVolumeGal: 55, notes: 'Ascending to exit' },
    { sequence: 7, passNumber: 1, linearFeet: 25, fluidMix: 'Bentonite 6%', fluidVolumeGal: 40, notes: 'Pilot bore complete - 185 total LF' },
    { sequence: 8, passNumber: 2, linearFeet: 185, fluidMix: 'Bentonite 8%', fluidVolumeGal: 280, notes: 'Pre-reaming with 6" bit' },
    { sequence: 9, passNumber: 3, linearFeet: 185, fluidMix: 'Bentonite 8% + polymer', fluidVolumeGal: 320, notes: 'Final reaming with 8" bit' },
    { sequence: 10, passNumber: 4, linearFeet: 185, fluidMix: 'Bentonite 8%', fluidVolumeGal: 250, notes: 'Product pullback - 3" HDPE conduit installed' },
  ];

  for (const pass of rodPasses1) {
    await prisma.rodPass.create({
      data: {
        boreId: bore1.id,
        sequence: pass.sequence,
        passNumber: pass.passNumber,
        linearFeet: pass.linearFeet,
        fluidMix: pass.fluidMix,
        fluidVolumeGal: pass.fluidVolumeGal,
        startedAt: new Date('2024-11-10T08:30:00'),
        completedAt: new Date('2024-11-10T15:45:00'),
        notes: pass.notes,
        loggedById: crew1.id,
      },
    });
  }

  // Bore 2 - In Progress (pilot bore only)
  const rodPasses2 = [
    { sequence: 1, passNumber: 1, linearFeet: 10, fluidMix: 'Bentonite 6%', fluidVolumeGal: 40, notes: 'Pilot started from entry pit' },
    { sequence: 2, passNumber: 1, linearFeet: 20, fluidMix: 'Bentonite 6%', fluidVolumeGal: 45, notes: 'On grade and line' },
    { sequence: 3, passNumber: 1, linearFeet: 30, fluidMix: 'Bentonite 6%', fluidVolumeGal: 50, notes: 'Cobbles encountered, slowed progress' },
    { sequence: 4, passNumber: 1, linearFeet: 40, fluidMix: 'Bentonite 7%', fluidVolumeGal: 60, notes: 'Increased mud weight for stability' },
  ];

  for (const pass of rodPasses2) {
    await prisma.rodPass.create({
      data: {
        boreId: bore2.id,
        sequence: pass.sequence,
        passNumber: pass.passNumber,
        linearFeet: pass.linearFeet,
        fluidMix: pass.fluidMix,
        fluidVolumeGal: pass.fluidVolumeGal,
        startedAt: new Date('2024-11-20T09:00:00'),
        notes: pass.notes,
        loggedById: crew2.id,
      },
    });
  }

  // Bore 3 - In Progress (pilot bore in progress)
  const rodPasses3 = [
    { sequence: 1, passNumber: 1, linearFeet: 10, fluidMix: 'Bentonite 6%', fluidVolumeGal: 50, notes: 'Initial pilot bore entry' },
    { sequence: 2, passNumber: 1, linearFeet: 20, fluidMix: 'Bentonite 6%', fluidVolumeGal: 55, notes: 'Steering adjustments for grade' },
    { sequence: 3, passNumber: 1, linearFeet: 30, fluidMix: 'Bentonite 6%', fluidVolumeGal: 60, notes: 'Sandy soil conditions' },
    { sequence: 4, passNumber: 1, linearFeet: 40, fluidMix: 'Bentonite 6.5%', fluidVolumeGal: 65, notes: 'Increasing depth to 15 feet' },
    { sequence: 5, passNumber: 1, linearFeet: 50, fluidMix: 'Bentonite 7%', fluidVolumeGal: 70, notes: 'Maximum depth reached' },
    { sequence: 6, passNumber: 1, linearFeet: 50, fluidMix: 'Bentonite 7%', fluidVolumeGal: 70, notes: 'Maintaining grade' },
  ];

  for (const pass of rodPasses3) {
    await prisma.rodPass.create({
      data: {
        boreId: bore3.id,
        sequence: pass.sequence,
        passNumber: pass.passNumber,
        linearFeet: pass.linearFeet,
        fluidMix: pass.fluidMix,
        fluidVolumeGal: pass.fluidVolumeGal,
        startedAt: new Date('2024-11-18T07:30:00'),
        notes: pass.notes,
        loggedById: crew1.id,
      },
    });
  }

  console.log(`✅ Created 20 rod passes across 3 active bores\n`);

  // ============================================================================
  // 6. CREATE DAILY REPORTS
  // ============================================================================
  console.log('📝 Creating daily reports...');

  await prisma.dailyReport.create({
    data: {
      projectId: project1.id,
      reportDate: new Date('2024-11-10'),
      crew: JSON.stringify([
        { name: 'Tom Jenkins', role: 'Supervisor', hours: 10 },
        { name: 'Dave Johnson', role: 'Operator', hours: 10 },
        { name: 'Rick Thompson', role: 'Locator', hours: 10 },
        { name: 'James Rodriguez', role: 'Laborer', hours: 10 },
      ]),
      production: JSON.stringify([
        {
          boreId: bore1.id,
          activity: 'Pilot bore completed',
          lf: 185,
          startTime: '08:30',
          endTime: '12:00',
        },
        {
          boreId: bore1.id,
          activity: 'Pre-ream and final ream',
          lf: 185,
          startTime: '12:30',
          endTime: '15:45',
        },
      ]),
      labor: JSON.stringify([
        { name: 'Tom Jenkins', hours: 10, rate: 55, total: 550 },
        { name: 'Dave Johnson', hours: 10, rate: 45, total: 450 },
        { name: 'Rick Thompson', hours: 10, rate: 42, total: 420 },
        { name: 'James Rodriguez', hours: 10, rate: 38, total: 380 },
      ]),
      equipment: JSON.stringify([
        { name: 'Vermeer D36x50 Drill Rig', hours: 7.5, rate: 275, total: 2062.50 },
        { name: 'Ditch Witch FM25 Mud System', hours: 7.5, rate: 125, total: 937.50 },
        { name: 'Locating Equipment', hours: 7.5, rate: 35, total: 262.50 },
      ]),
      materials: JSON.stringify([
        { description: 'Bentonite Clay', qty: 18, unit: 'bags', cost: 35, total: 630 },
        { description: '3" HDPE Conduit', qty: 185, unit: 'LF', cost: 4.50, total: 832.50 },
        { description: 'Tracer Wire #12 AWG', qty: 200, unit: 'LF', cost: 0.45, total: 90 },
      ]),
      weather: JSON.stringify({ condition: 'Partly Cloudy', temp: 48, impact: 'None' }),
      notes: 'Completed CR-5 Crossing North bore successfully. All alignments within spec. No utilities encountered. Customer present for final inspection.',
      photos: JSON.stringify([]),
      status: 'APPROVED',
      signedById: super1.id,
      signedAt: new Date('2024-11-11T08:00:00'),
      createdById: crew1.id,
    },
  });

  await prisma.dailyReport.create({
    data: {
      projectId: project1.id,
      reportDate: new Date('2024-11-20'),
      crew: JSON.stringify([
        { name: 'Tom Jenkins', role: 'Supervisor', hours: 8 },
        { name: 'Rick Thompson', role: 'Operator', hours: 8 },
        { name: 'Dave Johnson', role: 'Locator', hours: 8 },
      ]),
      production: JSON.stringify([
        {
          boreId: bore2.id,
          activity: 'Pilot bore started - 3rd Street SW',
          lf: 40,
          startTime: '09:00',
          endTime: '15:30',
        },
      ]),
      labor: JSON.stringify([
        { name: 'Tom Jenkins', hours: 8, rate: 55, total: 440 },
        { name: 'Rick Thompson', hours: 8, rate: 45, total: 360 },
        { name: 'Dave Johnson', hours: 8, rate: 42, total: 336 },
      ]),
      equipment: JSON.stringify([
        { name: 'Vermeer D36x50 Drill Rig', hours: 6.5, rate: 275, total: 1787.50 },
        { name: 'Ditch Witch FM25 Mud System', hours: 6.5, rate: 125, total: 812.50 },
      ]),
      materials: JSON.stringify([
        { description: 'Bentonite Clay', qty: 12, unit: 'bags', cost: 35, total: 420 },
        { description: 'Drill Rods 10ft', qty: 4, unit: 'ea', cost: 0, total: 0 },
      ]),
      weather: JSON.stringify({ condition: 'Overcast, Light Rain PM', temp: 42, impact: 'Minimal - stopped early due to rain' }),
      notes: 'Started pilot bore on 3rd Street SW crossing. Progress slower than expected due to cobbles. Rain stopped work at 3:30 PM. Equipment secured on site.',
      status: 'SUBMITTED',
      createdById: crew2.id,
    },
  });

  await prisma.dailyReport.create({
    data: {
      projectId: project2.id,
      reportDate: new Date('2024-11-18'),
      crew: JSON.stringify([
        { name: 'Sarah Miller', role: 'Supervisor', hours: 9 },
        { name: 'Dave Johnson', role: 'Operator', hours: 9 },
        { name: 'James Rodriguez', role: 'Locator', hours: 9 },
      ]),
      production: JSON.stringify([
        {
          boreId: bore3.id,
          activity: 'Pilot bore in progress - Township Road 12',
          lf: 200,
          startTime: '07:30',
          endTime: '16:00',
        },
      ]),
      labor: JSON.stringify([
        { name: 'Sarah Miller', hours: 9, rate: 55, total: 495 },
        { name: 'Dave Johnson', hours: 9, rate: 45, total: 405 },
        { name: 'James Rodriguez', hours: 9, rate: 42, total: 378 },
      ]),
      equipment: JSON.stringify([
        { name: 'Vermeer D36x50 Drill Rig', hours: 8.5, rate: 275, total: 2337.50 },
        { name: 'Ditch Witch FM25 Mud System', hours: 8.5, rate: 125, total: 1062.50 },
        { name: 'Locating Equipment', hours: 8.5, rate: 35, total: 297.50 },
      ]),
      materials: JSON.stringify([
        { description: 'Bentonite Clay', qty: 20, unit: 'bags', cost: 35, total: 700 },
        { description: 'Polymer Additive', qty: 4, unit: 'bags', cost: 75, total: 300 },
      ]),
      weather: JSON.stringify({ condition: 'Clear and Cold', temp: 35, impact: 'None' }),
      notes: 'Good progress on Township Road 12 crossing. Sandy soil conditions favorable. 200 LF pilot bore completed, 80 LF remaining. No issues.',
      status: 'APPROVED',
      signedById: super2.id,
      signedAt: new Date('2024-11-19T07:30:00'),
      createdById: crew1.id,
    },
  });

  await prisma.dailyReport.create({
    data: {
      projectId: project1.id,
      reportDate: new Date('2024-11-21'),
      crew: JSON.stringify([
        { name: 'Tom Jenkins', role: 'Supervisor', hours: 4 },
        { name: 'Rick Thompson', role: 'Operator', hours: 4 },
      ]),
      production: JSON.stringify([
        {
          boreId: bore2.id,
          activity: 'Equipment maintenance and site prep',
          lf: 0,
          startTime: '08:00',
          endTime: '12:00',
        },
      ]),
      labor: JSON.stringify([
        { name: 'Tom Jenkins', hours: 4, rate: 55, total: 220 },
        { name: 'Rick Thompson', hours: 4, rate: 45, total: 180 },
      ]),
      equipment: JSON.stringify([
        { name: 'Vermeer D36x50 Drill Rig', hours: 0, rate: 275, total: 0 },
      ]),
      materials: JSON.stringify([]),
      weather: JSON.stringify({ condition: 'Rain', temp: 40, impact: 'Work stopped - weather delay' }),
      notes: 'Rain delay. Performed equipment maintenance and cleaned mud system. No production today.',
      status: 'DRAFT',
      createdById: crew2.id,
    },
  });

  console.log(`✅ Created 4 daily reports (2 APPROVED, 1 SUBMITTED, 1 DRAFT)\n`);

  // ============================================================================
  // 7. CREATE 811 TICKETS
  // ============================================================================
  console.log('📞 Creating 811 tickets...');

  const ticket1 = await prisma.ticket811.create({
    data: {
      projectId: project1.id,
      ticketNumber: 'MN-24-1105-A3847',
      ticketDate: new Date('2024-11-05'),
      expirationDate: new Date('2024-12-05'),
      status: 'ACTIVE',
      notes: 'Initial locate request for CR-5 crossing work area',
    },
  });

  const ticket2 = await prisma.ticket811.create({
    data: {
      projectId: project1.id,
      ticketNumber: 'MN-24-1118-B4721',
      ticketDate: new Date('2024-11-18'),
      expirationDate: new Date('2024-12-18'),
      status: 'ACTIVE',
      notes: '3rd Street SW crossing - all utilities marked',
    },
  });

  const ticket3 = await prisma.ticket811.create({
    data: {
      projectId: project2.id,
      ticketNumber: 'MN-24-1115-C9283',
      ticketDate: new Date('2024-11-15'),
      expirationDate: new Date('2024-12-15'),
      status: 'ACTIVE',
      notes: 'Township Road 12 crossing - rural area',
    },
  });

  const ticket4 = await prisma.ticket811.create({
    data: {
      projectId: project5.id,
      ticketNumber: 'MN-24-0810-X1234',
      ticketDate: new Date('2024-08-10'),
      expirationDate: new Date('2024-09-10'),
      status: 'EXPIRED',
      notes: 'Highway 71 crossing - completed project',
    },
  });

  // Create ticket responses
  await prisma.ticket811Response.create({
    data: {
      ticketId: ticket1.id,
      utilityName: 'Xcel Energy',
      responseType: 'Positive',
      responseDate: new Date('2024-11-06'),
      marksDescription: 'Underground electric marked with red paint and flags',
      respondedById: crew3.id,
      locatePhotos: JSON.stringify([]),
    },
  });

  await prisma.ticket811Response.create({
    data: {
      ticketId: ticket1.id,
      utilityName: 'CenterPoint Energy',
      responseType: 'Clear',
      responseDate: new Date('2024-11-06'),
      marksDescription: 'No natural gas facilities in area',
      respondedById: crew3.id,
    },
  });

  await prisma.ticket811Response.create({
    data: {
      ticketId: ticket1.id,
      utilityName: 'City of Willmar - Water',
      responseType: 'Positive',
      responseDate: new Date('2024-11-07'),
      marksDescription: '8-inch water main marked with blue paint, 12 feet south of centerline',
      respondedById: crew3.id,
    },
  });

  await prisma.ticket811Response.create({
    data: {
      ticketId: ticket2.id,
      utilityName: 'Frontier Communications',
      responseType: 'Positive',
      responseDate: new Date('2024-11-19'),
      marksDescription: 'Telecom cable marked with orange flags, aerial drop nearby',
      respondedById: crew3.id,
    },
  });

  await prisma.ticket811Response.create({
    data: {
      ticketId: ticket3.id,
      utilityName: 'Kandiyohi County',
      responseType: 'Clear',
      responseDate: new Date('2024-11-16'),
      marksDescription: 'No county utilities in work area',
      respondedById: crew3.id,
    },
  });

  console.log(`✅ Created 4 811 tickets with 5 utility responses\n`);

  // ============================================================================
  // 8. CREATE INSPECTIONS
  // ============================================================================
  console.log('🔍 Creating inspections...');

  const inspection1 = await prisma.inspection.create({
    data: {
      projectId: project1.id,
      boreId: bore1.id,
      templateName: 'HDD Pre-Bore Inspection',
      items: JSON.stringify([
        { question: 'Locates verified and current?', answer: 'Yes', result: 'Pass', notes: '811 ticket valid until 12/5/24' },
        { question: 'Entry and exit pits properly shored?', answer: 'Yes', result: 'Pass', notes: 'OSHA compliant shoring installed' },
        { question: 'Drilling fluid containment in place?', answer: 'Yes', result: 'Pass', notes: 'Sediment basins and vacuum truck on standby' },
        { question: 'All equipment inspected and operational?', answer: 'Yes', result: 'Pass', notes: 'Pre-start checklist completed' },
        { question: 'Traffic control properly established?', answer: 'Yes', result: 'Pass', notes: 'Signs, cones, and flaggers positioned' },
      ]),
      assigneeId: super1.id,
      completedAt: new Date('2024-11-10T07:30:00'),
      status: 'COMPLETED',
      location: JSON.stringify({ lat: 45.1219, lon: -95.0432 }),
      createdById: super1.id,
    },
  });

  const inspection2 = await prisma.inspection.create({
    data: {
      projectId: project1.id,
      boreId: bore1.id,
      templateName: 'HDD Post-Installation Inspection',
      items: JSON.stringify([
        { question: 'Product installed to specification?', answer: 'Yes', result: 'Pass', notes: '3" HDPE conduit with tracer wire' },
        { question: 'No damage to product during installation?', answer: 'Yes', result: 'Pass', notes: 'Visual inspection and pressure test passed' },
        { question: 'Pits properly backfilled?', answer: 'Yes', result: 'Pass', notes: 'Compacted to 95% standard proctor' },
        { question: 'Site restored to pre-construction condition?', answer: 'Yes', result: 'Pass', notes: 'Customer accepted restoration' },
        { question: 'As-built documentation complete?', answer: 'Yes', result: 'Pass', notes: 'GPS coordinates and depth recorded' },
      ]),
      assigneeId: super1.id,
      completedAt: new Date('2024-11-10T16:00:00'),
      status: 'COMPLETED',
      createdById: super1.id,
    },
  });

  const inspection3 = await prisma.inspection.create({
    data: {
      projectId: project2.id,
      boreId: bore3.id,
      templateName: 'Daily Safety Inspection',
      items: JSON.stringify([
        { question: 'All crew have proper PPE?', answer: 'Yes', result: 'Pass', notes: 'Hard hats, safety glasses, boots verified' },
        { question: 'Work zone properly barricaded?', answer: 'Yes', result: 'Pass' },
        { question: 'Fire extinguisher accessible?', answer: 'Yes', result: 'Pass' },
        { question: 'First aid kit on site?', answer: 'Yes', result: 'Pass' },
        { question: 'Emergency contacts posted?', answer: 'No', result: 'Fail', notes: 'Contact list missing from equipment' },
      ]),
      assigneeId: super2.id,
      dueDate: new Date('2024-11-18'),
      completedAt: new Date('2024-11-18T07:00:00'),
      status: 'FAILED',
      createdById: super2.id,
    },
  });

  const inspection4 = await prisma.inspection.create({
    data: {
      projectId: project1.id,
      templateName: 'Weekly Equipment Inspection',
      items: JSON.stringify([
        { question: 'Hydraulic system - no leaks?', answer: '', result: 'Pending' },
        { question: 'Drill rods - no cracks or damage?', answer: '', result: 'Pending' },
        { question: 'Mud pump - operating properly?', answer: '', result: 'Pending' },
        { question: 'Locating equipment - calibrated?', answer: '', result: 'Pending' },
      ]),
      assigneeId: crew1.id,
      dueDate: new Date('2024-11-25'),
      status: 'OPEN',
      createdById: super1.id,
    },
  });

  // Create corrective action for failed inspection
  await prisma.correctiveAction.create({
    data: {
      inspectionId: inspection3.id,
      description: 'Post emergency contact list on equipment dashboard and in crew truck',
      assigneeId: crew1.id,
      dueDate: new Date('2024-11-19'),
      status: 'COMPLETED',
      resolution: 'Laminated emergency contact list created and posted in drill rig and crew vehicle',
      closedAt: new Date('2024-11-18T15:00:00'),
    },
  });

  console.log(`✅ Created 4 inspections (2 COMPLETED, 1 FAILED, 1 OPEN) with 1 corrective action\n`);

  // ============================================================================
  // 9. CREATE RFIs
  // ============================================================================
  console.log('❓ Creating RFIs...');

  await prisma.rFI.create({
    data: {
      projectId: project1.id,
      boreId: bore2.id,
      question: 'Fiber splice enclosure location - should it be installed in manhole or above-ground handhole at exit pit?',
      location: JSON.stringify({ lat: 45.1188, lon: -95.0462 }),
      requiredBy: new Date('2024-11-25'),
      status: 'ANSWERED',
      response: 'Install Tier 2 splice enclosure in below-grade handhole vault at exit pit location per specification Section 3.4.2',
      respondedById: owner.id,
      respondedAt: new Date('2024-11-21T10:30:00'),
      createdById: super1.id,
    },
  });

  await prisma.rFI.create({
    data: {
      projectId: project2.id,
      question: 'Unexpected rock layer encountered at station 150+00. Recommend switching from 4" to 6" bore diameter to ensure successful reaming. Please advise on budget impact.',
      requiredBy: new Date('2024-11-22'),
      status: 'OPEN',
      createdById: super2.id,
    },
  });

  await prisma.rFI.create({
    data: {
      projectId: project3.id,
      question: 'Gas company requires pressure test documentation before final acceptance. What PSI and duration is required for acceptance test?',
      requiredBy: new Date('2024-12-01'),
      status: 'OPEN',
      createdById: super1.id,
    },
  });

  console.log(`✅ Created 3 RFIs (1 ANSWERED, 2 OPEN)\n`);

  // ============================================================================
  // 10. CREATE T&M TICKETS
  // ============================================================================
  console.log('💰 Creating T&M tickets...');

  await prisma.tMTicket.create({
    data: {
      projectId: project1.id,
      lineItems: JSON.stringify([
        { description: 'Additional excavation for utility conflict - 8 hours', qty: 8, unit: 'hours', rate: 125, total: 1000 },
        { description: 'Mini excavator rental - 1 day', qty: 1, unit: 'day', rate: 350, total: 350 },
        { description: 'Labor - 2 workers @ 4 hours each', qty: 8, unit: 'hours', rate: 45, total: 360 },
        { description: 'Backfill material - imported granular', qty: 3, unit: 'yards', rate: 45, total: 135 },
      ]),
      status: 'APPROVED',
      approvedById: owner.id,
      approvedAt: new Date('2024-11-15T14:00:00'),
      signature: JSON.stringify({
        data: 'signature_data_placeholder',
        timestamp: '2024-11-15T14:00:00',
        name: 'Mike Anderson',
      }),
      createdById: super1.id,
    },
  });

  await prisma.tMTicket.create({
    data: {
      projectId: project2.id,
      lineItems: JSON.stringify([
        { description: 'Weather delay - crew standby time', qty: 6, unit: 'hours', rate: 95, total: 570 },
        { description: 'Equipment standby', qty: 6, unit: 'hours', rate: 150, total: 900 },
      ]),
      status: 'SUBMITTED',
      createdById: super2.id,
    },
  });

  console.log(`✅ Created 2 T&M tickets (1 APPROVED, 1 SUBMITTED)\n`);

  // ============================================================================
  // 11. CREATE CHANGE ORDERS
  // ============================================================================
  console.log('📋 Creating change orders...');

  await prisma.changeOrder.create({
    data: {
      projectId: project2.id,
      scope: 'Increase bore diameter from 4" to 6" at Township Road 12 crossing due to unexpected rock conditions. Requires larger reamer and additional mud volume.',
      pricing: JSON.stringify({
        items: [
          { description: 'Upsize bore diameter', qty: 280, unit: 'LF', rate: 8.50, total: 2380 },
          { description: 'Additional drilling mud', qty: 150, unit: 'gallons', rate: 3.25, total: 487.50 },
          { description: 'Larger reamer rental', qty: 2, unit: 'days', rate: 450, total: 900 },
        ],
        subtotal: 3767.50,
        tax: 0,
        total: 3767.50,
      }),
      budgetImpact: 3767.50,
      status: 'PENDING',
      createdById: super2.id,
    },
  });

  console.log(`✅ Created 1 change order (PENDING)\n`);

  // ============================================================================
  // 12. CREATE EVENTS
  // ============================================================================
  console.log('⚠️  Creating events...');

  await prisma.event.create({
    data: {
      projectId: project1.id,
      boreId: bore2.id,
      type: 'obstruction',
      location: JSON.stringify({ lat: 45.1186, lon: -95.0464, station: 35 }),
      description: 'Cobble layer encountered at 35 LF. Slowed advance rate to 5 LF/hour. Increased drilling fluid viscosity and adjusted steering to navigate through.',
      photos: JSON.stringify([]),
      timestamp: new Date('2024-11-20T11:30:00'),
      createdById: crew2.id,
    },
  });

  await prisma.event.create({
    data: {
      projectId: project2.id,
      boreId: bore3.id,
      type: 'equipment-issue',
      description: 'Mud pump seal failure at 200 LF. Replaced seal on-site within 45 minutes. Drilling resumed with minimal delay.',
      timestamp: new Date('2024-11-18T13:15:00'),
      createdById: crew1.id,
    },
  });

  await prisma.event.create({
    data: {
      projectId: project5.id,
      boreId: bore6.id,
      type: 'completion',
      description: 'Highway 71 crossing completed successfully. Product installed and tested. MnDOT inspector approved final restoration.',
      timestamp: new Date('2024-09-30T15:00:00'),
      createdById: super1.id,
    },
  });

  console.log(`✅ Created 3 events (obstruction, equipment-issue, completion)\n`);

  // ============================================================================
  // 13. CREATE AUDIT LOGS
  // ============================================================================
  console.log('📋 Creating audit logs...');

  const report = await prisma.dailyReport.findFirst({
    where: { projectId: project1.id, reportDate: new Date('2024-11-10') },
  });

  if (report) {
    await prisma.reportAudit.create({
      data: {
        reportId: report.id,
        changedById: super1.id,
        changedAt: new Date('2024-11-11T08:00:00'),
        changes: JSON.stringify({
          status: { from: 'SUBMITTED', to: 'APPROVED' },
          signedById: { from: null, to: super1.id },
        }),
        snapshot: JSON.stringify({ status: 'APPROVED', signedById: super1.id }),
      },
    });
  }

  console.log(`✅ Created audit logs\n`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('🎉 Database seeding completed successfully!\n');
  console.log('📊 SUMMARY:');
  console.log('─────────────────────────────────────────');
  console.log(`✅ Users: 6 (1 OWNER, 2 SUPER, 3 CREW)`);
  console.log(`✅ Projects: 7`);
  console.log(`✅ Pits: 6`);
  console.log(`✅ Bores: 6`);
  console.log(`✅ Rod Passes: 20`);
  console.log(`✅ Daily Reports: 4`);
  console.log(`✅ 811 Tickets: 4`);
  console.log(`✅ 811 Responses: 5`);
  console.log(`✅ Inspections: 4`);
  console.log(`✅ Corrective Actions: 1`);
  console.log(`✅ RFIs: 3`);
  console.log(`✅ T&M Tickets: 2`);
  console.log(`✅ Change Orders: 1`);
  console.log(`✅ Events: 3`);
  console.log(`✅ Audit Logs: 1`);
  console.log('─────────────────────────────────────────\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
