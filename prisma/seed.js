const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Organization ─────────────────────────────────────
  const org = await prisma.organization.create({
    data: {
      name: "Coastal Retreats LLC",
      planTier: "pro",
    },
  });
  console.log(`✅ Created organization: ${org.name}`);

  // ─── Users ────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.create({
    data: {
      orgId: org.id,
      name: "Sarah Mitchell",
      email: "sarah@coastalretreats.com",
      passwordHash,
      role: "OWNER",
      phone: "+1-555-0101",
    },
  });

  const manager = await prisma.user.create({
    data: {
      orgId: org.id,
      name: "James Rodriguez",
      email: "james@coastalretreats.com",
      passwordHash,
      role: "MANAGER",
      phone: "+1-555-0102",
    },
  });

  const cleaner1 = await prisma.user.create({
    data: {
      orgId: org.id,
      name: "Maria Santos",
      email: "maria@coastalretreats.com",
      passwordHash,
      role: "CLEANER",
      phone: "+1-555-0103",
    },
  });

  const cleaner2 = await prisma.user.create({
    data: {
      orgId: org.id,
      name: "David Kim",
      email: "david@coastalretreats.com",
      passwordHash,
      role: "CLEANER",
      phone: "+1-555-0104",
    },
  });

  const maintUser = await prisma.user.create({
    data: {
      orgId: org.id,
      name: "Carlos Rivera",
      email: "carlos@coastalretreats.com",
      passwordHash,
      role: "MAINTENANCE",
      phone: "+1-555-0105",
    },
  });

  console.log("✅ Created 5 users (owner, manager, 2 cleaners, 1 maintenance)");

  // ─── Properties ───────────────────────────────────────
  const property1 = await prisma.property.create({
    data: {
      orgId: org.id,
      name: "Ocean Breeze Apartments",
      address: "742 Beachfront Drive",
      city: "Miami Beach",
      state: "FL",
      zipCode: "33139",
      type: "APARTMENT",
      description: "Luxury beachfront apartments with stunning ocean views. Each unit features modern finishes, full kitchen, and private balcony.",
      amenities: JSON.stringify(["WiFi", "Pool", "Gym", "Parking", "Beach Access", "Air Conditioning"]),
      aiKnowledgeBase: `Property: Ocean Breeze Apartments
Location: 742 Beachfront Drive, Miami Beach, FL 33139
WiFi Network: OceanBreeze_Guest | Password: Surf2026!
Check-in: 3:00 PM | Check-out: 11:00 AM
Door Code: Last 4 digits of confirmation number + 99
Parking: Underground garage, one spot per unit. Access card in lockbox.
Pool Hours: 6 AM - 10 PM. No glass containers.
Nearby: South Beach (2 min walk), Lincoln Road Mall (5 min drive), Joe's Stone Crab (10 min walk)
Emergency Contact: Property Manager James at +1-555-0102
Rules: No smoking, no parties, quiet hours 10 PM - 8 AM.`,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      orgId: org.id,
      name: "Palm Villa Estate",
      address: "1580 Coconut Grove Blvd",
      city: "Fort Lauderdale",
      state: "FL",
      zipCode: "33301",
      type: "VILLA",
      description: "Spacious Mediterranean-style villa with private pool, tropical garden, and open-air entertainment area.",
      amenities: JSON.stringify(["WiFi", "Private Pool", "BBQ Grill", "Hot Tub", "Home Theater", "Chef Kitchen"]),
      aiKnowledgeBase: `Property: Palm Villa Estate
Location: 1580 Coconut Grove Blvd, Fort Lauderdale, FL 33301
WiFi Network: PalmVilla_5G | Password: Tropical2026!
Check-in: 4:00 PM | Check-out: 10:00 AM
Key Location: Smart lock, code sent 24h before check-in
Pool: Heated, available 24/7. Pool towels in cabana.
Hot Tub: Max temperature set to 104°F. Please shower before use.
BBQ: Propane grill on back patio. Replacement tank under kitchen sink.
Nearby: Las Olas Boulevard (8 min drive), Everglades Day Trip (30 min), Fort Lauderdale Beach (12 min)
Rules: Max 10 guests, no events without approval, no pets.`,
    },
  });

  const property3 = await prisma.property.create({
    data: {
      orgId: org.id,
      name: "Downtown Loft Collection",
      address: "225 Brickell Avenue",
      city: "Miami",
      state: "FL",
      zipCode: "33131",
      type: "CONDO",
      description: "Modern industrial-chic lofts in the heart of Brickell. Walking distance to restaurants, nightlife, and business district.",
      amenities: JSON.stringify(["WiFi", "Rooftop Pool", "Concierge", "Valet Parking", "Co-Working Space"]),
      aiKnowledgeBase: `Property: Downtown Loft Collection
Location: 225 Brickell Avenue, Miami, FL 33131
WiFi Network: BrickellLoft | Password: Urban2026!
Check-in: 3:00 PM | Check-out: 11:00 AM
Access: Front desk will provide key card. Photo ID required.
Parking: Valet only, $25/night. Drop off at main entrance.
Co-Working Space: 2nd floor, open 6 AM - midnight. Free for guests.
Rooftop: Pool + bar on 32nd floor. Towels provided. No reservation needed.
Nearby: Brickell City Centre (2 min walk), Wynwood Walls (15 min), Bayside Marketplace (10 min)
Transport: Free Metromover station across the street.`,
    },
  });

  console.log("✅ Created 3 properties");

  // ─── Units ────────────────────────────────────────────
  const units = [];

  // Ocean Breeze - 4 units
  for (let i = 1; i <= 4; i++) {
    const unit = await prisma.unit.create({
      data: {
        propertyId: property1.id,
        unitName: `Suite ${100 + i}`,
        maxGuests: i <= 2 ? 2 : 4,
        bedrooms: i <= 2 ? 1 : 2,
        bathrooms: i <= 2 ? 1 : 2,
        basePrice: i <= 2 ? 189 : 279,
        status: i === 1 ? "OCCUPIED" : i === 4 ? "CLEANING" : "AVAILABLE",
      },
    });
    units.push(unit);
  }

  // Palm Villa - 2 units
  for (let i = 1; i <= 2; i++) {
    const unit = await prisma.unit.create({
      data: {
        propertyId: property2.id,
        unitName: i === 1 ? "Main Villa" : "Guest House",
        maxGuests: i === 1 ? 8 : 4,
        bedrooms: i === 1 ? 4 : 2,
        bathrooms: i === 1 ? 3 : 1.5,
        basePrice: i === 1 ? 599 : 299,
        status: i === 1 ? "OCCUPIED" : "AVAILABLE",
      },
    });
    units.push(unit);
  }

  // Downtown Lofts - 3 units
  for (let i = 1; i <= 3; i++) {
    const unit = await prisma.unit.create({
      data: {
        propertyId: property3.id,
        unitName: `Loft ${2000 + i}`,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        basePrice: 159 + i * 20,
        status: i === 2 ? "MAINTENANCE" : "AVAILABLE",
      },
    });
    units.push(unit);
  }

  console.log("✅ Created 9 units across 3 properties");

  // ─── Guests ───────────────────────────────────────────
  const guests = [];
  const guestData = [
    { name: "Emily Johnson", email: "emily.j@gmail.com", phone: "+1-555-1001", totalStays: 3, avgRating: 4.8 },
    { name: "Michael Chen", email: "mchen@outlook.com", phone: "+1-555-1002", totalStays: 1, avgRating: 5.0 },
    { name: "Sofia Petrov", email: "sofia.p@yahoo.com", phone: "+1-555-1003", totalStays: 5, avgRating: 4.5 },
    { name: "William Turner", email: "wturner@gmail.com", phone: "+1-555-1004", totalStays: 2, avgRating: 4.9 },
    { name: "Aisha Mohammed", email: "aisha.m@gmail.com", phone: "+1-555-1005", totalStays: 1, avgRating: null },
    { name: "Robert Nakamura", email: "rnakamura@pm.me", phone: "+1-555-1006", totalStays: 4, avgRating: 4.7 },
    { name: "Lisa Fernandez", email: "lisa.fern@gmail.com", phone: "+1-555-1007", totalStays: 2, avgRating: 4.6 },
    { name: "Henrik Svensson", email: "henrik.s@proton.me", phone: "+46-555-1008", totalStays: 1, avgRating: 5.0 },
  ];

  for (const g of guestData) {
    const guest = await prisma.guest.create({ data: g });
    guests.push(guest);
  }

  console.log("✅ Created 8 guests");

  // ─── Reservations ─────────────────────────────────────
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  const reservations = [];

  // Current stay (checked in) - Suite 101
  reservations.push(
    await prisma.reservation.create({
      data: {
        unitId: units[0].id, // Suite 101
        guestId: guests[0].id, // Emily Johnson
        checkIn: addDays(today, -2),
        checkOut: addDays(today, 3),
        totalPrice: 945,
        status: "CHECKED_IN",
        platform: "AIRBNB",
        guestCount: 2,
      },
    })
  );

  // Upcoming reservation - Suite 102
  reservations.push(
    await prisma.reservation.create({
      data: {
        unitId: units[1].id, // Suite 102
        guestId: guests[1].id, // Michael Chen
        checkIn: addDays(today, 1),
        checkOut: addDays(today, 5),
        totalPrice: 756,
        status: "CONFIRMED",
        platform: "VRBO",
        guestCount: 2,
      },
    })
  );

  // Current stay - Main Villa
  reservations.push(
    await prisma.reservation.create({
      data: {
        unitId: units[4].id, // Main Villa
        guestId: guests[2].id, // Sofia Petrov
        checkIn: addDays(today, -3),
        checkOut: addDays(today, 4),
        totalPrice: 4193,
        status: "CHECKED_IN",
        platform: "DIRECT",
        guestCount: 6,
      },
    })
  );

  // Yesterday's checkout - Suite 103
  reservations.push(
    await prisma.reservation.create({
      data: {
        unitId: units[2].id, // Suite 103
        guestId: guests[3].id, // William Turner
        checkIn: addDays(today, -5),
        checkOut: addDays(today, -1),
        totalPrice: 1116,
        status: "CHECKED_OUT",
        platform: "AIRBNB",
        guestCount: 3,
      },
    })
  );

  // Today's checkout - Suite 104
  reservations.push(
    await prisma.reservation.create({
      data: {
        unitId: units[3].id, // Suite 104
        guestId: guests[4].id, // Aisha Mohammed
        checkIn: addDays(today, -3),
        checkOut: today,
        totalPrice: 837,
        status: "CHECKED_OUT",
        platform: "BOOKING_COM",
        guestCount: 2,
      },
    })
  );

  // Future reservation - Loft 2001
  reservations.push(
    await prisma.reservation.create({
      data: {
        unitId: units[6].id, // Loft 2001
        guestId: guests[5].id, // Robert Nakamura
        checkIn: addDays(today, 5),
        checkOut: addDays(today, 9),
        totalPrice: 716,
        status: "CONFIRMED",
        platform: "AIRBNB",
        guestCount: 1,
      },
    })
  );

  // Past completed - Guest House
  reservations.push(
    await prisma.reservation.create({
      data: {
        unitId: units[5].id, // Guest House
        guestId: guests[6].id, // Lisa Fernandez
        checkIn: addDays(today, -10),
        checkOut: addDays(today, -6),
        totalPrice: 1196,
        status: "CHECKED_OUT",
        platform: "VRBO",
        guestCount: 3,
      },
    })
  );

  // Future - Loft 2003
  reservations.push(
    await prisma.reservation.create({
      data: {
        unitId: units[8].id, // Loft 2003
        guestId: guests[7].id, // Henrik Svensson
        checkIn: addDays(today, 7),
        checkOut: addDays(today, 14),
        totalPrice: 1393,
        status: "CONFIRMED",
        platform: "DIRECT",
        guestCount: 2,
      },
    })
  );

  console.log("✅ Created 8 reservations");

  // ─── Cleaning Tasks ───────────────────────────────────
  // Task for yesterday's checkout (completed)
  await prisma.cleaningTask.create({
    data: {
      reservationId: reservations[3].id,
      assignedToId: cleaner1.id,
      status: "COMPLETED",
      priority: "NORMAL",
      dueBy: addDays(today, -1),
      completedAt: addDays(today, -1),
      checklist: JSON.stringify([
        { task: "Strip beds and replace linens", done: true },
        { task: "Clean bathrooms", done: true },
        { task: "Vacuum and mop floors", done: true },
        { task: "Restock toiletries", done: true },
        { task: "Wipe kitchen surfaces", done: true },
      ]),
    },
  });

  // Task for today's checkout (in progress)
  await prisma.cleaningTask.create({
    data: {
      reservationId: reservations[4].id,
      assignedToId: cleaner2.id,
      status: "IN_PROGRESS",
      priority: "URGENT",
      dueBy: today,
      checklist: JSON.stringify([
        { task: "Strip beds and replace linens", done: true },
        { task: "Clean bathrooms", done: false },
        { task: "Vacuum and mop floors", done: false },
        { task: "Restock toiletries", done: false },
        { task: "Wipe kitchen surfaces", done: false },
      ]),
    },
  });

  // Upcoming cleaning for Emily's checkout
  await prisma.cleaningTask.create({
    data: {
      reservationId: reservations[0].id,
      assignedToId: cleaner1.id,
      status: "PENDING",
      priority: "NORMAL",
      dueBy: addDays(today, 3),
      checklist: JSON.stringify([
        { task: "Strip beds and replace linens", done: false },
        { task: "Clean bathrooms", done: false },
        { task: "Vacuum and mop floors", done: false },
        { task: "Restock toiletries", done: false },
        { task: "Wipe kitchen surfaces", done: false },
      ]),
    },
  });

  // Completed cleaning for past checkout
  await prisma.cleaningTask.create({
    data: {
      reservationId: reservations[6].id,
      assignedToId: cleaner1.id,
      status: "INSPECTED",
      priority: "NORMAL",
      dueBy: addDays(today, -6),
      completedAt: addDays(today, -6),
      checklist: JSON.stringify([
        { task: "Deep clean all rooms", done: true },
        { task: "Replace all linens and towels", done: true },
        { task: "Clean pool area", done: true },
        { task: "Restock amenities", done: true },
      ]),
    },
  });

  console.log("✅ Created 4 cleaning tasks");

  // ─── Maintenance Issues ───────────────────────────────
  await prisma.maintenanceIssue.create({
    data: {
      unitId: units[7].id, // Loft 2002 (in maintenance)
      reportedById: manager.id,
      assignedToId: maintUser.id,
      title: "HVAC unit making loud noise",
      description: "The air conditioning unit in Loft 2002 started making a grinding noise. Previous guest reported it was intermittent. Needs HVAC tech inspection.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      category: "HVAC",
      cost: 350,
    },
  });

  await prisma.maintenanceIssue.create({
    data: {
      unitId: units[0].id, // Suite 101
      reportedById: owner.id,
      title: "Bathroom faucet dripping",
      description: "Master bathroom sink faucet has a slow drip. Not urgent but should be fixed before it gets worse.",
      priority: "LOW",
      status: "REPORTED",
      category: "Plumbing",
    },
  });

  await prisma.maintenanceIssue.create({
    data: {
      unitId: units[4].id, // Main Villa
      reportedById: manager.id,
      assignedToId: maintUser.id,
      title: "Pool pump pressure dropping",
      description: "Pool pump is losing pressure faster than normal. Filter may need replacement.",
      priority: "MEDIUM",
      status: "ASSIGNED",
      category: "Pool",
      cost: 200,
    },
  });

  await prisma.maintenanceIssue.create({
    data: {
      unitId: units[2].id, // Suite 103
      reportedById: manager.id,
      assignedToId: maintUser.id,
      title: "Smart lock battery replacement",
      description: "Smart lock on Suite 103 showing low battery warning. Needs CR123A batteries.",
      priority: "MEDIUM",
      status: "RESOLVED",
      category: "Security",
      cost: 15,
      resolvedAt: addDays(today, -2),
    },
  });

  console.log("✅ Created 4 maintenance issues");

  // ─── Revenue Entries ──────────────────────────────────
  const revenueData = [
    { resIdx: 3, gross: 1116, platformFee: 33.48, cleaningFee: 75, daysAgo: -1 },
    { resIdx: 4, gross: 837, platformFee: 25.11, cleaningFee: 75, daysAgo: 0 },
    { resIdx: 6, gross: 1196, platformFee: 35.88, cleaningFee: 100, daysAgo: -6 },
  ];

  for (const r of revenueData) {
    await prisma.revenueEntry.create({
      data: {
        reservationId: reservations[r.resIdx].id,
        grossAmount: r.gross,
        platformFee: r.platformFee,
        cleaningFee: r.cleaningFee,
        netAmount: r.gross - r.platformFee - r.cleaningFee,
        entryDate: addDays(today, r.daysAgo),
      },
    });
  }

  // Historical revenue for charts (past 6 months)
  const historicalMonths = [
    { monthsAgo: 5, gross: 18500, platformFee: 555, cleaningFee: 1200 },
    { monthsAgo: 4, gross: 22300, platformFee: 669, cleaningFee: 1400 },
    { monthsAgo: 3, gross: 19800, platformFee: 594, cleaningFee: 1300 },
    { monthsAgo: 2, gross: 28400, platformFee: 852, cleaningFee: 1600 },
    { monthsAgo: 1, gross: 31200, platformFee: 936, cleaningFee: 1800 },
    { monthsAgo: 0, gross: 24850, platformFee: 745.50, cleaningFee: 1500 },
  ];

  // We'll create these as entries tied to the first reservation for simplicity
  for (const h of historicalMonths) {
    const monthDate = new Date(today);
    monthDate.setMonth(monthDate.getMonth() - h.monthsAgo);
    monthDate.setDate(15); // mid-month

    await prisma.revenueEntry.create({
      data: {
        reservationId: reservations[0].id,
        grossAmount: h.gross,
        platformFee: h.platformFee,
        cleaningFee: h.cleaningFee,
        netAmount: h.gross - h.platformFee - h.cleaningFee,
        entryDate: monthDate,
      },
    });
  }

  console.log("✅ Created revenue entries (current + 6 months historical)");

  // ─── Expenses ─────────────────────────────────────────
  const expenseData = [
    { propIdx: 0, category: "Utilities", amount: 450, daysAgo: -15, desc: "Electric bill - September" },
    { propIdx: 0, category: "Supplies", amount: 230, daysAgo: -10, desc: "Toiletries and cleaning supplies restock" },
    { propIdx: 0, category: "Insurance", amount: 1200, daysAgo: -30, desc: "Quarterly property insurance" },
    { propIdx: 1, category: "Landscaping", amount: 350, daysAgo: -7, desc: "Monthly garden maintenance" },
    { propIdx: 1, category: "Pool", amount: 200, daysAgo: -14, desc: "Pool chemical treatment and cleaning" },
    { propIdx: 2, category: "HOA", amount: 850, daysAgo: -5, desc: "Monthly HOA fees for all units" },
    { propIdx: 2, category: "Utilities", amount: 320, daysAgo: -12, desc: "Internet and cable service" },
  ];

  const properties = [property1, property2, property3];
  for (const e of expenseData) {
    await prisma.expense.create({
      data: {
        propertyId: properties[e.propIdx].id,
        category: e.category,
        amount: e.amount,
        expenseDate: addDays(today, e.daysAgo),
        description: e.desc,
      },
    });
  }

  console.log("✅ Created 7 expenses");

  // ─── Guest Messages ───────────────────────────────────
  // Emily Johnson conversation
  await prisma.guestMessage.create({
    data: {
      reservationId: reservations[0].id,
      sender: "guest",
      message: "Hi! What's the WiFi password? And what time is checkout?",
      isAiGenerated: false,
      createdAt: addDays(today, -1),
    },
  });

  await prisma.guestMessage.create({
    data: {
      reservationId: reservations[0].id,
      sender: "ai",
      message: "Hi Emily! 👋 Welcome to Ocean Breeze Apartments!\n\n📶 WiFi: OceanBreeze_Guest\n🔑 Password: Surf2026!\n\n🕐 Checkout is at 11:00 AM. Just leave the key card on the kitchen counter.\n\nLet me know if you need anything else!",
      isAiGenerated: true,
      createdAt: addDays(today, -1),
    },
  });

  await prisma.guestMessage.create({
    data: {
      reservationId: reservations[0].id,
      sender: "guest",
      message: "Thanks! Can you recommend a good restaurant nearby?",
      isAiGenerated: false,
    },
  });

  await prisma.guestMessage.create({
    data: {
      reservationId: reservations[0].id,
      sender: "ai",
      message: "Great question! Here are some favorites near you:\n\n🦀 **Joe's Stone Crab** - 10 min walk, legendary seafood\n🌮 **Juvia** - Rooftop restaurant on Lincoln Road, amazing views\n🍕 **Lucali** - Best pizza in Miami Beach\n🥗 **Pura Vida** - Healthy bowls and smoothies, 5 min walk\n\nAll are within easy reach! Would you like directions to any of these?",
      isAiGenerated: true,
    },
  });

  console.log("✅ Created guest message conversations");

  console.log("\n🎉 Seed complete! Database is ready.\n");
  console.log("📊 Summary:");
  console.log("   • 1 Organization");
  console.log("   • 5 Users (Owner, Manager, 2 Cleaners, 1 Maintenance)");
  console.log("   • 3 Properties with 9 Units");
  console.log("   • 8 Guests, 8 Reservations");
  console.log("   • 4 Cleaning Tasks, 4 Maintenance Issues");
  console.log("   • Revenue Entries + 6-month history");
  console.log("   • 7 Expenses, Guest Message conversations");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
