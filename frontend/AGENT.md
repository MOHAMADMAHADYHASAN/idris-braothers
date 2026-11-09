# AGENT.md — Frontend Architecture & Developer Guidelines
**Project:** Idris Brothers Grocery POS & Khata Management (Frontend)  
**Location:** Morichpotti, Feni Bazar, Feni, Bangladesh  
**Stack:** Next.js 16 (App Router), React 19, TypeScript (Strict), Tailwind CSS, Zustand  
**Backend Reference:** `../backend/AGENT.md` (Contains exact 46-endpoint API contract)

> **🔴 MANDATORY AGENT DIRECTIVE — AUTOMATIC AGENT.MD LOGGING:**
> **যেকোনো নতুন পরিবর্তন, ফিচার যোগ, রিফ্যাক্টরিং বা আর্কিটেকচারাল সিদ্ধান্ত বাস্তবায়নের সাথে সাথেই `AGENT.md`-তে তাৎক্ষণিকভাবে নোট (record) করতে হবে। কোনো কোড পরিবর্তন ডকুমেন্টেশন ছাড়া অসম্পূর্ণ হিসেবে গণ্য হবে।**

---

## 1. Core Architectural Standards (বাধ্যতামূলক নিয়মাবলী)

### A. Feature-Colocated Architecture (ডোমেন-ভিত্তিক স্ট্রাকচার)
Layer-based স্ট্রাকচার (যেমন গ্লোবাল `/services` বা গ্লোবাল `/stores`) কঠোরভাবে নিষিদ্ধ। প্রতিটি ফিচার তার নিজস্ব ফোল্ডারে থাকবে:

```text
src/features/[feature-name]/
├── [feature].types.ts        # ডোমেন টাইপ ও DTO
├── [feature].service.ts      # API সার্ভিস (apiClient ও apiEndpoints ব্যবহার করে)
├── use[Feature]Store.ts      # Zustand স্টেট ও অ্যাকশন
└── components/               # ফিচারের নিজস্ব কম্পোনেন্টসমূহ
```

### B. Typography & Font Standard (টাইপোগ্রাফি রুল)
1. **Primary Bengali Typography:** **`Noto Sans Bengali`** (Google Fonts).
   - এটি স্ক্রিন ডিসপ্লেতে ছোট সাইজেও সবচেয়ে নিখুঁত ও পরিষ্কার দেখায়।
   - **কড়া নিয়ম:** বাংলায় কখনোই কোনো `tracking` (letter-spacing) ব্যবহার করা যাবে না।
   - লাইন-হাইট সবসময় $\ge 1.4$ থেকে $1.5$ হতে হবে যাতে ওপর-নিচের কোনো কার-চিহ্ন না কাটে।
2. **Numbers & Financial Decimals:** **`JetBrains Mono`** with `.tabular-numbers` / `tabular-nums`.
   - মুদ্রা, ওজন (৪ দশমিক) এবং রানিং খাতার ব্যালেন্সে মোনোস্পেস ব্যবহার বাধ্যতামূলক যাতে দ্রুত স্ক্যানিংয়ের সময় দশমিক কলামগুলো কখনো ডানে-বামে না কাঁপে।
3. *(Hind Siliguri বা অন্য কোনো ফন্ট সিস্টেম থেকে সম্পূর্ণ বর্জন করা হয়েছে)*।

### C. Iconography Standard (@phosphor-icons/react)
- পুরো অ্যাপ্লিকেশনে **শুধুমাত্র এবং শুধুমাত্র `@phosphor-icons/react`** ব্যবহার করতে হবে।
- **`lucide-react` বা অন্য কোনো আইকন লাইব্রেরি ব্যবহার করা যাবে না** (সিস্টেম থেকে সম্পূর্ণ আনইন্সটল করা হয়েছে)।
- **ইমপোর্ট নিয়মাবলী:**
  - Client Components (`'use client'`):
    ```tsx
    import { ShoppingCart, Storefront, Plus, Trash } from '@phosphor-icons/react';
    ```
  - Server Components (RSC):
    ```tsx
    import { ShoppingCart, Storefront } from '@phosphor-icons/react/dist/ssr';
    ```
- **ওজন কনভেনশন:**
  - সাধারণ বাটন ও অ্যাকশনে `weight="bold"`।
  - হাইলাইটেড বা স্পটলাইট ফিচারে `weight="fill"` অথবা `weight="duotone"`।

### D. Strict Ban on "AI Slop" Rainbow Icon Containers (রংধনু আইকন বক্স কঠোরভাবে নিষিদ্ধ)
- **কঠোর নিষেধাজ্ঞা (STRICT BAN):** ড্যাশবোর্ড কার্ড, মডিউল নেভিগেশন গ্রিড, মেনু আইটেম বা বাটন আইকনের পেছনে কখনোই এলোমেলো বিভিন্ন প্যাস্টেল কালার বক্স (যেমন একটি কার্ডে `bg-emerald-50`, অন্যটিতে `bg-amber-50`, `bg-rose-50`, `bg-blue-50`, `bg-purple-50` ইত্যাদি) দেওয়া **সম্পূর্ণ নিষিদ্ধ**। এটি ইন্টারফেসে সস্তা ও জেনেরিক এআই-জেনারেটেড লুক ("pura AI slop") তৈরি করে।
- **বাধ্যতামূলক ইউনিফায়েড নিউট্রাল স্ট্যান্ডার্ড (Unified Neutral Container):**
  - সমস্ত সাধারণ ন্যাভিগেশন, মডিউল লঞ্চার ও ড্যাশবোর্ড কার্ড আইকনের জন্য **একই মার্জিত নিউট্রাল কন্টেইনার** ব্যবহার করতে হবে:
    ```tsx
    // সঠিক নিয়ম (Mandatory Standard):
    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 flex items-center justify-center transition-all duration-200 mb-2.5">
      <Icon size={22} weight="bold" />
    </div>
    ```
  - কার্ড হোভারে আইকন স্মুথলি ডার্ক স্লেট (`group-hover:bg-slate-900 group-hover:text-white`) বা ব্র্যান্ড কালারে ট্রানজিশন করবে। কোনো কার্ডেই আলাদা আলাদা ক্যান্ডি কালার দেওয়া যাবে না।
- **কালার ব্যবহারের একমাত্র ব্যতিক্রম (Semantic Color Only):**
  - কালার (যেমন লাল, সবুজ, হলুদ) শুধুমাত্র এবং শুধুমাত্র **আসল ফিন্যান্সিয়াল স্ট্যাটাস ও সিস্টেম স্টেট** বোঝাতে ব্যবহার করা যাবে:
    - বকেয়া দেনা-পাওনা / ডিউ / ঘাটতি ➔ Rose/Red (`text-rose-600` / `bg-rose-50 text-rose-700`)
    - নগদ ক্যাশ ইন হ্যান্ড / লাভ / পরিশোধিত ➔ Emerald/Green (`text-emerald-600` / `bg-emerald-50 text-emerald-700`)
    - ওয়ার্নিং / স্টক অ্যালার্ট / পাইকারি মোড ➔ Amber/Yellow
  - মেনু বা ন্যাভিগেশন আইকনে কখনোই এই সেমান্টিক কালার ছিটানো যাবে না।

### E. Imagery & Photos Standard (Unsplash CDN)
- যদি কোনো পণ্যের ছবি, মসলার ব্যানার বা প্লেসহোল্ডার ফটো দরকার হয়, তবে **বাধ্যতামূলকভাবে Unsplash CDN** (`https://images.unsplash.com/...`) ব্যবহার করতে হবে।
- `next.config.ts`-এ `images.unsplash.com` ইতোমধ্যে কনফিগার করা আছে।
- `next/image` দিয়ে অপ্টিমাইজড রেন্ডার করতে হবে এবং ছবি লোড না হলে সুন্দর ফলব্যাক আইকন দেখাতে হবে।

### E. Centralized API Endpoints & Client
- **`src/config/apiEndpoints.ts`:** সমস্ত ব্যাকএন্ড রাউট টাইপড কনস্ট্যান্ট আকারে থাকবে। কোনো সার্ভিসে হার্ডকোডেড ইউআরএল স্ট্রিং লেখা যাবে না।
- **`src/lib/apiClient.ts`:** সেন্ট্রালাইজড ফেচ ক্লায়েন্ট যাতে রয়েছে:
  - ইউনিফাইড এরর হ্যান্ডলিং (`ApiError`).
  - Request Deduping (POS-এ দ্রুত ক্লিক করলে ডাবল ইনভয়েস সাবমিট হওয়া প্রতিরোধ করে).
  - টাইমআউট গার্ড (১৫ সেকেন্ড).

### F. Decimal & Currency Rules (টাকা ও ওজনের হিসাব)
- ব্যাকএন্ড প্রিজমা ডেসিমেলগুলোকে স্ট্রিং হিসেবে রিটার্ন করে (`"14.9943"`, `"36270.00"`).
- সার্ভিস লেয়ারে `parseDecimal()` ব্যবহার করে সেগুলোকে জাভাস্ক্রিপ্ট `number`-এ কনভার্ট করে Zustand স্টোরে রাখা হয়।
- **UI রেন্ডারিং:**
  - মুদ্রা: `formatCurrency(val)` ➔ `৳৩,৫০০.০০`
  - ওজন/পরিমাণ: `formatWeight(val, unit)` ➔ `০.০০৫৬ কেজি` (মাইক্রো-মসলার জন্য ৪ দশমিক অক্ষত থাকে).

### G. Enterprise Spacing System & The 4 Proximity Tiers (Mathematical 4-Point Grid)
ইদ্রিস ব্রাদার্স ERP / POS সিস্টেমে কোনো অনুমানের ওপর প্যাডিং বা স্পেসিং দেওয়া যাবে না। প্রতিটি কম্পোনেন্ট ৪টি সুনির্দিষ্ট প্রোক্সিমিটি স্তরে বিন্যস্ত থাকবে:
1. **Tier 1: মাইক্রো সেপারেশন (Micro Separation - 2px to 6px):**
   - বাটনের আইকন ও লেখার মধ্যবর্তী ফাঁকা: `gap-1.5` (6px)।
   - ইনপুট লেবেল থেকে ফিল্ডের দূরত্ব: `mb-1.5` বা `space-y-1.5` (6px)।
   - পণ্যের মূল টাইটেল থেকে সাবটাইটেল/বাংলা নাম/SKU: `mt-0.5` (2px)।
   - স্ট্যাটাস ব্যাজের প্যাডিং: `px-1.5 py-0.5`।
2. **Tier 2: রো ও ফিল্ড লেভেল (Row & Field Level - 8px to 12px):**
   - টুলবার ও অ্যাকশন বাটনের মধ্যবর্তী গ্যাপ: `gap-2` (8px)।
   - টেবিল সেলের প্যাডিং: `py-2.5 px-3` (নিখুঁত ৪৪ পিক্সেল স্ট্যান্ডার্ড রো হাইট নিশ্চিত করে)।
   - মোবাইল কার্ডের রো এবং লিস্টের আইটেম স্পেসিং: `space-y-2.5` (10px)।
3. **Tier 3: কার্ড ও মডিউল লেভেল (Card & Module Level - 16px to 20px):**
   - কার্ড কন্টেইনার ও মডিউলের অভ্যন্তরীণ প্যাডিং: `p-3.5 sm:p-4`।
   - KPI সামারি গ্রিড গ্যাপ: `gap-3 sm:gap-4`।
   - ফর্মের ২-কলাম গ্রিড স্পেসিং: `gap-4` (16px)।
4. **Tier 4: পেজ ক্যানভাস লেভেল (Page Canvas Level - 20px to 24px):**
   - পেজের মূল আউটার প্যাডিং: `px-4 sm:px-6 lg:px-8 py-4 sm:py-6`।
   - সেকশন-থেকে-সেকশন গ্যাপ: `space-y-4 sm:space-y-5` (বা `space-y-6`)।
   - সার্চ ইনপুট উইডথ ক্যাপ: `max-w-sm` বা `max-w-md`।

### H. Presentation-Only Table Standard (DynamicDataTable<T>)
সমস্ত টেবিল পেজ ([`/sales`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/sales/page.tsx), [`/products`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/products/page.tsx), [`/purchases`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/purchases/page.tsx), [`/khata/customers`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/khata/customers/page.tsx), [`/khata/suppliers`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/khata/suppliers/page.tsx), [`/cashbox`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/cashbox/page.tsx)) বাধ্যতামূলকভাবে [`DynamicDataTable<T>`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/components/shared/DynamicDataTable.tsx) ইঞ্জিন ব্যবহার করবে:
1. **টাইপ-সেফ কলাম কনফিগারেশন (`ColumnDef<T>`):**
   - `header`, `renderCell`, `headerClassName`, `cellClassName`, `footerClassName`, `disableToggle`।
2. **কলাম ভিজিবিলিটি পারসিস্টেন্স (`localStorage`):**
   - `tableId` অনুযায়ী কলামের লুকানো/দেখানোর প্রেফারেন্স ব্রাউজারের `localStorage` (`dt_cols_${tableId}_v1`)-এ ক্র্যাশ-প্রুফভাবে সেভ থাকে।
3. **গোল্ডেন কলাম অ্যালাইনমেন্ট রুলস:**
   - **নাম / টাইটেল / SKU:** বামে অ্যালাইনড (`text-left`), ২-লাইন কন্টেক্সট (`font-semibold text-slate-900`, `text-[11px] text-slate-500`)।
   - **ক্যাটাগরি / টাইপ / ব্যাজ:** সেন্টারে অ্যালাইনড (`text-center`), `inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium`।
   - **সংখ্যা / ওজন / টাকা:** ডানে অ্যালাইনড (`text-right`), `font-mono tabular-nums tracking-tight font-black` (`JetBrains Mono`)।
   - **অ্যাকশন বাটন:** সেন্টার/রাইট (`text-center`), পিন্ড `h-7.5` বা `h-8` বাটন।
4. **স্বয়ংক্রিয় ফুটার সামারি (`<tfoot>`):**
   - `renderFooterCell: (data) => ReactNode` দিয়ে পৃষ্ঠার মোট বিল, পরিশোধ ও বকেয়ার স্বয়ংক্রিয় যোগফল প্রদর্শন।
5. **ইভেন্ট বাবলিং সেফগার্ড:**
   - সম্পূর্ণ রো ক্লিকে ড্রয়ার বা ডিটেইল ওপেন হলেও ভেতরের বাটন, ইনপুট বা লিংকে ক্লিক করলে বাবলিং আটকে যায় (`stopPropagation` এবং `.no-row-click`)।
6. **মাল্টি-ভ্যারিয়েন্ট সাব-টেবিল সাপোর্ট:**
   - `renderExpandedRow` এবং `isRowExpanded` প্রপ দিয়ে প্যারেন্ট রো-এর নিচে ড্রপডাউন সাব-টেবিল রেন্ডার করা যায়।

### I. Unified Administrative Page Layout & Components
1. **`AdminPageHeader` (`src/components/shared/AdminPageHeader.tsx`):**
   - ডেসকটপে স্ট্যাটিক ক্যানভাস উপাদান (`md:static`), মোবাইলে স্টিকি ব্লার টপবার (`sticky top-0 bg-white/95 backdrop-blur-md`)।
   - টাইটেল, সাবটাইটেল, ব্যাক বাটন, স্ট্যাটাস ব্যাজ ও প্রাইমারি অ্যাকশন বাটন সমন্বিত।
2. **`UnifiedDateRangeFilter` (`src/components/shared/UnifiedDateRangeFilter.tsx`):**
   - বাংলাদেশ টাইমজোন (`Asia/Dhaka` UTC+06:00) অফসেট-সুরক্ষিত ডেট ফিল্টার।
   - ইন্টারনাল `<Suspense>` বাউন্ডারি দিয়ে আবৃত, ফলে Next.js App Router-এ কোনো `useSearchParams()` ক্লায়েন্ট বেইলআউট এরর ঘটে না।
3. **`AdminPagination` (`src/components/shared/AdminPagination.tsx`):**
   - সুষম বাংলা পেজিনেশন বার ("১-১৫ / মোট ১৫০টি")।
4. **`CustomSelect` (`src/components/shared/CustomSelect.tsx`):**
   - React Portal (`createPortal`) ড্রপডাউন যা কোনো টেবিল বা কার্ড কন্টেইনারের `overflow-hidden` দ্বারা কখনো কেটে যায় না।

---

## 2. Directory Tree (`src/`)

```text
src/
├── app/                              # Next.js App Router পেজ ও লেআউট
│   ├── layout.tsx                    # রুট লেআউট (Noto Sans Bengali + JetBrains Mono)
│   ├── globals.css                   # Tailwind v4 @theme, স্লেট টোকেন, থার্মাল প্রিন্ট CSS
│   ├── page.tsx                      # ড্যাশবোর্ড / বিক্রয় ও বকেয়া সামারি
│   ├── pos/                          # পিওএস ক্যাশ কাউন্টার বিলিং (h-[100dvh])
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
│   ├── ui/                           # PosHeaderModeBar, KhataBalanceBadge, MobileCard, KpiCard
│   ├── layout/                       # Navbar, Sidebar, TopHeader
│   └── shared/                       # ThermalReceipt, DebouncedSearch
├── config/
│   └── apiEndpoints.ts               # সেন্ট্রালাইজড টাইপড এপিআই রাউটস
├── lib/
│   ├── apiClient.ts                  # টাইপড ফেচ ক্লায়েন্ট উইথ ডিডুপ্লিকেশন
│   ├── decimal.ts                    # ৪ দশমিকে নির্ভুল হিসাব ও ফরম্যাটিং
│   └── utils.ts                      # Tailwind merge (cn)
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
    │   └── components/               # PosProductCatalog, PosCartTable, PosSettlementPanel
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
5. **Thermal Slip Directives:**
   - রসিদ প্রিন্টে `@media print` সরাসরি খাঁটি কালো কালার (`#000000`) পাঠাবে যাতে থার্মাল প্রিন্টারে কোনো অক্ষর ঘোলাটে না হয়।
