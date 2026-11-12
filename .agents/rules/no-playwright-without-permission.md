---
description: Strictly forbid running Playwright, Playwright MCP, headless Chromium, or browser E2E scripts unless the user explicitly asks in the current prompt.
trigger: always_on
---

# STRICT RULE: NO PLAYWRIGHT WITHOUT EXPLICIT USER PERMISSION

**আমি (ইউজার) স্পষ্টভাবে না বলা পর্যন্ত কখনোই Playwright রান করবে না।**

## বাধ্যতামূলক নির্দেশনা

1. **কখনো নিজ থেকে Playwright চালাবে না:**
   - কোনো কোড এডিট, UI পরিবর্তন, বাগ ফিক্স, বা ডাটাবেজ আপডেট করার পর নিজ উদ্যোগে ("যাচাই করার জন্য") কোনো Playwright স্ক্রিপ্ট (`playwright`, `chromium`, `verify_*.js`, `npx playwright`, Playwright MCP, বা হেডলেস ব্রাউজার) চালানো **সম্পূর্ণ নিষিদ্ধ**।
2. **কখন চালানো যাবে:**
   - শুধুমাত্র ইউজার যখন সরাসরি ও স্পষ্টভাবে বলবেন (যেমন: *"Playwright দিয়ে চেক করো"*, *"Playwright চালাও"*, *"ব্রাউজার টেস্ট করো"*), **কেবল তখনই** Playwright চালানো যাবে।
   - একবার অনুমতি দিলে তা শুধু সেই অনুরোধের জন্যই প্রযোজ্য; পরবর্তী অন্য কোনো পরিবর্তনের পর আবার নিজে থেকে Playwright চালানো যাবে না যতক্ষণ না ইউজার নতুন করে বলেন।
3. **বিকল্প স্বাভাবিক যাচাই:**
   - ইউজার Playwright চালাতে না বললে, কোড পরিবর্তনের পর কেবল হালকা ও নিরাপদ চেক ব্যবহার করো:
     - `npx tsc --noEmit` (TypeScript চেক)
     - `npm run build` (প্রোডাকশন বিল্ড চেক, প্রয়োজন হলে)
     - বা API/DB চেকের জন্য সাধারণ `curl` (কোনো ব্রাউজার চালু না করে)।
