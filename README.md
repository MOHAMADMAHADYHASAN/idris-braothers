# Idris Brothers - Grocery Point of Sale (POS) Backend

A production-grade, decoupled Point of Sale (POS) backend built for local grocery stores, designed with high financial accuracy, transaction atomicity, and modular architecture.

## 🛠 Tech Stack
- **Runtime:** Node.js (v20+)
- **Language:** TypeScript
- **Framework:** Express.js (v5)
- **Database:** PostgreSQL
- **ORM:** Prisma ORM
- **Validation:** Zod
- **Security:** Helmet, Cors, Morgan

---

## 🚀 Key Features

### 1. Inventory & Barcode Management
- Real-time stock tracking with flexible units (`PCS`, `KG`, `GRAM`, `LITER`, `PACKET`).
- Ultra-fast Barcode scanner lookup for quick cashier billing.
- Low-stock alerts and soft-delete protection for historical sales integrity.

### 2. Daily Sales & Invoicing (Atomic Checkout Engine)
- Secure, race-condition-free checkout using **Prisma `$transaction`**.
- Simultaneously:
  - Validates and decrements product inventory.
  - Takes immutable unit price & cost price snapshots.
  - Generates unique invoice numbers (e.g., `#INV-261104-XXXX`).
  - Automatically attributes remaining dues to the customer ledger.

### 3. Customer Ledger (Baki Khata)
- Track regular customer details and running due amounts (`currentDue`).
- Automated double-entry audit trail (`CustomerLedger`) logging every credit (due sale) and debit (repayment).
- Partial repayment support: Instant due balance reduction on cash payments.

### 4. Supplier & Purchase Procurement (Mahajan Khata & Stock-In)
- Wholesale stock-in tracking from distributors and suppliers.
- Automatically increments product stock and updates latest wholesale cost prices.
- Tracks store debt/liabilities (`currentPayable`) with a complete `SupplierLedger`.
- Supplier payment recording to clear distributor dues.

---

## 📂 Project Structure

```text
idris-brothers/
├── prisma/
│   ├── schema.prisma                  # PostgreSQL database models & relations
│   └── migrations/                    # Versioned database migrations
├── src/
│   ├── config/                        # Prisma singleton & validated env vars
│   ├── common/
│   │   ├── errors/                    # AppError & Prisma/Zod Global Error Handler
│   │   ├── middlewares/               # Request validation middleware
│   │   └── utils/                     # Uniform API response & Async handler
│   ├── features/
│   │   ├── inventory/                 # Product CRUD, Barcode lookup, Stock adjustments
│   │   ├── sales/                     # Checkout, Invoice generator, Sales history
│   │   ├── customers/                 # Customer directory & Baki repayments
│   │   ├── suppliers/                 # Supplier profiles & Debt settlements
│   │   └── purchases/                 # Procurement chalans & Stock-in engine
│   ├── app.ts                         # Express application setup
│   └── server.ts                      # Server entry point with graceful shutdown
├── scripts/
│   ├── seed.ts                        # Realistic grocery data seeder
│   └── test-pos-flow.ts               # Automated 360° supply chain test runner
├── .env.example
├── tsconfig.json
└── package.json
```

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/MOHAMADMAHADYHASAN/idris-braothers.git
cd idris-braothers
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and set your PostgreSQL connection URL:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/idris_brothers_db?schema=public"
```

### 3. Migrate & Seed Database
```bash
npx prisma migrate dev
npm run seed
```

### 4. Run End-to-End Test Suite
```bash
npm run test:flow
```

### 5. Start Development Server
```bash
npm run dev
```

---

## 📡 API Endpoints Reference

### Inventory
- `POST /api/v1/inventory` - Create product
- `GET /api/v1/inventory` - List products (search, filter, pagination)
- `GET /api/v1/inventory/barcode/:barcode` - Cashier barcode scanner lookup
- `GET /api/v1/inventory/:id` - Product details
- `PATCH /api/v1/inventory/:id` - Update product
- `PATCH /api/v1/inventory/:id/stock` - Adjust stock (Stock-in / damage)
- `DELETE /api/v1/inventory/:id` - Soft delete

### Sales
- `POST /api/v1/sales/checkout` - Process sale & memo with atomic stock deduction
- `GET /api/v1/sales` - Sales history (filters: date, customer, status)
- `GET /api/v1/sales/:id` - Invoice details

### Customers (Baki Khata)
- `POST /api/v1/customers` - Add customer
- `GET /api/v1/customers` - Customer list (highest due first)
- `GET /api/v1/customers/:id` - Customer profile & ledger statement
- `POST /api/v1/customers/:id/payments` - Record due repayment

### Suppliers (Mahajan Khata)
- `POST /api/v1/suppliers` - Add supplier
- `GET /api/v1/suppliers` - Supplier list (highest debt first)
- `GET /api/v1/suppliers/:id` - Supplier profile & ledger statement
- `POST /api/v1/suppliers/:id/payments` - Pay money to supplier

### Purchases (Stock-In Procurement)
- `POST /api/v1/purchases` - Record wholesale purchase chalan & auto-increment stock
- `GET /api/v1/purchases` - Purchase history
- `GET /api/v1/purchases/:id` - Purchase chalan details
