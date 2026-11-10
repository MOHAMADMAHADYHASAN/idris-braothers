# AGENTS.md — Backend Architecture & Engine Rules
**Project:** Idris Brothers Inventory, POS & Khata Management System  
**Location:** Morichpotti, Feni Bazar, Feni, Bangladesh  
**Stack:** Node.js, Express, TypeScript, PostgreSQL, Prisma ORM  
**Master Bridge Reference:** `../AGENTS.md` (Contains global business domain & core rules)  
**Version:** 1.0.0 (Production-Ready Backend)

> **🔴 MANDATORY AGENT DIRECTIVE — AUTOMATIC AGENTS.MD LOGGING:**
> **যেকোনো নতুন পরিবর্তন, ফিচার যোগ, রিফ্যাক্টরিং বা আর্কিটেকচারাল সিদ্ধান্ত বাস্তবায়নের সাথে সাথেই সংশ্লিষ্ট `AGENTS.md`-তে তাৎক্ষণিকভাবে নোট (record) করতে হবে। কোনো কোড পরিবর্তন ডকুমেন্টেশন ছাড়া অসম্পূর্ণ হিসেবে গণ্য হবে।**

> **🛑 STRICT SAFETY DIRECTIVE — NO GIT COMMANDS WITHOUT USER PERMISSION:**
> **ইউজারের সুস্পষ্ট ও প্রত্যক্ষ অনুমতি ছাড়া কোনো প্রকার Git কমান্ড (`git add`, `git commit`, `git push`, `git checkout`, `git reset`, `git stash`, ইত্যাদি) রান করা সম্পূর্ণ নিষিদ্ধ। সমস্ত গিট অপারেশন শুধুমাত্র ইউজার নিজে পরিচালনা করবেন অথবা ইউজারের সুস্পষ্ট লিখিত নির্দেশে চালানো যাবে।**

> **🛑 STRICT BROWSER & TESTING DIRECTIVE — NO PLAYWRIGHT / BROWSER TESTING WITHOUT EXPLICIT USER REQUEST:**
> **ইউজারের সুস্পষ্ট ও প্রত্যক্ষ নির্দেশ ছাড়া কোনো অবস্থাতেই Playwright, Playwright MCP, বা হেডলেস ব্রাউজার E2E টেস্টিং স্বয়ংক্রিয়ভাবে রান করা যাবে না।**

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

## 3. Database ACID Compliance, Data Consistency & Integrity Protocol (বাধ্যতামূলক ডেটাবেজ প্রটোকল)

ইদ্রিস ব্রাদার্স ERP / POS সিস্টেমে কোনো অবস্থাতেই অসম্পূর্ণ, ত্রুটিযুক্ত বা ভারসাম্যহীন (Corrupted/Inconsistent) ফিন্যান্সিয়াল ও ইনভেন্টরি ডেটা প্রবেশ করতে পারবে না। প্রতিটি ডেভেলপার ও এআই এজেন্টকে নিচের ৭টি ডেটাবেজ কনসিস্টেন্সি নিয়ম ১০০% অনুসরণ করতে হবে:

### ৩.১ বাধ্যতামূলক পারমাণবিক লেনদেন (Mandatory ACID Transactions via `prisma.$transaction`)
- **জিরো পার্শিয়াল রাইট:** একাধিক টেবিলে প্রভাব ফেলে এমন যেকোনো অপারেশন (যেমন: সেলস ইনভয়েস তৈরি, পণ্য ও ভ্যারিয়েন্ট এডিট, পারচেজ চালান রিসিভ, খাতা জমা/পরিশোধ) একক কোয়েরিতে সম্পন্ন করা কঠোরভাবে নিষিদ্ধ।
- **বাধ্যতামূলক ব্লকিং:** সর্বদা `prisma.$transaction(async (tx) => { ... })` ব্লকের ভেতরে সমস্ত রাইট ও আপডেট অপারেশন একত্রিত করতে হবে।
- **অল-অর-নাথিং (All-or-Nothing):** যদি ইনভয়েস তৈরি হওয়ার পর স্টক আপডেট বা লেজার এন্ট্রিতে কোনো এরর হয়, সম্পূর্ণ ট্রানজ্যাকশন তৎক্ষণাৎ স্বয়ংক্রিয়ভাবে রোলব্যাক (Rollback) হতে হবে। ডেটাবেজে কোনো অনাথ (Orphaned) বা আংশিক রেকর্ড রেখে আসা যাবে না।
- **রেপোজিটরি কন্ট্রাক্ট:** প্রতিটি ডেটা অ্যাক্সেস মেথডে ঐচ্ছিক `tx?: Prisma.TransactionClient` প্যারামিটার থাকতে হবে এবং কোয়েরি চালানোর সময় `this.getDb(tx)` ব্যবহার করতে হবে।

### ৩.২ ডেটাবেজ-লেভেল পারমাণবিক স্টক ও ব্যালেন্স গণনা (Atomic Increments vs In-Memory Math)
- **রেস কন্ডিশন ও ফ্যান্টম স্টক রোধ:** ক্যাশিয়ারদের একাধিক কাউন্টার থেকে একই মুহূর্তে বিক্রয় বা চালান আসার সময় অ্যাপ্লিকেশন মেমরিতে হিসাব করে (`newStock = currentStock - soldQty`) ডেটাবেজে সেট করা নিষিদ্ধ।
- **বাধ্যতামূলক অ্যাটমিক অপারেটর:** সর্বদা ডেটাবেজ ইঞ্জিনের নিজস্ব পারমাণবিক ইনক্রিমেন্ট/ডিক্রিমেন্ট ব্যবহার করতে হবে:
  ```typescript
  // সঠিক নিয়ম (Database-Level Atomic Calculation):
  stockQuantity: operation === 'ADD' ? { increment: baseQuantity } : { decrement: baseQuantity }
  currentDue: { increment: dueAmount }
  currentPayable: { increment: payableAmount }
  ```

### ৩.৩ অপরিবর্তনীয় লেজার ও ঐতিহাসিক ডেটা সুরক্ষা (Immutable Ledgers & Soft-Deactivation)
- **হার্ড ডিলিট সম্পূর্ণ নিষিদ্ধ:** যে পণ্য, ভ্যারিয়েন্ট, কাস্টমার বা মহাজনের অতীতে ন্যূনতম একটি লেনদেন (`SaleItem`, `PurchaseItem`, `StockWastage`, `CustomerLedger`, `SupplierLedger`) রয়েছে, তাদের ডেটাবেজ থেকে মুছে ফেলা (`DELETE`) কঠোরভাবে নিষিদ্ধ।
- **হিস্ট্রি প্রটেকশন গার্ড (Variant & Ledger Reconciliation):**
  - ডিলিট করার পূর্বে রিলেশনাল টেবিলগুলোতে হিস্ট্রি কাউন্ট চেক করতে হবে (`saleCount > 0 || purchaseCount > 0 || wastageCount > 0`)।
  - অতীত লেনদেন থাকলে হার্ড ডিলিটের পরিবর্তে সফট-ডিয়েক্টিভেট (`isActive: false`) করতে হবে।
  - খাতার সমস্ত লেজার (`CustomerLedger`, `SupplierLedger`, `CashboxRecord`) হবে **Append-Only** (শুধুমাত্র নতুন এন্ট্রি ইনসার্ট হবে; পূর্বের এন্ট্রি এডিট বা ডিলিট করা নিষিদ্ধ)।

### ৩.৪ ফিন্যান্সিয়াল ব্যালেন্স সমতা নীতি (Double-Entry Balance Invariance)
- **রানিং খাতা সমতা:** কাস্টমারের `currentDue` বা মহাজনের `currentPayable`-এর প্রতিটি পাই-পয়সার পরিবর্তনের পেছনে একই ট্রানজ্যাকশনে লেজার টেবিলে একটি সুনির্দিষ্ট রো (`debit`, `credit`, `balanceAfter`) থাকতে হবে।
- **গাণিতিক স্বতঃসিদ্ধ (Mathematical Invariant):**
  $$\text{Customer.currentDue} = \sum (\text{Debits}) - \sum (\text{Credits}) = \text{Latest CustomerLedger.balanceAfter}$$
  যদি কোনো কারণে এই সমতা বিঘ্নিত হয়, তবে ট্রানজ্যাকশন রিজেক্ট হবে।

### ৩.৫ শূন্য ফ্লোটিং-পয়েন্ট লিক নীতি (Lossless 4-Decimal & Currency Arithmetic)
- **ফ্লোটিং পয়েন্ট নিষিদ্ধ:** জাভাস্ক্রিপ্টের সাধারণ ফ্লোটিং পয়েন্ট মেকানিক্সে টাকার হিসাব বা মাইক্রো-মসলার ওজন ক্যালকুলেশন সম্পূর্ণ নিষিদ্ধ।
- **প্রিজমা স্কেলিং:**
  - ওজন ও রূপান্তর গুণক: `@db.Decimal(12, 4)` (৪ দশমিক নির্ভুলতা — এলাচ/দারুচিনি/লবঙ্গের গ্রাম ওজনে যাতে কোনো আর্থিক ক্ষতি না হয়)।
  - মুদ্রা ও মূল্য: `@db.Decimal(12, 2)` (২ দশমিক — পয়সা নির্ভুলতা)।
- **সার্ভিস লেয়ারে নিরাপদ হিসাব:** সমস্ত গুণ, ভাগ ও বিয়োগ `Prisma.Decimal` ইনস্ট্যান্স মেথড (`.mul()`, `.div()`, `.add()`, `.sub()`) এবং `src/common/utils/decimalUtils.ts` দিয়ে সম্পন্ন করতে হবে।

### ৩.৬ মিউটেশন শেষে সম্পূর্ণ রিলেশনাল গ্রাফ রিটার্ন (Full Hydration Pattern)
- **আংশিক অবজেক্ট রিটার্ন নিষিদ্ধ:** কোনো প্রোডাক্ট বা সেলস এডিট/তৈরি করার পর শুধুমাত্র ফ্ল্যাট প্যারেন্ট রেকর্ড রিটার্ন করা যাবে না।
- **পূর্ণাঙ্গ গ্রাফ হাইড্রেশন:** ট্রানজ্যাকশনের শেষ ধাপে সর্বদা `findById(id, tx)` কল করে সংযুক্ত সমস্ত সাব-রিলেশন (`variants`, `units`, `category`, `brand` ইত্যাদি) সহ রি-হাইড্রেটেড অবজেক্ট রিটার্ন করতে হবে। এটি ফ্রন্টএন্ডে রিলোড ছাড়াই রিয়েল-টাইম টেবিল ও স্টেট ১০০% নির্ভুল রাখে।

### ৩.৭ ইউনিক আইডেন্টিফায়ার ও কনকারেন্সি সেফটি (Idempotency & Collision Guards)
- **ইউনিক ইনডেক্স সুরক্ষা:** `sku`, `barcode`, ইনভয়েস কোড (`INV-YYMMDD-XXXX`), চালান কোড (`PUR-YYMMDD-XXXX`) ডেটাবেজ লেভেলে ইউনিক ইনডেক্স দ্বারা সুরক্ষিত।
- **আপডেট কনফ্লিক্ট যাচাই:** যেকোনো পণ্য বা ভ্যারিয়েন্ট এডিট করার সময় বারকোড বা SKU কনফ্লিক্ট চেক করার ক্ষেত্রে বর্তমান সত্তাটি বাদ দিয়ে (`conflict.id !== currentId`) যাচাই করতে হবে।

---

## 4. Frontend-Backend Contract & Type Synchronization (Frontend Sync)

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

## 5. Complete API Endpoints Matrix

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

## 6. Security & Rate Limiting

- **Helmet:** Active security headers.
- **CORS:** Configurable via `CORS_ORIGIN` (defaults to `*` or `http://localhost:3000`).
- **Rate Limiting:** Protects backend with window limit (`RATE_LIMIT_MAX=2000` per 15 minutes in `.env` / `.env.example` / `env.ts` to support concurrent POS + Admin terminals on local WiFi).
- **Zod Validation:** All incoming request bodies and query params are strictly validated; invalid inputs return `400 Bad Request` with an explanatory array of field errors.

---

## 7. Development & Operational Commands

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

## 8. Instructions for Agents Building the Frontend (Next.js)

1. **State Management & Data Fetching:**
   - Use SWR or TanStack Query (React Query) for caching and optimistic updates.
2. **Offline/Local-First Friendly:**
   - Since store operations in Feni Bazar require rapid checkout, keep product lookup (barcode, SKU, name) fast and cached.
3. **Receipt Printing:**
   - The `/api/v1/sales/:id/receipt` endpoint provides the exact receipt data structure. Format it for 58mm/80mm thermal POS printers.
4. **Always Reference this Document:**
   - Whenever an agent creates a new frontend page or API call, verify endpoint URLs, payload types, and decimal conventions against this specification.
5. **6-Digit Base SKU Engine & Hardware Barcode Lookup (`inventory/skuGenerator.ts`, `inventory.repository.ts`):**
   - Blank SKUs auto-generate a DB-verified cryptographic 6-digit base code (`100000–999999`), appending Bengali-safe normalized size suffixes (`৫০০ গ্রাম` -> `500G`, `১ কেজি` -> `1KG`, `৫০ কেজি বস্তা` -> `50KG-BAG`) and collision retries.
   - `GET /api/v1/inventory/barcode/:barcode` uses `findByScanCode()` (`variant.barcode` -> `unit.barcode` -> `variant.sku` fallback) so thermal SKU stickers scan seamlessly even when factory `barcode` is left optional/blank.
