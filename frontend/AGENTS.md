<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Frontend Architecture & Developer Guidelines
**Project:** Idris Brothers Grocery POS & Khata Management (Frontend)  
**Location:** Morichpotti, Feni Bazar, Feni, Bangladesh  
**Stack:** Next.js 16 (App Router), React 19, TypeScript (Strict), Tailwind CSS, Zustand  
**Master Bridge Reference:** `../AGENTS.md` (Contains global business domain & core rules)  
**Backend Reference:** `../backend/AGENTS.md` (Contains exact 46-endpoint API contract)

> **🔴 MANDATORY AGENT DIRECTIVE — AUTOMATIC AGENTS.MD LOGGING:**
> **যেকোনো নতুন পরিবর্তন, ফিচার যোগ, রিফ্যাক্টরিং বা আর্কিটেকচারাল সিদ্ধান্ত বাস্তবায়নের সাথে সাথেই সংশ্লিষ্ট `AGENTS.md`-তে তাৎক্ষণিকভাবে নোট (record) করতে হবে। কোনো কোড পরিবর্তন ডকুমেন্টেশন ছাড়া অসম্পূর্ণ হিসেবে গণ্য হবে।**

> **🛑 STRICT SAFETY DIRECTIVE — NO GIT COMMANDS WITHOUT USER PERMISSION:**
> **ইউজারের সুস্পষ্ট ও প্রত্যক্ষ অনুমতি ছাড়া কোনো প্রকার Git কমান্ড (`git add`, `git commit`, `git push`, `git checkout`, `git reset`, `git stash`, ইত্যাদি) রান করা সম্পূর্ণ নিষিদ্ধ। সমস্ত গিট অপারেশন শুধুমাত্র ইউজার নিজে পরিচালনা করবেন অথবা ইউজারের সুস্পষ্ট লিখিত নির্দেশে চালানো যাবে।**

> **🛑 STRICT BROWSER & TESTING DIRECTIVE — NO PLAYWRIGHT / BROWSER TESTING WITHOUT EXPLICIT USER REQUEST:**
> **ইউজার সরাসরি না বলা পর্যন্ত কোনো অবস্থাতেই Playwright, Playwright MCP, হেডলেস ব্রাউজার, বা `verify_*.js` ব্রাউজার E2E টেস্টিং স্বয়ংক্রিয়ভাবে রান করা যাবে না—কোড পরিবর্তনের পরেও নিজ থেকে চালানো সম্পূর্ণ নিষিদ্ধ। ইউজার নিজে স্পষ্টভাবে না বললে কোড চেঞ্জের পর শুধু `npx tsc --noEmit` ও `npm run build` রান করতে হবে।** (আরও দেখুন: [`../.agents/rules/no-playwright-without-permission.md`](../.agents/rules/no-playwright-without-permission.md))

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
2. **Numbers & Financial Decimals:** **`JetBrains Mono`** + `var(--font-noto-sans-bengali)` fallback with `tabular-nums`.
   - মুদ্রা, ওজন (৪ দশমিক), কাউন্ট, শতাংশ ও রানিং খাতার ব্যালেন্সে মোনোস্পেস ব্যবহার বাধ্যতামূলক যাতে দ্রুত স্ক্যানিংয়ের সময় কলাম না কাঁপে।
   - **সেন্ট্রালাইজড `bn-BD` বাংলা অঙ্ক (Strict Standard):** ডিসপ্লেতে থাকা সমস্ত টাকা, ওজন, সংখ্যা, শতাংশ, তারিখ ও সময় `src/lib/decimal.ts`-এর `bn-BD` হেল্পার (`formatCurrency`, `formatWeight`, `formatNumber`, `formatCompactTaka`, `formatPercent`, `formatDateBn`, `formatTimeBn`, `formatDateTimeBn`, `toBanglaDigits`) দিয়ে প্রদর্শিত হবে। শুধুমাত্র `<input type="number">` মান, হার্ডওয়্যার বারকোড SVG, SKU/ISO (`YYYY-MM-DD`) API কী ও `escpos.ts` USB বাইট ASCII থাকবে।
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
- **বাধ্যতামূলক ইউনিফায়েড নেভি ব্র্যান্ড ও নিউট্রাল স্ট্যান্ডার্ড (Unified Brand `#1e4a7a` & Neutral Container):**
  - সমস্ত প্রাইমারি CTA ও অ্যাক্টিভ স্টেট **Navy `#1e4a7a`** (`bg-brand-deep`, hover `#173a61`, soft `#eef4fb`, border `#c8ddf0`) ব্যবহার করবে — প্রতিদ্বন্দ্বী `bg-slate-900` বা `purple`/`indigo`/`violet` ক্লাস সম্পূর্ণ নিষিদ্ধ।
  - সমস্ত সাধারণ ন্যাভিগেশন ও ড্যাশবোর্ড কার্ড আইকনে একক ইউনিফায়েড নিউট্রাল/সফট নেভি কন্টেইনার ব্যবহার করতে হবে এবং হোভারে `brand-deep` অ্যাক্সেন্ট দেখাবে। কোনো কার্ডে এলোমেলো প্যাস্টেল রঙ ছিটানো যাবে না।
- **কালার ব্যবহারের একমাত্র ব্যতিক্রম (Semantic Color Only):**
  - কালার শুধুমাত্র **আসল ফিন্যান্সিয়াল স্ট্যাটাস ও সিস্টেম স্টেট** বোঝাতে ব্যবহার করা যাবে:
    - বকেয়া দেনা-পাওনা / ডিউ / ঘাটতি ➔ Rose/Red (`text-rose-700` / `bg-due-bg text-due-text`)
    - নগদ ক্যাশ আদায় / পরিশোধিত / লাভ ➔ Emerald/Green (`text-emerald-700` / `bg-cash-bg text-cash-text`)
    - পাইকারি (Wholesale) মোড ও রিটার্ন/স্টক সতর্কতা ➔ **Amber** (`bg-wholesale-bg text-wholesale-text border-wholesale-border` / `wholesale-solid`) — পাইকারিতে কখনো বেগুনি/ইন্ডিগো ব্যবহার করা যাবে না।

### E. Imagery & Photos Standard (Unsplash CDN)
- যদি কোনো পণ্যের ছবি, মসলার ব্যানার বা প্লেসহোল্ডার ফটো দরকার হয়, তবে **বাধ্যতামূলকভাবে Unsplash CDN** (`https://images.unsplash.com/...`) ব্যবহার করতে হবে।
- `next.config.ts`-এ `images.unsplash.com` ইতোমধ্যে কনফিগার করা আছে।
- `next/image` দিয়ে অপ্টিমাইজড রেন্ডার করতে হবে এবং ছবি লোড না হলে সুন্দর ফলব্যাক আইকন দেখাতে হবে।

### F. Centralized API Endpoints & Client
- **`src/config/apiEndpoints.ts`:** সমস্ত ব্যাকএন্ড রাউট টাইপড কনস্ট্যান্ট আকারে থাকবে। কোনো সার্ভিসে হার্ডকোডেড ইউআরএল স্ট্রিং লেখা যাবে না।
- **`src/lib/apiClient.ts`:** সেন্ট্রালাইজড ফেচ ক্লায়েন্ট যাতে রয়েছে:
  - ইউনিফাইড এরর হ্যান্ডলিং (`ApiError`).
  - Request Deduping (POS-এ দ্রুত ক্লিক করলে ডাবল ইনভয়েস সাবমিট হওয়া প্রতিরোধ করে).
  - টাইমআউট গার্ড (১৫ সেকেন্ড).

### G. Decimal & Currency Rules (টাকা ও ওজনের হিসাব)
- ব্যাকএন্ড প্রিজমা ডেসিমেলগুলোকে স্ট্রিং হিসেবে রিটার্ন করে (`"14.9943"`, `"36270.00"`).
- সার্ভিস লেয়ারে `parseDecimal()` ব্যবহার করে সেগুলোকে জাভাস্ক্রিপ্ট `number`-এ কনভার্ট করে Zustand স্টোরে রাখা হয়।
- **UI রেন্ডারিং:**
  - মুদ্রা: `formatCurrency(val)` ➔ `৳৩,৫০০.০০`
  - ওজন/পরিমাণ: `formatWeight(val, unit)` ➔ `০.০০৫৬ কেজি` (মাইক্রো-মসলার জন্য ৪ দশমিক অক্ষত থাকে).

### H. Enterprise Spacing System & The 4 Proximity Tiers (Mathematical 4-Point Grid)
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

### I. Presentation-Only Table Standard (DynamicDataTable<T>)
সমস্ত টেবিল পেজ ([`/sales`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/sales/page.tsx), [`/products`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/products/page.tsx), [`/purchases`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/purchases/page.tsx), [`/khata/customers`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/khata/customers/page.tsx), [`/khata/suppliers`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/khata/suppliers/page.tsx), [`/cashbox`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/app/cashbox/page.tsx)) বাধ্যতামূলকভাবে [`DynamicDataTable<T>`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/components/shared/DynamicDataTable.tsx) ইঞ্জিন ব্যবহার করবে:
1. **টাইপ-সেফ কলাম কনফিগারেশন (`ColumnDef<T>`):**
   - `header`, `renderCell`, `headerClassName`, `cellClassName`, `footerClassName`, `disableToggle`।
2. **কলাম ভিজিবিলিটি পারসিস্টেন্স (`localStorage`):**
   - `tableId` অনুযায়ী কলামের লুকানো/দেখানোর প্রেফারেন্স ব্রাউজারের `localStorage` (`dt_cols_${tableId}_v1`)-এ ক্র্যাশ-প্রুফভাবে সেভ থাকে।
3. **গোল্ডেন কলাম অ্যালাইনমেন্ট ও ফন্ট রুলস:**
   - **নাম / টাইটেল / SKU:** বামে অ্যালাইনড (`text-left`), ২-লাইন কন্টেক্সট (`font-semibold text-slate-900`, `text-xs text-slate-600`)। ইন্টারঅ্যাক্টিভ স্ক্রিন UI-তে সর্বনিম্ন ফন্ট সাইজ **`12px` (`text-xs`)** (শুধুমাত্র থার্মাল রসিদ ও বারকোড প্রিন্ট স্লিপ ছাড়া)।
   - **ক্যাটাগরি / টাইপ / ব্যাজ:** সেন্টারে অ্যালাইনড (`text-center`), শেয়ার্ড [`Badge`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/components/ui/Badge.tsx) কম্পোনেন্ট।
   - **সংখ্যা / ওজন / টাকা:** ডানে অ্যালাইনড (`text-right`), `font-mono tabular-nums tracking-tight font-black` (`JetBrains Mono` + `bn-BD`)।
   - **অ্যাকশন বাটন:** সেন্টার/রাইট (`text-center`), শেয়ার্ড [`Button`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/components/ui/Button.tsx) / `buttonClasses`।
4. **স্বয়ংক্রিয় ফুটার সামারি (`<tfoot>`):**
   - `renderFooterCell: (data) => ReactNode` দিয়ে পৃষ্ঠার মোট বিল, পরিশোধ ও বকেয়ার স্বয়ংক্রিয় যোগফল প্রদর্শন।
5. **ইভেন্ট বাবলিং সেফগার্ড:**
   - সম্পূর্ণ রো ক্লিকে ড্রয়ার বা ডিটেইল ওপেন হলেও ভেতরের বাটন, ইনপুট বা লিংকে ক্লিক করলে বাবলিং আটকে যায় (`stopPropagation` এবং `.no-row-click`)।
6. **ট্রি-কানেক্টেড সাব-রো ও থ্রি-ডট অ্যাকশন আর্কিটেকচার (`ProductListTable`):**
   - **কার্ড-মুক্ত সাব-রো:** কোনো ভারী বা কৃত্রিম কার্ড ফ্রেম ছাড়াই প্যারেন্ট রো-এর নিচে সরাসরি শাখান্বিত ট্রি-রো (`↳`) আকারে ভ্যারিয়েন্ট প্রদর্শন।
   - **থ্রি-ডট অ্যাকশন মেনু (`ActionDropdown`):** ৪টি এলোমেলো আইকনের বদলে একটি একক `⋮` বাটন এবং ক্লিক করলে `createPortal` দিয়ে সুরক্ষিত ঝকঝকে ড্রপডাউন মেনু (বাংলা লেবেল ও আইকন সহ)।
   - **ক্লিপিং প্রুফ ড্রপডাউন:** টেবিল স্ক্রল বা `overflow-x-auto`-তে ড্রপডাউন কখনোই কেটে যাবে না।

### J. Unified Administrative Page Layout & Components
1. **`ActionDropdown` (`src/components/shared/ActionDropdown.tsx`):**
   - পোর্টাল-ভিত্তিক (`createPortal`) থ্রি-ডট (`⋮`) অ্যাকশন ড্রপডাউন মেনু। টেবিল কন্টেইনারে ওভারফ্লো ক্লিপিং প্রতিরোধ করে এবং ক্লিকে রো-বাবলিং আটকায়।
2. **`AdminPageHeader` (`src/components/shared/AdminPageHeader.tsx`):**
   - ডেসকটপে স্ট্যাটিক ক্যানভাস উপাদান (`md:static`), মোবাইলে স্টিকি ব্লার টপবার (`sticky top-0 bg-white/95 backdrop-blur-md`)।
   - টাইটেল, সাবটাইটেল, ব্যাক বাটন, স্ট্যাটাস ব্যাজ ও প্রাইমারি অ্যাকশন বাটন সমন্বিত।
2. **`UnifiedDateRangeFilter` (`src/components/shared/UnifiedDateRangeFilter.tsx`):**
   - বাংলাদেশ টাইমজোন (`Asia/Dhaka` UTC+06:00) অফসেট-সুরক্ষিত ডেট ফিল্টার।
   - ইন্টারনাল `<Suspense>` বাউন্ডারি দিয়ে আবৃত, ফলে Next.js App Router-এ কোনো `useSearchParams()` ক্লায়েন্ট বেইলআউট এরর ঘটে না।
3. **`AdminPagination` (`src/components/shared/AdminPagination.tsx`):**
   - সুষম বাংলা পেজিনেশন বার ("১-১৫ / মোট ১৫০টি")।
4. **`CustomSelect` (`src/components/shared/CustomSelect.tsx`):**
   - React Portal (`createPortal`) ড্রপডাউন যা কোনো টেবিল বা কার্ড কন্টেইনারের `overflow-hidden` দ্বারা কখনো কেটে যায় না।

### K. Product Update & State Preservation Architecture (Zero-Wipeout Guard)
- **Problem Solved:** অতীতে কোনো পণ্য এডিট করার সময় Modal থেকে শুধুমাত্র প্যারেন্ট মেটাডেটা (`name`, `banglaName`, ইত্যাদি) পাঠানো হতো এবং ব্যাকএন্ড `update` কুয়েরি `variants` ছাড়া রিটার্ন করতো। ফলে ফ্রন্টএন্ডে `sanitizeProduct` বাকি ফিল্ডগুলো `0` বা `null` করে পুরো টেবিলের স্টক ও দাম মুছে ফেলতো।
- **Mandatory Standard:**
  1. `AddProductModal.tsx` এডিট মোডে Simple Product-এর জন্য সমস্ত দাম (`currentPurchasePrice`, `retailPrice`, `wholesalePrice`), স্টক (`stockQuantity`, `lowStockAlert`), একক ও বারকোড এবং Variable Product-এর জন্য প্রতিটি ভ্যারিয়েন্টের পূর্ণাঙ্গ অ্যারে `UpdateProductDTO`-তে প্যাকেজ করবে।
  2. ব্যাকএন্ড `inventoryService.updateProduct` একটি একক পারমাণবিক ট্রানজ্যাকশনে (`prisma.$transaction`) প্যারেন্ট, ভ্যারিয়েন্ট ও প্যাকেজিং ইউনিট আপডেট করে সম্পূর্ণ রিলেশনাল গ্রাফ (`ProductWithDetails`) রিটার্ন করে।
  3. `useProductStore.ts`-এ স্টেট আপডেটে ব্যাকএন্ডের খাঁটি অবজেক্ট সরাসরি প্রতিস্থাপন করা হয়, কোনো আংশিক অগভীর স্প্রেড ওভাররাইট ছাড়াই।

### L. Database Consistency & Relational Integrity Guardrails (Frontend Responsibilities)
- **১. আংশিক DTO পাঠানো নিষিদ্ধ (No Partial Stripping):** কোনো ফর্ম বা মোডাল থেকে সাবমিট করার সময় বিদ্যমান চাইল্ড রিলেশন (যেমন: ভ্যারিয়েন্ট, বস্তা/কার্টনের রূপান্তর ইউনিট) ড্রপ করা যাবে না। সর্বদা সম্পূর্ণ অবজেক্ট DTO আকারে পাঠাতে হবে।
- **২. ডাবল সাবমিশন গার্ড (Idempotent POS Submissions):** দ্রুত কাউন্টার সেলসে ক্যাশিয়ার পরপর দুইবার ক্লিক করলেও যাতে দুটি ইনভয়েস তৈরি না হয় বা লেজারে ডাবল এন্ট্রি না পড়ে, সেজন্য `apiClient.ts`-এর রিকোয়েস্ট ডিডুপ্লিকেশন (Request Deduping Guard) বজায় রাখতে হবে।
- **৩. খাঁটি অবজেক্ট প্রতিস্থাপন (Full Object State Replacement):** মিউটেশন শেষে ব্যাকএন্ড থেকে ফিরে আসা রি-হাইড্রেটেড অবজেক্টটি সরাসরি Zustand স্টোরে প্রতিস্থাপন করতে হবে (`p.id === id ? updated : p`), যাতে কোনো অবহেলিত আংশিক স্প্রেড ওভাররাইট স্টেটের ডাটা নষ্ট করতে না পারে।
- **৪. অপরিবর্তনীয় লেজার ভিউ (Immutable Ledger UI):** কাস্টমার বা মহাজনের রানিং খাতার লেজার হিস্ট্রিতে কখনো কোনো 'Edit' বা 'Delete' বাটন থাকবে না। এটি শুধুমাত্র একটি নিরীক্ষিত রিড-অনলি অডিট লগ হিসেবে প্রদর্শিত হবে।
- **৫. শূন্য ফ্লোটিং পয়েন্ট লিক:** JSX বা কম্পোনেন্ট মেমরিতে ফ্লোটিং পয়েন্ট হিসাব (`price * qty`) না করে সেন্ট্রালাইজড `formatCurrency` ও `formatWeight` ব্যবহার করতে হবে।

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

---

## 4. Dedicated Full-Page Enterprise Routes & Recent Architectural Updates
1. **Dedicated Sub-Routes (2-Column Asymmetric + Full-Width Matrix):**
   - `/products/new` ও `/products/edit/[id]` — ৬-কার্ড মডুলার প্রোডাক্ট ক্রিয়েশন ও এডিট ফর্ম।
   - `/products/[id]` — পণ্য ৩৬০° প্রোফাইল, ভ্যারিয়েন্ট লাভ মার্জিন, ওয়েস্টেজ লগ, এবং Code128 SVG থার্মাল বারকোড স্টিকার জেনারেটর (`src/lib/barcode.ts`)।
   - `/purchases/new` ও `/purchases/[id]` — চালান এন্ট্রি ও মোকাম চালান ভাউচার (পণ্য নাম হাইড্রেশন `item.variant.product` সহ)।
   - `/khata/customers/[id]` ও `/khata/suppliers/[id]` — কাস্টমার/মহাজন রানিং লেজার স্টেটমেন্ট (`SALE_DUE`/`PURCHASE_DUE` ডিকোডিং ও ফাস্ট কালেকশন/পেমেন্ট)।
   - `/sales/[id]` ও `/sales/[id]/return` — বিক্রয় মেমো অডিট (চেঞ্জ ফেরত ডিসপ্লে সহ) ও স্টক রিস্টকিং রিটার্ন ওয়ার্কস্পেস।
2. **Currency Formatting Rule (`formatCurrency`):**
   - `src/lib/decimal.ts`-এর `formatCurrency()` ফাংশনটি ইতোমধ্যেই ফলাফলে `৳` চিহ্ন যোগ করে দেয়; তাই JSX-এ কখনোই `৳{formatCurrency(...)}` লেখা যাবে না (সরাসরি `{formatCurrency(...)}` ব্যবহার করতে হবে)।
3. **Minimal Editorial Shutter UI (`src/components/StoreShutterHero.tsx`):**
   - স্ক্যানলাইন ও অতিরিক্ত ব্যাজ/মাউস-স্ক্রোল প্রম্পট বাদ দিয়ে পরিষ্কার `bg-black/65` ওভারলে, বর্ডার্ড ইনফো স্ট্রিপ এবং একক `rounded-none` অ্যাম্বার অ্যাক্সেন্ট বাটন রাখা হয়েছে।
4. **6-Digit SKU Auto-Generation & Optional Scanner-Ready Barcode (`src/lib/skuGenerator.ts`):**
   - `/products/new`-তে সিম্পল পণ্যে অটো ৬-ডিজিট SKU (`684192`) বসে এবং ভ্যারিয়েন্ট প্রিসেটে বাংলা ওজন/প্যাক রূপান্তর হয়ে (`৫০০ গ্রাম` -> `684192-500G`, `১ কেজি` -> `684192-1KG`) জেনারেট হয় (`InventorySettingsCard.tsx`, `VariantsStockMatrixCard.tsx`)।
   - `বারকোড` ঘরটি ম্যানুয়াল POS ব্যবহারের জন্য ঐচ্ছিক রাখা হয়েছে; ভবিষ্যতে স্ক্যানার মেশিন যুক্ত হলে ফ্যাক্টরি বারকোড স্ক্যান বা SKU-ভিত্তিক Code128 স্টিকার দুটোই কাজ করবে।
5. **Unified Navy (`#1e4a7a`) Design System, Bangla Numerals & Shared Primitives Overhaul:**
   - **ডিজাইন টোকেন ও ফন্ট (`src/app/globals.css`):** প্রাইমারি ব্র্যান্ড Navy `#1e4a7a` (`brand-deep`, `brand-hover`, `brand-mid`, `brand-soft`, `brand-light`), অ্যান্টি-ফ্যাটিগ হাই-কন্ট্রাস্ট কালি (`ink-primary`, `ink-body`, `ink-secondary`, `ink-muted`), এবং `font-mono`-তে `var(--font-noto-sans-bengali)` ফলব্যাক যুক্ত করা হয়েছে।
   - **শেয়ার্ড UI প্রিমিটিভ ও ফরম্যাটার:** [`Button`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/components/ui/Button.tsx) (`buttonClasses` ভ্যারিয়েন্ট: `primary`, `secondary`, `wholesale`, `cash`, `danger`, `outlineDanger`, `ghost`), [`Badge`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/components/ui/Badge.tsx), [`Card`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/components/ui/Card.tsx), [`DashboardHeaderWithShutter`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/components/DashboardHeaderWithShutter.tsx), [`AdminPageHeader`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/components/shared/AdminPageHeader.tsx) (মোবাইলে অ্যাকশন র‍্যাপ করে শিরোনাম ট্রাঙ্কেশন রোধ), এবং `src/lib/decimal.ts`-এ `bn-BD` ফরম্যাটার (`toBanglaDigits`, `formatNumber`, `formatCompactTaka`, `formatPercent`, `formatDateBn`, `formatTimeBn` ও `formatDateTimeBn` বাংলা সময়-পর্ব `সকাল/দুপুর/বিকেল/সন্ধ্যা/রাত` সহ) যুক্ত করা হয়েছে।
   - **ক্লিনআপ ও UI স্ট্যান্ডার্ড:** ব্যবহৃত নয় এমন ৭টি লিগ্যাসি প্রোটোটাইপ কম্পোনেন্ট (`CartPanel.tsx`, `CustomerView.tsx`, `Header.tsx`, `InventoryView.tsx`, `POSClientApp.tsx`, `ProductGrid.tsx`, `ReceiptModal.tsx`) অপসারণ করা হয়েছে; সমস্ত সক্রিয় পেজ ও মোডাল থেকে `purple-*`/`indigo-*` (পাইকারি শুধুমাত্র Amber), `bg-slate-900` কম্পিটিং CTA, `< 12px` স্ক্রিন টেক্সট এবং বাংলা লেখায় `uppercase tracking-wider` সম্পূর্ণ দূর করা হয়েছে।
6. **P0 Accessibility, Semantic Dialogs & Single-Tree POS DOM (`src/components/shared/AccessibleDialog.tsx`):**
   - **সেন্ট্রালাইজড ডায়ালগ হুক (`useDialogAccessibility`):** সমস্ত সক্রিয় মোডাল ও ড্রয়ারে `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `Escape`-টু-ক্লোজ, `Tab`/`Shift+Tab` ফোকাস ট্র্যাপ, বডি স্ক্রল লক, ফোকাস রেস্টোরেশন ও আইকন-অনলি ক্লোজ বাটনে `aria-label` যুক্ত করা হয়েছে।
   - **সিঙ্গেল-ট্রি POS লেআউট (`src/app/pos/page.tsx`):** ডুয়াল মাউন্ট ও ডুপ্লিকেট `#pos-search-input` / `#pos-paid-amount-input` DOM ID দূর করে একক রেসপন্সিভ DOM ট্রি ব্যবহার করা হয়েছে।
   - **ফর্ম লেবেল ও আইকন-অনলি কন্ট্রোল:** সক্রিয় ফর্ম কার্ড, মোডাল, টেবিল ও হেডারগুলোতে `useId()` দিয়ে `<label htmlFor>` + `id` সংযোগ এবং আইকন-অনলি বাটন ও লিঙ্কে `aria-label` যোগ করা হয়েছে।
7. **P1–P3 Dead Code Removal, Global Feedback (`Toast`/`ConfirmDialog`), Semantic Theming & Motion Polish:**
   - **অব্যবহৃত লিগ্যাসি ফাইল অপসারণ (৮টি):** `AddProductModal.tsx`, `AddUnitModal.tsx`, `PackagingUnitsCard.tsx` (`FormUnitItem` `product.types.ts`-এ স্থানান্তরিত), `ChallanItemEntry.tsx`, `ChallanHeaderForm.tsx`, `ChallanSummarySettlement.tsx`, `PurchaseDetailModal.tsx` এবং `ChallanItemsTable.tsx` মুছে ফেলা হয়েছে।
   - **নেটিভ `alert()` / `confirm()` প্রতিস্থাপন (`src/lib/feedback.ts` ও `src/components/shared/AppProviders.tsx`):** Zustand-ভিত্তিক `toast` (`success`/`error`/`warning`/`info`) এবং অ্যাক্সেসিবল `confirmAction` (`role="alertdialog"`, `Escape` ক্লোজ ও ফোকাস ট্র্যাপ সহ) যোগ করে সমস্ত সক্রিয় ফাইল ও স্টোর থেকে নেটিভ ব্রাউজার ডায়ালগ দূর করা হয়েছে।
   - **মোশন, টাচ টার্গেট ও টোকেন কনসিস্টেন্সি:** রুট লেআউটে `<MotionConfig reducedMotion="user">` ও `globals.css`-এ `@keyframes enterFadeZoom` + `@media (prefers-reduced-motion: reduce)` যুক্ত হয়েছে; `--font-mono` থেকে `"Inter"` সরানো হয়েছে; স্টিকি হেডার থেকে `backdrop-blur-*` সরিয়ে সলিড `bg-surface-card` করা হয়েছে; POS কার্ট স্টেপার ও রিভার্স মোডাল ক্লোজ বাটনের টাচ টার্গেট `40×40px` (`w-10 h-10`) করা হয়েছে এবং ৪২+ সক্রিয় ফাইলের হার্ডকোডেড `slate-*` ও `bg-white` ক্লাস `@theme inline` টোকেনে রূপান্তর করা হয়েছে।
8. **`.impeccable.md` Context ও লাইট-অনলি সেমান্টিক থিম পোলিশ:**
   - রুট ডিরেক্টরিতে [`../.impeccable.md`](../.impeccable.md) তৈরি করে প্রজেক্টের ডোমেইন, অ্যান্টি-স্লপ নিয়ম, কালার টোকেন ও অ্যাক্সেসিবিলিটি মানদণ্ড নথিভুক্ত করা হয়েছে।
   - দোকানের দিনের আলোয় কাউন্টার ব্যবহারের জন্য কেবল লাইট থিম (`--color-surface-card: #fcfdff`, `--color-success: #047857`) রাখা হয়েছে (ডার্ক মোড ও থিম টগল অপসারিত), এবং সমস্ত সক্রিয় কম্পোনেন্টের হার্ডকোডেড `emerald`/`rose`/`amber`/`sky` ক্লাস `cash`/`due`/`wholesale`/`brand` সেমান্টিক টোকেনে রূপান্তরিত হয়েছে।
9. **Balanced Frosted Chrome & Crisp Daylight Polish (`globals.css`):**
   - শুধু ফ্লোটিং ও স্টিকি লেয়ারে পরিমিত frosted glass (`.surface-glass-header` স্টিকি হেডার ও মোবাইল বটম নেভিগেশনে, `.surface-glass-popover` ড্রপডাউন/পপওভার/টোস্টে, `.modal-backdrop-frosted` মোডাল/ড্রয়ার ব্যাকড্রপে) এবং `.surface-card-crisp` কার্ড ও KPI কার্ডে যুক্ত করা হয়েছে—POS প্রোডাক্ট গ্রিড, কার্ট, টেবিল, ইনপুট ও প্রিন্ট রসিদ সলিড ও উচ্চ-কনট্রাস্টে রাখা হয়েছে।
10. **নেটিভ `<select>` সম্পূর্ণ অপসারণ (`CustomSelect`) ও রঙ-একীভবন:**
   - মডাল (`RecordWastageModal`, `ExpenseEditModal`) এবং ফর্ম/প্রোফাইল পেজ (`TaxonomyCard`, `ProductProfile360Client`) থেকে সমস্ত নেটিভ `<select>` সরিয়ে [`CustomSelect`](file:///home/mahady-hasan/Desktop/idris-brothers/frontend/src/components/shared/CustomSelect.tsx) (`id` সাপোর্ট ও মডাল-সেফ `Escape` হ্যান্ডলিং সহ) ব্যবহার করা হয়েছে। পাশাপাশি অবশিষ্ট `text-red-500`/`text-rose-500`/`text-amber-950` টোকেনগুলোকে `text-danger`/`text-wholesale-text`-এ আনা হয়েছে (মাল্টি-কালার বা রেনবো প্যাস্টেল ব্যাকগ্রাউন্ড = `০`টি)।
