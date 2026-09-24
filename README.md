# AURA STR Enterprise Management System

> **Institutional Short-Term Rental Operations, Multi-Unit Portfolio Telemetry, & Automated Turnover Logistics**

A modern B2B SaaS operating system designed for short-term rental (STR) operators, boutique vacation rental managers, and multi-unit hospitality portfolios. Built with **Next.js 16 (Turbopack)**, **React 19**, an executive **Burgundy & Optical White Design System**, and an **Event-Driven Persistence Engine**.

---

## ⚡ Overview & Key Capabilities

AURA STR eliminates multi-channel fragmentation, turnover window delays, and operational friction with an unpolluted zero-state architecture primed for live property data:

* **Operations Command Center**: Real-time KPI telemetry (arrivals, departures, portfolio occupancy rate, realized MTD net cash flow, segmented timeframes: `Today`, `MTD`, `QTD`, `YTD`).
* **Portfolio & Unit Configurator**: Hierarchical asset management (Apartments, Single-Family Villas, Condominiums, Studios), multi-unit room configurations, base nightly tariffs, and bed/bath tracking.
* **Reservation & Folio Registry**: Multi-channel booking synchronization (Airbnb, VRBO, Booking.com, Direct Channel), date overlap protection, stay window calculations, and lifecycle triggers (`Process Check-In`, `Execute Checkout`, `Void`).
* **Housekeeping Logistics Queue**: Automated turnover task generation upon departure, SLA deadline tracking, cleaning status progression (`Pending` &rarr; `In Progress` &rarr; `Inspected`), and automatic unit availability restoration.
* **Guest CRM Directory**: Guest profiles, historical booking frequency indexing, and communication records.
* **Facilities & Maintenance Work Orders**: Work order ticketing with trade classification (HVAC, Plumbing, Electrical), severity weighting (Low, Med, High, Critical), cost estimates, and remediation sign-off.
* **Financial Yield & P&L Engine**: Gross contract valuation, automatic OTA take-rate deductions (Airbnb 3%, VRBO 5%), operational expense voucher posting, and true Net Operating Margin realization.
* **AI Automated Concierge**: Domain-aware natural language assistant with policy grounding (WiFi SSIDs, passphrases, check-in windows, quiet hours, emergency lines).

---

## 🎨 Design Philosophy: Executive Enterprise Aesthetic

Built specifically to replace amateurish "demo" dashboards with a high-growth institutional design:

* **No Raw Emojis**: 100% custom SVG vector line icons (`1.75px` stroke) housed within geometric tinted enclosures.
* **Executive Burgundy & Optical White**: Luxury hospitality palette (`#701A2F` Burgundy primary, `#5C1425` dark accent, `#FFFFFF` crisp optical white surfaces, `#F8F9FA` neutral background, and `#E5E7EB` crisp architectural border lines).
* **Enterprise Typography**: Powered by **Plus Jakarta Sans** with negative tracking (`-0.025em`) on metrics, uppercase subheader micro-labels (`11px`, `0.05em` letter-spacing), and tabular numeric lining (`tabular-nums`) for multi-column alignment.
* **Segmented Control Pills & Toggles**: macOS / Linear-style pill controls with record count badges and physical system switches.

---

## 🏗️ Technology Architecture

```
str-dashboard/
├── prisma/
│   ├── schema.prisma           # 11-entity relational schema (Organizations, Properties, Units, Bookings, Turnovers)
│   └── seed.js                 # Relational database seed script
├── src/
│   ├── app/
│   │   ├── api/                # REST endpoints (dashboard, properties, reservations, cleaning, maintenance, revenue, chat)
│   │   ├── properties/         # Portfolio asset configurator
│   │   ├── reservations/       # Folio & booking registry with segmented filters
│   │   ├── cleaning/           # Housekeeping operations & turnover queue
│   │   ├── guests/             # Guest CRM directory with instant search
│   │   ├── maintenance/        # Facilities work order management
│   │   ├── revenue/            # Financial yield & P&L ledger
│   │   ├── ai-assistant/       # AI concierge simulator & policy publisher
│   │   ├── globals.css         # Enterprise design tokens, typography, and controls
│   │   ├── layout.js           # Shell layout with 256px enterprise sidebar
│   │   └── page.js             # Operations Command Center
│   ├── components/
│   │   ├── Sidebar.js          # Enterprise navigation drawer with brand mark
│   │   ├── icons.js            # Uniform SVG vector line-icon library
│   │   └── dashboard/          # StatCards, Calendar, Queue, RevenueChart, AiAssistant, Activity, Modal
│   └── lib/
│       ├── dataStore.js        # Persistent transactional disk storage engine
│       └── prisma.js           # Prisma ORM client instance
├── data/
│   └── store.json              # Transactional store (zero synthetic data)
└── STR_Enterprise_Platform_Architecture_and_Verification_Guide.docx
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.18+ or v20+
* **npm** or **pnpm** / **yarn**

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/monosrabon/str-dashboard.git
cd str-dashboard
npm install
```

### 2. Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env
```

### 3. Launch Development Server
```bash
npm run dev
```
Navigate to **[http://localhost:3000](http://localhost:3000)** (or the port indicated in terminal) in your browser.

---

## 📋 Comprehensive Documentation

For the full architectural breakdown, domain concepts, file manifest, verification sequence, and 14-point QA test matrix, refer to:
* **[`STR_Enterprise_Platform_Architecture_and_Verification_Guide.docx`](./STR_Enterprise_Platform_Architecture_and_Verification_Guide.docx)**

---

## 📄 License
MIT License. Built for enterprise commercial and portfolio deployment.
