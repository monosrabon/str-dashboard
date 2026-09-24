import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

const INITIAL_STORE = {
  properties: [],
  units: [],
  guests: [],
  reservations: [],
  cleaningTasks: [],
  maintenanceIssues: [],
  revenueEntries: [],
  expenses: [],
  messages: [],
};

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(INITIAL_STORE, null, 2), "utf-8");
  }
}

export async function readStore() {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading store, resetting:", err);
    return { ...INITIAL_STORE };
  }
}

export async function writeStore(data) {
  await ensureDataFile();
  const tempFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tempFile, DATA_FILE);
}

// ─── PROPERTIES & UNITS ───────────────────────────────────────
export async function getProperties() {
  const store = await readStore();
  return store.properties.map((p) => ({
    ...p,
    units: store.units.filter((u) => u.propertyId === p.id),
  }));
}

export async function createProperty(propData) {
  const store = await readStore();
  const id = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newProp = {
    id,
    name: propData.name,
    address: propData.address || "",
    city: propData.city || "",
    state: propData.state || "",
    zipCode: propData.zipCode || "",
    type: propData.type || "APARTMENT",
    description: propData.description || "",
    amenities: propData.amenities || [],
    aiKnowledgeBase: propData.aiKnowledgeBase || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.properties.push(newProp);

  // If initial units provided
  if (Array.isArray(propData.units) && propData.units.length > 0) {
    for (const u of propData.units) {
      store.units.push({
        id: `unit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        propertyId: id,
        unitName: u.unitName || "Unit 1",
        maxGuests: Number(u.maxGuests) || 2,
        bedrooms: Number(u.bedrooms) || 1,
        bathrooms: Number(u.bathrooms) || 1,
        basePrice: Number(u.basePrice) || 100,
        status: "AVAILABLE",
        createdAt: new Date().toISOString(),
      });
    }
  }

  await writeStore(store);
  return newProp;
}

export async function createUnit(unitData) {
  const store = await readStore();
  const newUnit = {
    id: `unit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    propertyId: unitData.propertyId,
    unitName: unitData.unitName,
    maxGuests: Number(unitData.maxGuests) || 2,
    bedrooms: Number(unitData.bedrooms) || 1,
    bathrooms: Number(unitData.bathrooms) || 1,
    basePrice: Number(unitData.basePrice) || 100,
    status: unitData.status || "AVAILABLE",
    createdAt: new Date().toISOString(),
  };

  store.units.push(newUnit);
  await writeStore(store);
  return newUnit;
}

// ─── GUESTS ───────────────────────────────────────────────────
export async function getGuests() {
  const store = await readStore();
  return store.guests.map((g) => ({
    ...g,
    reservations: store.reservations.filter((r) => r.guestId === g.id),
  }));
}

export async function findOrCreateGuest(guestData) {
  const store = await readStore();
  let guest = store.guests.find(
    (g) =>
      (guestData.email && g.email?.toLowerCase() === guestData.email.toLowerCase()) ||
      g.name.toLowerCase() === guestData.name.toLowerCase()
  );

  if (!guest) {
    guest = {
      id: `gst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: guestData.name,
      email: guestData.email || "",
      phone: guestData.phone || "",
      totalStays: 1,
      notes: guestData.notes || "",
      createdAt: new Date().toISOString(),
    };
    store.guests.push(guest);
  } else {
    guest.totalStays = (guest.totalStays || 0) + 1;
    if (guestData.phone && !guest.phone) guest.phone = guestData.phone;
    if (guestData.email && !guest.email) guest.email = guestData.email;
  }

  await writeStore(store);
  return guest;
}

// ─── RESERVATIONS ─────────────────────────────────────────────
export async function getReservations() {
  const store = await readStore();
  return store.reservations.map((r) => {
    const unit = store.units.find((u) => u.id === r.unitId);
    const property = unit ? store.properties.find((p) => p.id === unit.propertyId) : null;
    const guest = store.guests.find((g) => g.id === r.guestId);
    return {
      ...r,
      unitName: unit?.unitName || "Unit",
      propertyName: property?.name || "Property",
      guestName: guest?.name || "Guest",
      guestEmail: guest?.email || "",
      guestPhone: guest?.phone || "",
    };
  });
}

export async function createReservation(resData) {
  const store = await readStore();

  // Find or create guest within same store transaction
  let guest = store.guests.find(
    (g) =>
      (resData.guestEmail && g.email?.toLowerCase() === resData.guestEmail.toLowerCase()) ||
      g.name.toLowerCase() === resData.guestName.toLowerCase()
  );

  if (!guest) {
    guest = {
      id: `gst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: resData.guestName,
      email: resData.guestEmail || "",
      phone: resData.guestPhone || "",
      totalStays: 1,
      notes: resData.notes || "",
      createdAt: new Date().toISOString(),
    };
    store.guests.push(guest);
  } else {
    guest.totalStays = (guest.totalStays || 0) + 1;
    if (resData.guestPhone && !guest.phone) guest.phone = resData.guestPhone;
    if (resData.guestEmail && !guest.email) guest.email = resData.guestEmail;
  }

  const resId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const checkIn = new Date(resData.checkIn).toISOString();
  const checkOut = new Date(resData.checkOut).toISOString();
  const totalPrice = Number(resData.totalPrice) || 0;
  const platform = resData.platform || "DIRECT";

  const newRes = {
    id: resId,
    unitId: resData.unitId,
    guestId: guest.id,
    checkIn,
    checkOut,
    totalPrice,
    status: resData.status || "CONFIRMED",
    platform,
    guestCount: Number(resData.guestCount) || 1,
    notes: resData.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.reservations.push(newRes);

  // Automatically update unit status if checking in now
  const now = new Date();
  const cIn = new Date(checkIn);
  const cOut = new Date(checkOut);
  const isCurrentlyActive = now >= cIn && now < cOut;

  const unitIndex = store.units.findIndex((u) => u.id === resData.unitId);
  if (unitIndex !== -1 && isCurrentlyActive) {
    store.units[unitIndex].status = "OCCUPIED";
  }

  // Automatically schedule cleaning task for checkout
  const unit = store.units.find((u) => u.id === resData.unitId);
  const property = unit ? store.properties.find((p) => p.id === unit.propertyId) : null;
  const cleaningTaskId = `cln_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  store.cleaningTasks.push({
    id: cleaningTaskId,
    reservationId: resId,
    unitId: resData.unitId,
    unitName: unit?.unitName || "Unit",
    propertyName: property?.name || "Property",
    status: "PENDING",
    priority: "NORMAL",
    dueBy: checkOut,
    assignee: "Staff Cleaner",
    assigneeInitials: "SC",
    notes: `Post-stay cleaning for reservation ${resId}`,
    createdAt: new Date().toISOString(),
  });

  // Automatically record revenue entry
  const platformFee = platform === "AIRBNB" ? totalPrice * 0.03 : platform === "VRBO" ? totalPrice * 0.05 : 0;
  const cleaningFee = Math.min(totalPrice * 0.15, 80);
  const netAmount = totalPrice - platformFee;

  store.revenueEntries.push({
    id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    reservationId: resId,
    grossAmount: totalPrice,
    platformFee,
    cleaningFee,
    netAmount,
    entryDate: checkIn,
    createdAt: new Date().toISOString(),
  });

  await writeStore(store);
  return newRes;
}

export async function updateReservationStatus(id, newStatus) {
  const store = await readStore();
  const res = store.reservations.find((r) => r.id === id);
  if (!res) throw new Error("Reservation not found");

  res.status = newStatus;
  res.updatedAt = new Date().toISOString();

  // Update unit status according to reservation state
  const unit = store.units.find((u) => u.id === res.unitId);
  if (unit) {
    if (newStatus === "CHECKED_IN") {
      unit.status = "OCCUPIED";
    } else if (newStatus === "CHECKED_OUT") {
      unit.status = "CLEANING";
      // Update cleaning task to urgent if same day turnover
      const task = store.cleaningTasks.find((t) => t.reservationId === id);
      if (task) task.status = "PENDING";
    } else if (newStatus === "CANCELLED") {
      unit.status = "AVAILABLE";
    }
  }

  await writeStore(store);
  return res;
}

// ─── CLEANING ─────────────────────────────────────────────────
export async function getCleaningTasks() {
  const store = await readStore();
  return store.cleaningTasks;
}

export async function updateCleaningStatus(id, status) {
  const store = await readStore();
  const task = store.cleaningTasks.find((t) => t.id === id);
  if (!task) throw new Error("Task not found");

  task.status = status;
  if (status === "COMPLETED") {
    task.completedAt = new Date().toISOString();
    // Free up unit if it was in cleaning
    const unit = store.units.find((u) => u.id === task.unitId);
    if (unit && unit.status === "CLEANING") {
      unit.status = "AVAILABLE";
    }
  }

  await writeStore(store);
  return task;
}

// ─── MAINTENANCE ──────────────────────────────────────────────
export async function getMaintenanceIssues() {
  const store = await readStore();
  return store.maintenanceIssues.map((m) => {
    const unit = store.units.find((u) => u.id === m.unitId);
    const prop = unit ? store.properties.find((p) => p.id === unit.propertyId) : null;
    return {
      ...m,
      unitName: unit?.unitName || "Unit",
      propertyName: prop?.name || "Property",
    };
  });
}

export async function createMaintenanceIssue(issueData) {
  const store = await readStore();
  const unit = store.units.find((u) => u.id === issueData.unitId);
  const prop = unit ? store.properties.find((p) => p.id === unit.propertyId) : null;

  const newIssue = {
    id: `mnt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    unitId: issueData.unitId,
    unitName: unit?.unitName || "Unit",
    propertyName: prop?.name || "Property",
    title: issueData.title,
    description: issueData.description || "",
    priority: issueData.priority || "MEDIUM",
    status: "REPORTED",
    category: issueData.category || "General",
    cost: Number(issueData.cost) || 0,
    createdAt: new Date().toISOString(),
  };

  store.maintenanceIssues.push(newIssue);
  await writeStore(store);
  return newIssue;
}

export async function updateMaintenanceStatus(id, status) {
  const store = await readStore();
  const issue = store.maintenanceIssues.find((m) => m.id === id);
  if (!issue) throw new Error("Issue not found");

  issue.status = status;
  if (status === "RESOLVED") {
    issue.resolvedAt = new Date().toISOString();
  }

  await writeStore(store);
  return issue;
}

// ─── REVENUE & EXPENSES ───────────────────────────────────────
export async function getFinancials() {
  const store = await readStore();
  return {
    revenueEntries: store.revenueEntries,
    expenses: store.expenses,
  };
}

export async function createExpense(expData) {
  const store = await readStore();
  const newExp = {
    id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    propertyId: expData.propertyId || (store.properties[0]?.id || ""),
    category: expData.category || "Maintenance",
    amount: Number(expData.amount) || 0,
    expenseDate: expData.expenseDate || new Date().toISOString(),
    description: expData.description || "",
    createdAt: new Date().toISOString(),
  };

  store.expenses.push(newExp);
  await writeStore(store);
  return newExp;
}

// ─── AI ASSISTANT & MESSAGES ──────────────────────────────────
export async function getMessages() {
  const store = await readStore();
  return store.messages;
}

export async function postMessage({ sender, message, guestName, isAiGenerated = false }) {
  const store = await readStore();
  const newMsg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    sender: sender || "host",
    message,
    guestName: guestName || "Guest",
    isAiGenerated,
    createdAt: new Date().toISOString(),
  };

  store.messages.push(newMsg);
  await writeStore(store);
  return newMsg;
}

// ─── DASHBOARD AGGREGATE ──────────────────────────────────────
export async function getDashboardData() {
  const store = await readStore();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Today check-ins
  const todayCheckIns = store.reservations.filter((r) => {
    return (
      r.checkIn.startsWith(todayStr) &&
      (r.status === "CONFIRMED" || r.status === "CHECKED_IN")
    );
  }).length;

  // Today check-outs
  const todayCheckOuts = store.reservations.filter((r) => {
    return (
      r.checkOut.startsWith(todayStr) &&
      (r.status === "CHECKED_IN" || r.status === "CHECKED_OUT")
    );
  }).length;

  // Occupancy rate
  const totalUnits = store.units.length;
  const occupiedUnits = store.units.filter((u) => u.status === "OCCUPIED").length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // Monthly revenue
  const monthlyRevenue = store.revenueEntries
    .filter((r) => new Date(r.entryDate) >= startOfMonth)
    .reduce((sum, r) => sum + (r.netAmount || 0), 0);

  // Active cleaning tasks
  const cleaningTasks = store.cleaningTasks
    .filter((t) => ["PENDING", "ASSIGNED", "IN_PROGRESS"].includes(t.status))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      unit: t.unitName,
      property: t.propertyName,
      assignee: t.assignee || "Staff",
      assigneeInitials: t.assigneeInitials || "SC",
      status: t.status,
      priority: t.priority,
      dueBy: t.dueBy,
    }));

  // Open maintenance issues
  const maintenanceIssues = store.maintenanceIssues
    .filter((m) => m.status !== "RESOLVED")
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      title: m.title,
      unit: m.unitName,
      property: m.propertyName,
      priority: m.priority,
      status: m.status,
      createdAt: m.createdAt,
    }));

  // Past 6 months revenue history
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueHistory = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);

    const monthRev = store.revenueEntries
      .filter((r) => {
        const entryD = new Date(r.entryDate);
        return entryD >= d && entryD <= mEnd;
      })
      .reduce((s, r) => s + (r.grossAmount || 0), 0);

    const monthExp = store.expenses
      .filter((e) => {
        const expD = new Date(e.expenseDate);
        return expD >= d && expD <= mEnd;
      })
      .reduce((s, e) => s + (e.amount || 0), 0);

    revenueHistory.push({
      month: monthNames[d.getMonth()],
      revenue: monthRev,
      expenses: monthExp,
    });
  }

  // Recent reservations
  const recentReservations = store.reservations
    .slice()
    .reverse()
    .slice(0, 6)
    .map((r) => {
      const unit = store.units.find((u) => u.id === r.unitId);
      const prop = unit ? store.properties.find((p) => p.id === unit.propertyId) : null;
      const guest = store.guests.find((g) => g.id === r.guestId);
      return {
        id: r.id,
        guestName: guest?.name || "Guest",
        unit: unit?.unitName || "Unit",
        property: prop?.name || "Property",
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        status: r.status,
        platform: r.platform,
        totalPrice: r.totalPrice,
      };
    });

  return {
    stats: {
      todayCheckIns,
      todayCheckOuts,
      occupancyRate,
      monthlyRevenue,
    },
    cleaningTasks,
    maintenanceIssues,
    revenueHistory,
    recentMessages: store.messages.slice(-10),
    recentReservations,
    unitCount: store.units.length,
    propertyCount: store.properties.length,
  };
}
