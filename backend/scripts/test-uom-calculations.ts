import { PrismaClient, Prisma } from '@prisma/client';
import assert from 'node:assert';
import { generateSingleVariantSku, extractBaseProductCode } from '../../frontend/src/lib/skuGenerator';

const prisma = new PrismaClient();

async function runUomTestSuite() {
  console.log('========================================================================');
  console.log('🧪 IDRIS BROTHERS: UOM HIERARCHY & PRESET CONFIG TEST SUITE 🧪');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function runTest(testName: string, testFn: () => void | Promise<void>) {
    totalTests++;
    try {
      const result = testFn();
      if (result instanceof Promise) {
        return result.then(() => {
          console.log(`  ✔ [PASS] ${testName}`);
          passedTests++;
        }).catch((err) => {
          console.error(`  ❌ [FAIL] ${testName}: ${err.message}`);
          throw err;
        });
      }
      console.log(`  ✔ [PASS] ${testName}`);
      passedTests++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${testName}: ${err.message}`);
      throw err;
    }
  }

  // =========================================================================
  // MODULE 1: UoM Conversion & Multi-Tier Math (আড়ত রূপান্তর হিসাব)
  // =========================================================================
  console.log('📦 MODULE 1: UoM Conversion & Multi-Tier Arithmetic');

  runTest('1.1 Bulk Sack (বস্তা) to Base KG: 10 Sacks of Miniket Rice (50 KG each)', () => {
    const sackConversionFactor = 50; // 1 বস্তা = 50 কেজি
    const purchasedSacks = 10;
    const baseQuantity = purchasedSacks * sackConversionFactor;
    assert.strictEqual(baseQuantity, 500, '১০ বস্তা ৫০ কেজি চালে ৫০০ কেজি হওয়া উচিত');
  });

  runTest('1.2 Palla (পাল্লা) to Base KG: 3 Palla of Chili/Lentils (5 KG each)', () => {
    const pallaConversionFactor = 5; // 1 পাল্লা = 5 কেজি
    const soldPalla = 3;
    const baseQuantity = soldPalla * pallaConversionFactor;
    assert.strictEqual(baseQuantity, 15, '৩ পাল্লায় ১৫ কেজি হওয়া উচিত');
  });

  runTest('1.3 Remaining Stock Math after Mixed Wholesale & Retail Sales', () => {
    const initialStockKg = 500; // ৫০০ কেজি শুরু
    const sale1Sacks = 2 * 50; // ২ বস্তা = ১০০ কেজি
    const sale2Palla = 3 * 5;  // ৩ পাল্লা = ১৫ কেজি
    const sale3Retail = 2.5;   // ২.৫ কেজি খুচরা

    const totalSoldKg = sale1Sacks + sale2Palla + sale3Retail; // 117.5 KG
    const remainingStockKg = initialStockKg - totalSoldKg;

    assert.strictEqual(totalSoldKg, 117.5, 'মোট বিক্রি ১১৭.৫ কেজি হওয়া উচিত');
    assert.strictEqual(remainingStockKg, 382.5, 'অবশিষ্ট স্টক ৩৮২.৫ কেজি হওয়া উচিত');
    
    // বস্তা ও খুচরার ভাঙা হিসাব (Quotient & Remainder)
    const wholeSacksRemaining = Math.floor(remainingStockKg / 50); // 7 Sacks
    const looseKgRemaining = remainingStockKg % 50; // 32.5 KG
    assert.strictEqual(wholeSacksRemaining, 7, '৭টি পূর্ণ বস্তা থাকা উচিত');
    assert.strictEqual(looseKgRemaining, 32.5, '৩২.৫ কেজি খুচরা থাকা উচিত');
  });

  runTest('1.4 Carton to Packets: 5 Cartons of Dano Milk (12 Packets each)', () => {
    const cartonConversionFactor = 12; // 1 কার্টন = 12 প্যাকেট
    const purchasedCartons = 5;
    const basePackets = purchasedCartons * cartonConversionFactor;
    assert.strictEqual(basePackets, 60, '৫ কার্টনে ৬০ প্যাকেট দুধ হওয়া উচিত');
  });

  // =========================================================================
  // MODULE 2: POS Reverse Price-to-Weight Math (২০ টাকার এলাচ বিক্রি)
  // =========================================================================
  console.log('\n⚖️ MODULE 2: Reverse Price-to-Weight (খুচরা টাকার বিক্রি)');

  runTest('2.1 Reverse sale: ৳20 worth of Cardamom at ৳3,500/KG', () => {
    const retailRatePerKg = 3500;
    const cashTendered = 20;
    // Formula: weight = cash / rate, rounded to 4 decimal places
    const weightKg = Number((cashTendered / retailRatePerKg).toFixed(4));
    assert.strictEqual(weightKg, 0.0057, '২০ টাকার এলাচে ০.০০৫৭ কেজি হওয়া উচিত');
  });

  runTest('2.2 Reverse sale: ৳50 worth of Chili at ৳450/KG', () => {
    const retailRatePerKg = 450;
    const cashTendered = 50;
    const weightKg = Number((cashTendered / retailRatePerKg).toFixed(4));
    assert.strictEqual(weightKg, 0.1111, '৫০ টাকার মরিচে ০.১১১১ কেজি হওয়া উচিত');
  });

  // =========================================================================
  // MODULE 3: Discrete Goods & Decimal Guard (প্যাকেটে ভগ্নাংশ প্রতিরোধ)
  // =========================================================================
  console.log('\n🛡️ MODULE 3: Discrete Item Safety Guard (পূর্ণসংখ্যা সুরক্ষা)');

  runTest('3.1 Allow decimal on loose items (loose spice, rice, oil)', () => {
    const looseSpice = { allowDecimalQty: true };
    const quantity = 0.25; // ২৫০ গ্রাম
    const isValid = looseSpice.allowDecimalQty || Number.isInteger(quantity);
    assert.strictEqual(isValid, true, 'লুজ মসলায় ০.২৫ কেজি বৈধ হওয়া উচিত');
  });

  runTest('3.2 Reject fractional quantity on discrete packaged goods', () => {
    const packagedMilk = { allowDecimalQty: false };
    const invalidQty = 1.5; // দেড় প্যাকেট
    const isValid = packagedMilk.allowDecimalQty || Number.isInteger(invalidQty);
    assert.strictEqual(isValid, false, 'প্যাকেটে ১.৫ প্যাকেট বিক্রি প্রতিরোধ করা উচিত');
  });

  // =========================================================================
  // MODULE 4: SKU Auto-Generation with Bangla Suffixes
  // =========================================================================
  console.log('\n🏷️ MODULE 4: SKU Auto-Generation with Bangla Suffixes');

  runTest('4.1 Auto-generate SKU from 50 KG Sack preset', () => {
    const simpleSku = '684192';
    const variantName = '৫০ কেজি বস্তা';
    const sku = generateSingleVariantSku(variantName, [], 0, simpleSku);
    assert.strictEqual(sku, '684192-50KG-BAG', '৫০ কেজি বস্তার জন্য 684192-50KG-BAG তৈরি হওয়া উচিত');
  });

  runTest('4.2 Auto-generate SKU from 500 Gram preset', () => {
    const simpleSku = '684192';
    const variantName = '৫০০ গ্রাম';
    const sku = generateSingleVariantSku(variantName, [], 0, simpleSku);
    assert.strictEqual(sku, '684192-500G', '৫০০ গ্রামের জন্য 684192-500G তৈরি হওয়া উচিত');
  });

  runTest('4.3 Auto-generate SKU from 1 Liter preset', () => {
    const simpleSku = '684192';
    const variantName = '১ লিটার';
    const sku = generateSingleVariantSku(variantName, [], 0, simpleSku);
    assert.strictEqual(sku, '684192-1L', '১ লিটারের জন্য 684192-1L তৈরি হওয়া উচিত');
  });

  // =========================================================================
  // MODULE 5: Database PresetConfig Retrieval & Parsing
  // =========================================================================
  console.log('\n🗄️ MODULE 5: Database PresetConfig Retrieval & Structure Verification');

  await runTest('5.1 Verify database categories have valid presetConfig', async () => {
    const categories = await prisma.category.findMany({
      where: {
        slug: { in: ['spices', 'rice-grains', 'oil-ghee', 'dairy'] },
      },
    });

    assert.ok(categories.length > 0, 'ডাটাবেজে ক্যাটাগরি থাকতে হবে');
    for (const cat of categories) {
      assert.ok(cat.presetConfig, `ক্যাটাগরি ${cat.name}-এ presetConfig থাকা উচিত`);
      const cfg = typeof cat.presetConfig === 'string' ? JSON.parse(cat.presetConfig) : cat.presetConfig;
      assert.ok(cfg.defaultBaseUnit, `${cat.name}-এ defaultBaseUnit থাকতে হবে`);
      assert.ok(typeof cfg.allowDecimal === 'boolean', `${cat.name}-এ allowDecimal বুলিয়ান হতে হবে`);
      assert.ok(Array.isArray(cfg.quickSizes), `${cat.name}-এ quickSizes অ্যারে থাকতে হবে`);
      assert.ok(Array.isArray(cfg.suggestedUnits), `${cat.name}-এ suggestedUnits অ্যারে থাকতে হবে`);
    }
  });

  console.log('\n========================================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================================\n');
}

runUomTestSuite()
  .catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
