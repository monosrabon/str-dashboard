// ═══════════════════════════════════════════════════════════════
// AURA STR ENTERPRISE — ROLE-BASED ACCESS CONTROL (RBAC) ENGINE
// ═══════════════════════════════════════════════════════════════

export const ROLES = {
  OWNER: "OWNER",
  MANAGER: "MANAGER",
  CLEANER: "CLEANER",
  MAINTENANCE: "MAINTENANCE",
};

export const PERMISSIONS = {
  // Navigation & Page Access
  VIEW_DASHBOARD: "view:dashboard",
  VIEW_PROPERTIES: "view:properties",
  MANAGE_PROPERTIES: "manage:properties",
  VIEW_RESERVATIONS: "view:reservations",
  MANAGE_RESERVATIONS: "manage:reservations",
  VIEW_CLEANING: "view:cleaning",
  MANAGE_CLEANING: "manage:cleaning",
  VIEW_GUESTS: "view:guests",
  VIEW_MAINTENANCE: "view:maintenance",
  MANAGE_MAINTENANCE: "manage:maintenance",
  VIEW_REVENUE: "view:revenue",
  MANAGE_REVENUE: "manage:revenue",
  VIEW_AI_CONCIERGE: "view:ai_concierge",
  MANAGE_AI_CONCIERGE: "manage:ai_concierge",
  EXPORT_AUDIT: "export:audit",
};

// Role-Permission Matrix
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROPERTIES,
    PERMISSIONS.MANAGE_PROPERTIES,
    PERMISSIONS.VIEW_RESERVATIONS,
    PERMISSIONS.MANAGE_RESERVATIONS,
    PERMISSIONS.VIEW_CLEANING,
    PERMISSIONS.MANAGE_CLEANING,
    PERMISSIONS.VIEW_GUESTS,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.MANAGE_MAINTENANCE,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.MANAGE_REVENUE,
    PERMISSIONS.VIEW_AI_CONCIERGE,
    PERMISSIONS.MANAGE_AI_CONCIERGE,
    PERMISSIONS.EXPORT_AUDIT,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROPERTIES,
    PERMISSIONS.MANAGE_PROPERTIES,
    PERMISSIONS.VIEW_RESERVATIONS,
    PERMISSIONS.MANAGE_RESERVATIONS,
    PERMISSIONS.VIEW_CLEANING,
    PERMISSIONS.MANAGE_CLEANING,
    PERMISSIONS.VIEW_GUESTS,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.MANAGE_MAINTENANCE,
    PERMISSIONS.VIEW_AI_CONCIERGE,
    PERMISSIONS.MANAGE_AI_CONCIERGE,
    PERMISSIONS.EXPORT_AUDIT,
    // Note: VIEW_REVENUE and MANAGE_REVENUE are restricted from Manager!
  ],

  [ROLES.CLEANER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CLEANING,
    PERMISSIONS.MANAGE_CLEANING,
  ],

  [ROLES.MAINTENANCE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.MANAGE_MAINTENANCE,
  ],
};

// Route Security Policy
export const ROUTE_POLICIES = {
  "/": PERMISSIONS.VIEW_DASHBOARD,
  "/properties": PERMISSIONS.VIEW_PROPERTIES,
  "/reservations": PERMISSIONS.VIEW_RESERVATIONS,
  "/cleaning": PERMISSIONS.VIEW_CLEANING,
  "/guests": PERMISSIONS.VIEW_GUESTS,
  "/maintenance": PERMISSIONS.VIEW_MAINTENANCE,
  "/revenue": PERMISSIONS.VIEW_REVENUE,
  "/ai-assistant": PERMISSIONS.VIEW_AI_CONCIERGE,
};

// Pre-configured Personas for Enterprise Training & Simulation
export const ENTERPRISE_PERSONAS = [
  {
    id: "usr_owner_01",
    name: "Sarah Mitchell",
    role: ROLES.OWNER,
    title: "Portfolio Executive & Owner",
    department: "Executive Suite",
    initials: "SM",
    badge: "Full Governance",
    badgeColor: "badge-maroon",
    description: "Complete unrestricted governance across portfolio assets, financial yields, bookings, and system configurations.",
  },
  {
    id: "usr_mgr_02",
    name: "James Rodriguez",
    role: ROLES.MANAGER,
    title: "Operations Director",
    department: "Field Operations",
    initials: "JR",
    badge: "Operations Level",
    badgeColor: "badge-blue",
    description: "Full operational authority over units, guest bookings, maintenance, and concierge dispatch. Confidential financial statements are restricted.",
  },
  {
    id: "usr_cln_03",
    name: "Maria Santos",
    role: ROLES.CLEANER,
    title: "Housekeeping Lead",
    department: "Turnover Logistics",
    initials: "MS",
    badge: "Housekeeping Staff",
    badgeColor: "badge-green",
    description: "Staff view focused solely on room sanitization, turnover checklists, and room readiness sign-off.",
  },
  {
    id: "usr_maint_04",
    name: "Carlos Rivera",
    role: ROLES.MAINTENANCE,
    title: "Facilities Specialist",
    department: "Physical Plant & HVAC",
    initials: "CR",
    badge: "Facilities Contractor",
    badgeColor: "badge-amber",
    description: "Specialized field access to work orders, repair requests, and trade remediation. Excludes guest and financial data.",
  },
];

export function hasPermission(role, permission) {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function canAccessRoute(role, pathname) {
  const requiredPermission = ROUTE_POLICIES[pathname];
  if (!requiredPermission) return true; // Public or unmapped
  return hasPermission(role, requiredPermission);
}
