# AGENTS.md — Master Architecture Bridge & Business Protocol
**Project:** Idris Brothers Grocery POS, Inventory & Khata Management System  
**Location:** Morichpotti, Feni Bazar, Feni, Bangladesh  
**Architecture:** Monorepo (Next.js 16 Frontend + Node/Express PostgreSQL Prisma Backend)  
**Version:** 1.0.0 (Production-Grade Enterprise System)

> **🛑 STRICT SAFETY DIRECTIVE — NO GIT COMMANDS WITHOUT USER PERMISSION:**
> **ইউজারের সুস্পষ্ট ও প্রত্যক্ষ অনুমতি ছাড়া কোনো প্রকার Git কমান্ড (`git add`, `git commit`, `git push`, `git checkout`, `git reset`, `git stash`, ইত্যাদি) রান করা সম্পূর্ণ নিষিদ্ধ। সমস্ত গিট অপারেশন শুধুমাত্র ইউজার নিজে পরিচালনা করবেন অথবা ইউজারের সুস্পষ্ট লিখিত নির্দেশে চালানো যাবে।**

> **🔴 MANDATORY AGENT DIRECTIVE — AUTOMATIC AGENTS.MD LOGGING:**
> **যেকোনো নতুন পরিবর্তন, ফিচার যোগ, রিফ্যাক্টরিং বা আর্কিটেকচারাল সিদ্ধান্ত বাস্তবায়নের সাথে সাথেই সংশ্লিষ্ট `AGENTS.md`-তে তাৎক্ষণিকভাবে নোট (record) করতে হবে। কোনো কোড পরিবর্তন ডকুমেন্টেশন ছাড়া অসম্পূর্ণ হিসেবে গণ্য হবে।**

> **🛑 STRICT BROWSER & TESTING DIRECTIVE — NO PLAYWRIGHT / BROWSER TESTING WITHOUT EXPLICIT USER REQUEST:**
> **ইউজারের সুস্পষ্ট ও প্রত্যক্ষ নির্দেশ ("Playwright দিয়ে চেক করো" / "browser test করো") ছাড়া কোনো অবস্থাতেই Playwright, Playwright MCP, বা হেডলেস ব্রাউজার E2E টেস্টিং স্বয়ংক্রিয়ভাবে রান করা যাবে না। স্বাভাবিক কোড পরিবর্তনের পর শুধুমাত্র `npx tsc --noEmit` এবং `npm run build` দিয়ে যাচাই করতে হবে।**

---

## 1. System Map & Subsystem Rules (আর্কিটেকচারাল ম্যাপিং)

এই প্রজেক্টটি ৩টি নির্দিষ্ট স্তরে ডকুমেন্টেশন ও আর্কিটেকচার বজায় রাখে:

```text
idris-brothers/
├── AGENTS.md                 # 🔗 ১. Master Bridge (এই ফাইল: ব্যবসা, ডোমেন, গিট সেফটি ও সিস্টেম রুলস)
│
├── backend/
│   └── AGENTS.md             # ⚙️ ২. Backend Engine Rules (Prisma, ACID $transaction, Repositories, 46 APIs)
│
└── frontend/
    └── AGENTS.md             # 🎨 ৩. Frontend & UI/UX Rules (Next.js 16, Noto Sans, DynamicDataTable, Spacing)
```

- **ব্যাকএন্ডের কোনো কাজ করতে হলে:** সরাসরি [`backend/AGENTS.md`](file:///home/mahady-hasan/Desktop/idris-brothers/backend/AGENTS.md) দেখুন।
- **ফ্রন্টএন্ডের কোনো কাজ করতে হলে:** সরাসরি [`frontend/AGENTS.md`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/AGENTS.md) দেখুন।

---

## 2. Core Business Rules (ফেনী বাজার ডোমেনের অপরিবর্তনীয় নিয়মাবলী)

যেকোনো ডেভেলপার বা এআই এজেন্ট ব্যাকএন্ড বা ফ্রন্টএন্ডে কোড লেখার পূর্বে এই ব্যবসায়িক সত্যগুলো বাধ্যতামূলকভাবে মেনে চলবে:

### ১. ডুয়াল সেলস মোড (Dual Pricing: খুচরা ও পাইকারি)
- দোকানের প্রতিটি পণ্যের দুটি বিক্রয়মূল্য থাকে: **খুচরা (Retail)** এবং **পাইকারি (Wholesale)**।
- প্রতিটি কাস্টমার ও ইনভয়েস হয় `RETAIL` অথবা `WHOLESALE` মোডে বিল হবে।

### ২. ৪-দশমিক মাইক্রো-মসলা ও টাকার অংকে বিক্রি (Reverse Price-to-Weight Sale)
- এলাচ (Cardamom), দারুচিনি (Cinnamon), লবঙ্গের (Cloves) মতো দামি মসলায় সামান্য গ্রাম ওজনের ভুলে বড় আর্থিক ক্ষতি হয়।
- তাই সমস্ত পণ্যের পরিমাণ, স্টক এবং বস্তা/কার্টন কনভার্শন ফ্যাক্টর ডেটাবেজে **৪ দশমিক নির্ভুলতায়** (`@db.Decimal(12, 4)`) সংরক্ষিত থাকবে।
- **টাকার অংকে বিক্রি (Reverse Math):** ফেনী বাজারে খুচরা ক্রেতারা অনেক সময় বলে "২০ টাকার এলাচ দেন"। POS সিস্টেম টাকার অংক (`customTotalPrice: 20`) দিলে স্বয়ংক্রিয়ভাবে ৪ দশমিকে ওজন বের করে নেয়:
  $$\text{baseQuantity} = \frac{\text{customTotalPrice}}{\text{unitPrice}}$$

### ৩. ১০০% ফিজিক্যাল ক্যাশ ও রানিং বাকি খাতা (Strictly Cash & Due Running Khata)
- ফেনী বাজারের ঐতিহ্যবাহী আড়তদারী ব্যবস্থা অনুযায়ী এখানে কোনো ডিজিটাল ওয়ালেট (bKash/নগদ/কার্ড) ব্যবহৃত হয় না।
- সমস্ত লেনদেন হয় **নগদ (Cash)** অথবা **বাকি (Due)**।
- কাস্টমারদের জন্য `currentDue` এবং মহাজনদের জন্য `currentPayable` রানিং ব্যালেন্স থাকে। প্রতিবার লেনদেনে লেজার টেবিলে অপরিবর্তনীয় (Immutable) অডিট রো লেখা হয়।

### ৪. রিলেশনাল প্রোডাক্ট মডেল (Product ➔ ProductVariant ➔ VariantUnit)
- **প্যারেন্ট Product:** পণ্যের নাম, ক্যাটাগরি, ব্র্যান্ড, ভ্যারিয়েন্ট ফ্ল্যাগ (`hasVariants`).
- **ProductVariant (Sellable SKU):** মূল স্টক, ক্রয়মূল্য, খুচরা ও পাইকারি মূল্য, বারকোড, SKU এবং `allowDecimalQty` ফ্ল্যাগ।
  - `allowDecimalQty: true` ➔ খোলা মসলা, চাল, ডাল (ভগ্নাংশ ওজন বা ২০ টাকার বিক্রি সম্ভব)।
  - `allowDecimalQty: false` ➔ প্যাকেট দুধ, সাবান, বোতল (ভগ্নাংশে বিক্রি কঠোরভাবে নিষিদ্ধ)।
- **VariantUnit:** বস্তা (Sack), কার্টন (Carton), পাল্লা (Palla)-এর মতো বাল্ক প্যাকেজিং ইউনিট।

### ৫. ডায়নামিক রিপ্লেসমেন্ট কস্ট ভ্যালুয়েশন (Dynamic Replacement Cost, No FIFO/LIFO)
- নতুন রেটে চালান (Purchase) রিসিভ হলে ঐ ভ্যারিয়েন্টের বিদ্যমান সমস্ত স্টক নতুন ক্রয়মূল্যে তাৎক্ষণিকভাবে রি-ভ্যালুয়েশন হয়।
- তবে ঐতিহাসিক ইনভয়েসের লাভ-ক্ষতি নির্ভুল রাখার জন্য `SaleItem` ও `StockWastage`-এ বিক্রির সময়কার মূল্যের স্ন্যাপশট (`costPriceSnapshot`) চিরতরে সংরক্ষিত থাকে।

### ৬. দৈনিক ক্যাশ ড্রয়ার মেলানো (Daily Cashbox Reconciliation)
- প্রতিদিনের দোকান বন্ধ করার সময় ক্যাশ ড্রয়ার হিসাব মেলানো হয়:
  $$\text{Net Cash in Hand} = \text{Total Cash In (Sales + Dues)} - \text{Total Cash Out (Purchases + Expenses)}$$

---

## 3. Database Consistency & Integrity Golden Rules (গ্লোবাল ডেটাবেজ রুলস)

1. **ACID Transactions (`prisma.$transaction`):** মাল্টি-টেবিল মিউটেশনে পার্শিয়াল রাইট সম্পূর্ণ নিষিদ্ধ। সবকিছু `prisma.$transaction`-এ পরিচালিত হবে।
2. **ঐতিহাসিক সুরক্ষা (No Hard Delete with History):** যে ভ্যারিয়েন্ট বা কাস্টমারের অতীতে সেলস বা পারচেজ রেকর্ড আছে, তাদের ডেটাবেজ থেকে মোছা যাবে না; সফট-ডিয়েক্টিভেট (`isActive = false`) করতে হবে।
3. **ফুল হাইড্রেশন প্যাটার্ন:** প্রোডাক্ট বা সেলস মিউটেশনের পর প্যারেন্ট ও চাইল্ড রিলেশন (`variants`, `units`, `category`, `brand`) সহ সম্পূর্ণ অবজেক্ট ফ্রন্টএন্ডে রিটার্ন করতে হবে।
4. **অ্যাটমিক ক্যালকুলেশন:** স্টক ও বকেয়া পরিবর্তনের সময় ডেটাবেজের নিজস্ব `{ increment }` বা `{ decrement }` ব্যবহার করতে হবে।

---

## 4. Standard Verification Commands (যাচাই ও পরীক্ষা)

```bash
# ১. ব্যাকএন্ড টাইপস্ক্রিপ্ট পরীক্ষা:
cd backend && npx tsc --noEmit

# ২. ফ্রন্টএন্ড টাইপস্ক্রিপ্ট পরীক্ষা:
cd frontend && npx tsc --noEmit

# ৩. ফ্রন্টএন্ড প্রোডাকশন বিল্ড পরীক্ষা:
cd frontend && npm run build

# ৪. ব্যাকএন্ড এপিআই অডিট:
cd backend && npx tsx scripts/test-all-apis-e2e.ts
```
