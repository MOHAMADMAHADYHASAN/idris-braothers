# AGENT.md — Frontend Architecture & Developer Guidelines
**Project:** Idris Brothers Grocery POS & Khata Management (Frontend)  
**Location:** Morichpotti, Feni Bazar, Feni, Bangladesh  
**Stack:** Next.js 16 (App Router), React 19, TypeScript (Strict), Tailwind CSS, Zustand  
**Backend Reference:** `../backend/AGENT.md` (Contains exact 46-endpoint API contract)

---

## 1. Core Architectural Standards (বাধ্যতামূলক নিয়মাবলী)

### A. Feature-Colocated Architecture (ডোমেন-ভিত্তিক স্ট্রাকচার)
Layer-based স্ট্রাকচার (যেমন গ্লোবাল `/services` বা গ্লোবাল `/stores`) নিষিদ্ধ। প্রতিটি ফিচার তার নিজস্ব ফোল্ডারে থাকবে:

```text
src/features/[feature-name]/
├── [feature].types.ts        # ডোমেন টাইপ ও DTO
├── [feature].service.ts      # API সার্ভিস (apiClient ও apiEndpoints ব্যবহার করে)
├── use[Feature]Store.ts      # Zustand স্টেট ও অ্যাকশন
└── components/               # ফিচারের নিজস্ব কম্পোনেন্টসমূহ
```

### B. Centralized API Endpoints & Client
- **`src/config/apiEndpoints.ts`:** সমস্ত ব্যাকএন্ড রাউট টাইপড কনস্ট্যান্ট আকারে থাকবে। কোনো সার্ভিসে হার্ডকোডেড ইউআরএল স্ট্রিং লেখা যাবে না।
- **`src/lib/apiClient.ts`:** সেন্ট্রালাইজড ফেচ ক্লায়েন্ট যাতে রয়েছে:
  - ইউনিফাইড এরর হ্যান্ডলিং (`ApiError`).
  - Request Deduping (POS-এ দ্রুত ক্লিক করলে ডাবল ইনভয়েস সাবমিট হওয়া প্রতিরোধ করে).
  - টাইমআউট গার্ড (১৫ সেকেন্ড).

### C. Decimal & Currency Rules (টাকা ও ওজনের হিসাব)
- ব্যাকএন্ড প্রিজমা ডেসিমেলগুলোকে স্ট্রিং হিসেবে রিটার্ন করে (`"14.9943"`, `"36270.00"`).
- সার্ভিস লেয়ারে `parseDecimal()` ব্যবহার করে সেগুলোকে জাভাস্ক্রিপ্ট `number`-এ কনভার্ট করে Zustand স্টোরে রাখা হয়।
- **UI রেন্ডারিং:**
  - মুদ্রা: `formatCurrency(val)` ➔ `৳3,500.00`
  - ওজন/পরিমাণ: `formatWeight(val, unit)` ➔ `0.0056 কেজি` (মাইক্রো-মসলার জন্য ৪ দশমিক অক্ষত থাকে).

---

## 2. Directory Tree (`src/`)

```text
src/
├── app/                              # Next.js App Router পেজ ও লেআউট
│   ├── layout.tsx                    # রুট লেআউট
│   ├── page.tsx                      # ড্যাশবোর্ড / বিক্রয় ও বকেয়া সামারি
│   ├── pos/                          # পিওএস ক্যাশ কাউন্টার বিলিং
│   │   └── page.tsx
│   ├── products/                     # পণ্য ও ডাইনামিক ইউনিট ম্যানেজমেন্ট
│   │   └── page.tsx
│   ├── purchases/                    # মহাজনের চালান এন্ট্রি
│   │   └── page.tsx
│   ├── khata/                        # কাস্টমার ও মহাজনের বাকির খাতা
│   │   ├── customers/page.tsx
│   │   └── suppliers/page.tsx
│   ├── cashbox/                      # দৈনিক খরচ ও ক্যাশবাক্স ক্লোজিং
│   │   └── page.tsx
│   └── reports/                      # লাভ-ক্ষতি, স্টক ভ্যালু ও বকেয়া রিপোর্ট
│       └── page.tsx
├── components/                       # শেয়ার্ড ও রিইউজেবল কম্পোনেন্ট
│   ├── ui/                           # Button, Input, Modal, Badge, Table, Card
│   ├── layout/                       # Navbar, Sidebar, TopHeader
│   └── shared/                       # DebouncedSearch, BarcodeListener, CurrencyDisplay
├── config/
│   └── apiEndpoints.ts               # সেন্ট্রালাইজড টাইপড এপিআই রাউটস
├── lib/
│   ├── apiClient.ts                  # টাইপড ফেচ ক্লায়েন্ট উইথ ডিডুপ্লিকেশন
│   ├── decimal.ts                    # ৪ দশমিকে নির্ভুল হিসাব ও ফরম্যাটিং
│   └── utils.ts                      # Tailwind merge (cn), debounce ইত্যাদি
└── features/                         # ডোমেন-ভিত্তিক ফিচার মডিউল
    ├── product/                      # পণ্য, ইউনিট মাস্টার, বস্তা/কার্টন কনভার্শন ও অপচয়
    │   ├── product.types.ts
    │   ├── product.service.ts
    │   ├── useProductStore.ts
    │   └── components/
    ├── pos/                          # পিওএস কার্ট, রিভার্স ক্যালকুলেশন (২০ টাকার এলাচ) ও বাকি হিসাব
    │   ├── pos.types.ts
    │   ├── pos.service.ts
    │   ├── usePosStore.ts
    │   └── components/
    ├── purchase/                     # চালান এন্ট্রি, অন-দ্য-ফ্লাই কার্টন কনভার্শন ও রিপ্লেসমেন্ট কস্ট
    │   ├── purchase.types.ts
    │   ├── purchase.service.ts
    │   ├── usePurchaseStore.ts
    │   └── components/
    ├── customer-khata/               # কাস্টমার রানিং বাকি, জমা আদায় ও লেজার খাতা
    │   ├── customerKhata.types.ts
    │   ├── customerKhata.service.ts
    │   ├── useCustomerKhataStore.ts
    │   └── components/
    ├── supplier-khata/               # মহাজন রানিং দেনা, পাওনা পরিশোধ ও লেজার খাতা
    │   ├── supplierKhata.types.ts
    │   ├── supplierKhata.service.ts
    │   ├── useSupplierKhataStore.ts
    │   └── components/
    └── cashbox/                      # দৈনিক খরচ (কুলি/ভাড়া/নাস্তা) ও ড্রয়ার ক্যাশ মেলানো
        ├── cashbox.types.ts
        ├── cashbox.service.ts
        ├── useCashboxStore.ts
        └── components/
```

---

## 3. UI/UX Rules for Fast Feni Bazar Counter Operations

1. **Keyboard-First Navigation (কিবোর্ড দিয়ে বিদ্যুৎগতির সেলস):**
   - বারকোড স্ক্যানার বা সার্চ বক্সে পণ্য সিলেক্ট করে `Enter` চাপলে কার্টে যোগ হবে।
   - `F2`: সার্চ বক্সে ফোকাস।
   - `F4`: ক্যাশ রিসিভড (Paid Amount) ফিল্ডে ফোকাস।
   - `Ctrl + Enter`: তাৎক্ষণিক ইনভয়েস প্রিন্ট/কনফার্ম।
2. **Reverse Price-to-Weight Sale (২০ টাকার এলাচ বিক্রি):**
   - পিওএস কার্ট আইটেমে দুটি মোড থাকবে:
     - `Quantity Mode`: ওজন বা প্যাকেট সংখ্যা লিখলে মোট টাকা আসে।
     - `Reverse Money Mode`: টাকার পরিমাণ (যেমন: ২০ টাকা) লিখলে ব্যাকএন্ড ও স্টোর অটোমেটিক `baseQuantity = ২০ / রেট` (৪ দশমিক) হিসাব করে নেয়।
3. **Running Due Live Math (লাইভ বকেয়া হিসাব):**
   - স্ক্রিনে সবসময় স্পষ্ট দেখা যাবে:
     `পূর্বের বকেয়া (৳১২,৭৭০) + আজকের বিল (৳৫০০) - নগদ জমা (৳৩০০) = নতুন বকেয়া (৳১২,৯৭০)`.
4. **Offline Cart Persistence:**
   - ব্রাউজার রিলোড বা ট্যাব ভুলে কেটে গেলেও কার্টের ডাটা হারিয়ে যাবে না (`localStorage` কি: `idris-pos-cart`)।

---

## 4. Frontend Phased Implementation Plan

| Phase | ফোকাস এরিয়া | প্রধান ডেলিভারেবলস |
| :--- | :--- | :--- |
| **Phase 1** | **Core Setup & Critical Engines (সম্পন্ন)** | `apiEndpoints`, `apiClient`, `decimal.ts`, `product` মডিউল এবং `pos` ইঞ্জিন (কার্ট, রিভার্স ক্যালকুলেশন ও বাকি হিসাব)। |
| **Phase 2** | **POS Counter UI & Thermal Receipt** | কীবোর্ড-ফার্স্ট পিওএস স্ক্রিন, দ্রুত পণ্য সার্চ গ্রিড, কার্ট টেবিল, কাস্টমার ড্রপডাউন এবং ৫8mm/৮০mm রসিদ ভিউ। |
| **Phase 3** | **Khata Ledger (Customer & Mahajan)** | লাল খাতার সম্পূর্ণ লেজার স্ক্রিন, রানিং ব্যালেন্স ব্যাজ, নগদ আদায় ও মহাজনকে পরিশোধ মডাল। |
| **Phase 4** | **Purchases, Cashbox & Reports** | মহাজনের চালান এন্ট্রি (অন-দ্য-ফ্লাই কার্টন সেভ), দৈনিক ক্যাশবাক্স ক্লোজিং ও প্রফিট/লস ড্যাশবোর্ড। |
