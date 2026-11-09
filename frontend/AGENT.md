# AGENT.md — Frontend Architecture & Developer Guidelines
**Project:** Idris Brothers Grocery POS & Khata Management (Frontend)  
**Location:** Morichpotti, Feni Bazar, Feni, Bangladesh  
**Stack:** Next.js 16 (App Router), React 19, TypeScript (Strict), Tailwind CSS, Zustand  
**Backend Reference:** `../backend/AGENT.md` (Contains exact 46-endpoint API contract)

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
