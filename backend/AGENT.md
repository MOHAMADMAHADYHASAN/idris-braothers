# AGENT.md — Backend Architecture & Frontend Sync Specification
**Project:** Idris Brothers Inventory, POS & Khata Management System  
**Location:** Morichpotti, Feni Bazar, Feni, Bangladesh  
**Stack:** Node.js, Express, TypeScript, PostgreSQL, Prisma ORM  
**Version:** 1.0.0 (Production-Ready Backend)

> **🔴 MANDATORY AGENT DIRECTIVE — AUTOMATIC AGENT.MD LOGGING:**
> **যেকোনো নতুন পরিবর্তন, ফিচার যোগ, রিফ্যাক্টরিং বা আর্কিটেকচারাল সিদ্ধান্ত বাস্তবায়নের সাথে সাথেই `AGENT.md`-তে তাৎক্ষণিকভাবে নোট (record) করতে হবে। কোনো কোড পরিবর্তন ডকুমেন্টেশন ছাড়া অসম্পূর্ণ হিসেবে গণ্য হবে।**

---

## 1. Domain Context & Business Rules (বাস্তব ব্যবসার নিয়ম)

This backend is strictly tailored to the traditional grocery and spice market operations of Feni Bazar. Every agent working on either the **Backend** or **Frontend** must adhere to these non-negotiable business rules:

1. **Dual Sales Modes:**
   - Every product supports both **Retail (খুচরা)** and **Wholesale (পাইকারি)** pricing.
   - Customers and sales invoices can be either `RETAIL` or `WHOLESALE`.
2. **Product -> ProductVariant (SKU) -> VariantUnit Architecture (Retail Industry Standard):**
   - **Parent Product:** Common info (`name`, `banglaName`, `categoryId`, `brandId`, `hasVariants: Boolean`).
   - **ProductVariant (Sellable SKU):** Holds actual stock, barcode, sku, replacement purchase cost, retail/wholesale prices, dynamic `baseUnitName` from `UnitMaster`, `allowDecimalQty: Boolean`, and flexible `attributes: Json?` (JSONB).
   - **All transaction items (`SaleItem`, `PurchaseItem`, `StockWastage`) must link to `variantId` (never `productId`).**
   - **Decimal / Weighable Protection (`allowDecimalQty`):**
     - `true` for loose/weighable commodities (চাল, ডাল, খোলা মসলা): Allows decimal quantities (`0.250 KG`) and Reverse Price-to-Weight calculation (e.g. ২০ টাকার এলাচ).
     - `false` for sealed packets and bottles (১ কেজি দুধের প্যাকেট, তেলের বোতল, সাবান): Strictly rejects fractional billing (prevents staff selling 1.5 packets of milk).
   - **Single-Screen Simple Product UX:** For standard single items (খোলা চিনি বা শুকনা মরিচ), backend auto-creates 1 parent `Product` + 1 default `ProductVariant` (`variantName: 'Default'`) in one atomic transaction.
3. **100% Dynamic Units (No Rigid Enums):**
   - No hardcoded unit enums. All base units (`baseUnitName: String`) and sub-units (`VariantUnit` table) are dynamic and managed through the `UnitMaster` system.
   - Sacks (বস্তা), Cartons (কার্টন), Palla (পাল্লা), Packets (প্যাকেট), Litres (লিটার), and Tins (টিন) use dynamic `conversionFactor`.
4. **4-Decimal Precision (`Decimal(12, 4)`):**
   - Quantities, weights, and conversion factors are stored as 4-decimal numbers to prevent financial leakage on high-value micro-spices (Cardamom/এলাচ, Vietnam Cinnamon/দারুচিনি, Cloves/লবঙ্গ).
5. **Reverse Price-to-Weight Calculation (টাকার অংকে বিক্রি):**
   - When a retail customer requests a monetary value (e.g., "২০ টাকার এলাচ"), the POS accepts `customTotalPrice: 20` without quantity. The backend automatically back-calculates the weight to 4 decimal places: `baseQuantity = customTotalPrice / unitPrice`.
6. **Dynamic Replacement Cost Valuation (NO FIFO/LIFO):**
   - When a new purchase shipment arrives at a new rate, **all existing stock** of that variant is immediately revalued at the new replacement purchase cost.
   - For historical invoice accuracy, `SaleItem` and `StockWastage` capture an immutable `costPriceSnapshot`.
7. **Strictly Cash & Due Running Khata (নগদ ও বাকির খাতা):**
   - 100% physical cash-based store. No digital wallets (bKash/cards) are tracked.
   - Customers maintain a running balance (`currentDue`). Transactions atomically write immutable ledger rows (`CustomerLedger`) with `debit`, `credit`, and `balanceAfter`.
   - Suppliers/Mahajans maintain a running payable balance (`currentPayable`) with atomic `SupplierLedger` records.
8. **Daily Cashbox Closing:**
   - Cash drawer reconciliation: `Net Cash in Hand = Total Cash In (Sales + Due Collections) - Total Cash Out (Supplier Payments + Expenses)`.

---

## 2. Backend 4-Tier Architecture

The backend follows a strict Clean 4-Tier Layered Architecture:

```
Request ──► Routes ──► Controllers ──► Services ──► Repositories (BaseRepository) ──► PostgreSQL (Prisma)
              │              │             │                     │
              ▼              ▼             ▼                     ▼
          Zod Schema     HTTP Status    Business Logic      Atomic Transactions
          Validation     Formatting    & Decimal Math      (prisma.$transaction)
```

- **Routes (`src/features/*/routes.ts`):** Mount endpoints and apply validation middlewares.
- **Controllers (`src/features/*/controller.ts`):** Extract typed inputs (`req.body`, `req.params`, `req.query`), call services, and return unified JSON responses.
- **Services (`src/features/*/service.ts`):** Pure business logic, decimal calculations, and transaction orchestration (`prisma.$transaction`).
- **Repositories (`src/features/*/repository.ts`):** Data access layer extending `BaseRepository`. Accepts optional `tx` to support both standalone queries and atomic multi-step transactions.
- **Common Utilities (`src/common/utils/`):**
  - `pagination.ts`: Standard `getPagination` & `buildPaginationMeta`.
  - `dateUtils.ts`: Precise day start/end boundaries (`00:00:00.000` to `23:59:59.999`).
  - `codeGenerator.ts`: Daily date-sequenced codes (`INV-YYMMDD-XXXX`, `PUR-YYMMDD-XXXX`).
  - `decimalUtils.ts`: Safe arithmetic, zero-division guards, and margin percentages.

---

## 3. Frontend-Backend Contract & Type Synchronization (Frontend Sync)

When building or updating the **Next.js Frontend**, all API integrations must strictly conform to this contract:

### A. Base URL
```text
http://localhost:5000/api/v1
```

### B. Standard API Response Structure
All backend endpoints return responses in this unified format:

```typescript
// Successful Response
interface ApiResponse<T> {
  success: true;
  message?: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Error Response
interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>; // For 400 Validation errors
  stack?: string; // Only in development
}
```

### C. Decimal Serialization (CRITICAL)
- Prisma serializes `@db.Decimal` fields as **Strings** in JSON (e.g., `"stockQuantity": "14.9943"`, `"grandTotal": "36270.00"`) to avoid JavaScript floating-point precision loss.
- **Frontend Rule:**
  - Always parse currency and quantity fields with `Number(val)` or use a Decimal library for financial calculations.
  - When rendering in the UI, format currency as `৳${Number(val).toLocaleString('en-BD')}` or standard 2 decimals, and weights up to 4 decimals for micro-spices.

---

## 4. Complete API Endpoints Matrix

| Module | Method | Endpoint | Description & Key Parameters |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/health` | Server status check (`http://localhost:5000/health`) |
| **Units** | `GET` | `/api/v1/units` | List all dynamic units (কেজি, প্যাকেট, বস্তা, কার্টন) |
| | `POST` | `/api/v1/units` | Create a new unit `{ name, banglaName, category }` |
| | `GET` | `/api/v1/units/:id` | Get unit details by ID |
| | `PATCH` | `/api/v1/units/:id` | Update unit details |
| | `DELETE`| `/api/v1/units/:id` | Delete unit |
| **Inventory** | `GET` | `/api/v1/inventory` | List products `?search=&category=&page=&limit=` |
| | `POST` | `/api/v1/inventory` | Create product (loose/packaged) with base & sub units |
| | `GET` | `/api/v1/inventory/:id` | Product details with all custom units |
| | `GET` | `/api/v1/inventory/barcode/:barcode` | Barcode lookup for instant POS scanner |
| | `PATCH` | `/api/v1/inventory/:id/prices` | Update replacement cost & retail/wholesale rates |
| | `POST` | `/api/v1/inventory/:id/units` | Add custom multi-unit (e.g. ৫০ কেজি বস্তা, ৫ কেজি পাল্লা) |
| | `DELETE`| `/api/v1/inventory/units/:unitId` | Delete product custom unit |
| | `POST` | `/api/v1/inventory/:id/wastage` | Record micro-weight shrinkage/drying loss |
| | `GET` | `/api/v1/inventory/wastages` | List stock wastage history log |
| **Purchases** | `POST` | `/api/v1/purchases` | Create Chalan `{ supplierId, transportCost, paidAmount, items: [...] }` |
| | `GET` | `/api/v1/purchases` | List purchases `?supplierId=&startDate=&endDate=` |
| | `GET` | `/api/v1/purchases/:id` | Purchase details with items and cost updates |
| **Sales** | `POST` | `/api/v1/sales` | Create sale (Supports retail, wholesale, sacks, palla, cash & due) |
| | `POST` | `/api/v1/sales` | **Reverse Price Sale:** `{ customTotalPrice: 20 }` (auto-weights) |
| | `GET` | `/api/v1/sales` | List invoices `?saleType=&customerId=&startDate=&endDate=` |
| | `GET` | `/api/v1/sales/:id` | Sale details |
| | `GET` | `/api/v1/sales/:id/receipt` | Thermal POS printer-ready cash memo payload |
| **Customers** | `GET` | `/api/v1/customers` | List customers `?search=&hasDue=true` |
| | `POST` | `/api/v1/customers` | Create customer `{ name, phone, address, customerType, openingDue }` |
| | `GET` | `/api/v1/customers/:id` | Customer profile and balance |
| | `PATCH` | `/api/v1/customers/:id` | Update customer info |
| | `POST` | `/api/v1/customers/:id/payments` | **Receive Due Payment:** `{ amount, note }` |
| | `POST` | `/api/v1/customers/:id/adjustments` | Adjust due balance `{ amount, reason }` |
| | `GET` | `/api/v1/customers/:id/ledger` | **Customer Ledger:** Running debit, credit, balance history |
| **Suppliers** | `GET` | `/api/v1/suppliers` | List Mahajans/Distributors `?search=&hasPayable=true` |
| | `POST` | `/api/v1/suppliers` | Create supplier `{ name, companyName, phone, openingPayable }` |
| | `GET` | `/api/v1/suppliers/:id` | Supplier profile and store debt |
| | `PATCH` | `/api/v1/suppliers/:id` | Update supplier details |
| | `POST` | `/api/v1/suppliers/:id/payments` | **Pay Supplier:** `{ amount, note }` |
| | `POST` | `/api/v1/suppliers/:id/adjustments` | Adjust supplier debt balance `{ amount, reason }` |
| | `GET` | `/api/v1/suppliers/:id/ledger` | **Supplier Ledger:** Running debit, credit, balance history |
| **Expenses** | `POST` | `/api/v1/expenses` | Record expense `{ category, amount, description }` |
| | `GET` | `/api/v1/expenses` | List expenses `?category=&startDate=&endDate=` |
| | `GET` | `/api/v1/expenses/:id` | Get expense by ID |
| | `PATCH` | `/api/v1/expenses/:id` | Update expense |
| | `DELETE`| `/api/v1/expenses/:id` | Delete expense |
| **Cashbox** | `GET` | `/api/v1/cashbox/daily-summary` | **Daily Closing:** Cash In, Cash Out, Net Cash in Hand |
| **Reports** | `GET` | `/api/v1/reports/profit-loss` | P&L Report: Revenue, COGS, Gross Margin, Wastage, Net Profit |
| | `GET` | `/api/v1/reports/inventory-valuation`| Total inventory value at current replacement costs |
| | `GET` | `/api/v1/reports/dues-summary` | Total market receivables vs total Mahajan payables |
| | `GET` | `/api/v1/reports/top-selling` | Top selling products ranking by revenue and volume |

---

## 5. Security & Rate Limiting

- **Helmet:** Active security headers.
- **CORS:** Configurable via `CORS_ORIGIN` (defaults to `*` or `http://localhost:3000`).
- **Rate Limiting:** Protects backend with window limit (default: 1,000 requests per 15 minutes).
- **Zod Validation:** All incoming request bodies and query params are strictly validated; invalid inputs return `400 Bad Request` with an explanatory array of field errors.

---

## 6. Development & Operational Commands

All commands are run from `backend/`:

```bash
# 1. Start development server with live reload:
npm run dev

# 2. Compile TypeScript project to dist/:
npm run build

# 3. Seed database with Feni Bazar store data:
npm run seed

# 4. Run automated POS & Khata flow tests:
npm run test:flow

# 5. Run full 46-endpoint HTTP API audit:
npx tsx scripts/test-all-apis-e2e.ts
```

---

## 7. Instructions for Agents Building the Frontend (Next.js)

1. **State Management & Data Fetching:**
   - Use SWR or TanStack Query (React Query) for caching and optimistic updates.
2. **Offline/Local-First Friendly:**
   - Since store operations in Feni Bazar require rapid checkout, keep product lookup (barcode, SKU, name) fast and cached.
3. **Receipt Printing:**
   - The `/api/v1/sales/:id/receipt` endpoint provides the exact receipt data structure. Format it for 58mm/80mm thermal POS printers.
4. **Always Reference this Document:**
   - Whenever an agent creates a new frontend page or API call, verify endpoint URLs, payload types, and decimal conventions against this specification.
