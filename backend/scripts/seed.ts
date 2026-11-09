import { PrismaClient, SaleType, CustomerLedgerType, SupplierLedgerType, ExpenseCategory, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Feni Bazar Morichpotti Store with Retail ERP (Product -> Variant -> UnitMaster)...\n');

  // 1. Clean existing records in reverse dependency order
  await prisma.dailyExpense.deleteMany();
  await prisma.stockWastage.deleteMany();
  await prisma.supplierLedger.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customerLedger.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.variantUnit.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.unitMaster.deleteMany();

  // 2. Seed Dynamic UnitMaster Catalog
  const unitNames = [
    { name: 'কেজি', banglaName: 'কিলোগ্রাম', category: 'WEIGHT', isDefault: true },
    { name: 'গ্রাম', banglaName: 'গ্রাম', category: 'WEIGHT', isDefault: true },
    { name: 'প্যাকেট', banglaName: 'সিলগালা প্যাকেট', category: 'PACKAGING', isDefault: true },
    { name: 'পিস', banglaName: 'পিস / সংখ্যা', category: 'COUNT', isDefault: true },
    { name: 'বোতল', banglaName: 'বোতল', category: 'PACKAGING', isDefault: false },
    { name: 'লিটার', banglaName: 'লিটার', category: 'VOLUME', isDefault: true },
    { name: 'হালি', banglaName: 'হালি (৪ পিস)', category: 'COUNT', isDefault: false },
    { name: 'ডজন', banglaName: 'ডজন (১২ পিস)', category: 'COUNT', isDefault: false },
    { name: 'পাতা', banglaName: 'পাতা / স্ট্রিপ', category: 'PACKAGING', isDefault: false },
    { name: 'ফিতা', banglaName: 'ফিতা', category: 'PACKAGING', isDefault: false },
    { name: 'বস্তা', banglaName: 'বস্তা', category: 'PACKAGING', isDefault: false },
    { name: 'কার্টন', banglaName: 'কার্টন / পেটি', category: 'PACKAGING', isDefault: false },
    { name: 'পাল্লা', banglaName: 'পাল্লা (৫ কেজি)', category: 'WEIGHT', isDefault: false },
    { name: 'টিন', banglaName: 'টিন / ড্রাম', category: 'PACKAGING', isDefault: false },
  ];

  await prisma.unitMaster.createMany({ data: unitNames });
  console.log(`✔ Created ${unitNames.length} dynamic store units in UnitMaster`);

  // 3. Seed Categories & Brands
  const catSpices = await prisma.category.create({
    data: { name: 'মসলা', banglaName: 'খাঁটি মসলা ও আড়ত আইটেম', slug: 'spices' },
  });
  const catRice = await prisma.category.create({
    data: { name: 'চাল ও ডাল', banglaName: 'চাল, ডাল ও খাদ্যশস্য', slug: 'rice-grains' },
  });
  const catDairy = await prisma.category.create({
    data: { name: 'দুধ ও দুগ্ধজাত', banglaName: 'গুঁড়া দুধ ও দুগ্ধজাত সামগ্রী', slug: 'dairy' },
  });
  const catOil = await prisma.category.create({
    data: { name: 'তেল ও ঘি', banglaName: 'ভোজ্য তেল ও খাঁটি ঘি', slug: 'oil-ghee' },
  });

  const brandDano = await prisma.brand.create({
    data: { name: 'Dano', banglaName: 'ডানো' },
  });
  const brandTeer = await prisma.brand.create({
    data: { name: 'Teer', banglaName: 'তীর (সিটি গ্রুপ)' },
  });
  const brandFresh = await prisma.brand.create({
    data: { name: 'Fresh', banglaName: 'ফ্রেশ (মেঘনা গ্রুপ)' },
  });

  console.log('✔ Created standard store categories & brands');

  // 4. Seed Products & ProductVariants (Simple Products & Variable Products)
  // 4.1 Simple Product: এলাচ (Loose Micro-Spice, allowDecimalQty: true)
  const cardamom = await prisma.product.create({
    data: {
      name: 'সবুজ এলাচ (গুয়াতেমালা বোল্ড)',
      banglaName: 'খাঁটি গুয়াতেমালা সবুজ এলাচ',
      categoryId: catSpices.id,
      hasVariants: false,
      variants: {
        create: [
          {
            variantName: 'Default',
            sku: 'ELACHI-GUAT-01',
            barcode: '8941002001',
            baseUnitName: 'কেজি',
            allowDecimalQty: true, // ২০ টাকার এলাচ বা ০.০২৫ কেজি বিক্রি সম্ভব
            attributes: { origin: 'Guatemala', grade: 'Jumbo Bold' },
            stockQuantity: new Prisma.Decimal('15.0000'), // 15 KG
            lowStockAlert: new Prisma.Decimal('2.0000'),
            currentPurchasePrice: new Prisma.Decimal('3100.00'), // ৳3,100/KG
            retailPrice: new Prisma.Decimal('3500.00'),          // ৳3,500/KG
            wholesalePrice: new Prisma.Decimal('3250.00'),       // ৳3,250/KG
            units: {
              create: [
                {
                  unitName: '১০০ গ্রাম প্যাকেট',
                  conversionFactor: new Prisma.Decimal('0.1000'),
                  retailPrice: new Prisma.Decimal('360.00'),
                  wholesalePrice: new Prisma.Decimal('330.00'),
                },
                {
                  unitName: '৫০ গ্রাম প্যাকেট',
                  conversionFactor: new Prisma.Decimal('0.0500'),
                  retailPrice: new Prisma.Decimal('185.00'),
                  wholesalePrice: new Prisma.Decimal('170.00'),
                },
              ],
            },
          },
        ],
      },
    },
    include: { variants: { include: { units: true } } },
  });

  // 4.2 Simple Product: শুকনা মরিচ (Bulk Sack, allowDecimalQty: true)
  const chili = await prisma.product.create({
    data: {
      name: 'শুকনা মরিচ (পঞ্চগড়)',
      banglaName: 'পঞ্চগড়ের বোম্বাই শুকনা মরিচ',
      categoryId: catSpices.id,
      hasVariants: false,
      variants: {
        create: [
          {
            variantName: 'Default',
            sku: 'CHILI-PAN-01',
            barcode: '8941002004',
            baseUnitName: 'কেজি',
            allowDecimalQty: true,
            attributes: { origin: 'পঞ্চগড়', heat: 'Extra Spicy' },
            stockQuantity: new Prisma.Decimal('250.0000'),
            lowStockAlert: new Prisma.Decimal('25.0000'),
            currentPurchasePrice: new Prisma.Decimal('320.00'),
            retailPrice: new Prisma.Decimal('360.00'),
            wholesalePrice: new Prisma.Decimal('335.00'),
            units: {
              create: [
                {
                  unitName: '৫০ কেজি বস্তা',
                  conversionFactor: new Prisma.Decimal('50.0000'),
                  retailPrice: new Prisma.Decimal('17500.00'),
                  wholesalePrice: new Prisma.Decimal('16750.00'),
                },
                {
                  unitName: '৫ কেজি পাল্লা',
                  conversionFactor: new Prisma.Decimal('5.0000'),
                  retailPrice: new Prisma.Decimal('1775.00'),
                  wholesalePrice: new Prisma.Decimal('1675.00'),
                },
              ],
            },
          },
        ],
      },
    },
    include: { variants: { include: { units: true } } },
  });

  // 4.3 Multi-Variant Product: ডানো মিল্ক পাউডার (Multiple Sizes, allowDecimalQty: false)
  const danoMilk = await prisma.product.create({
    data: {
      name: 'ডানো ফুল ক্রিম গুঁড়া দুধ',
      banglaName: 'ডানো ফুলক্রিম মিল্ক পাউডার',
      categoryId: catDairy.id,
      brandId: brandDano.id,
      hasVariants: true,
      variants: {
        create: [
          {
            variantName: '৫০০ গ্রাম প্যাকেট',
            sku: 'DANO-500G',
            barcode: '8941002003',
            baseUnitName: 'প্যাকেট',
            allowDecimalQty: false, // প্যাকেট ভগ্নাংশে বিক্রি নিষিদ্ধ
            attributes: { netWeight: '500g', packaging: 'Foil Pouch' },
            stockQuantity: new Prisma.Decimal('120.0000'),
            lowStockAlert: new Prisma.Decimal('24.0000'),
            currentPurchasePrice: new Prisma.Decimal('420.00'),
            retailPrice: new Prisma.Decimal('460.00'),
            wholesalePrice: new Prisma.Decimal('435.00'),
            units: {
              create: [
                {
                  unitName: 'কার্টন (২৪ প্যাকেট)',
                  conversionFactor: new Prisma.Decimal('24.0000'),
                  retailPrice: new Prisma.Decimal('10920.00'),
                  wholesalePrice: new Prisma.Decimal('10440.00'),
                  isDefault: true,
                },
              ],
            },
          },
          {
            variantName: '১ কেজি প্যাকেট',
            sku: 'DANO-1KG',
            barcode: '8941002007',
            baseUnitName: 'প্যাকেট',
            allowDecimalQty: false,
            attributes: { netWeight: '1000g', packaging: 'Foil Pouch' },
            stockQuantity: new Prisma.Decimal('60.0000'),
            lowStockAlert: new Prisma.Decimal('12.0000'),
            currentPurchasePrice: new Prisma.Decimal('820.00'),
            retailPrice: new Prisma.Decimal('890.00'),
            wholesalePrice: new Prisma.Decimal('850.00'),
            units: {
              create: [
                {
                  unitName: 'কার্টন (১২ প্যাকেট)',
                  conversionFactor: new Prisma.Decimal('12.0000'),
                  retailPrice: new Prisma.Decimal('10560.00'),
                  wholesalePrice: new Prisma.Decimal('10200.00'),
                  isDefault: true,
                },
              ],
            },
          },
        ],
      },
    },
    include: { variants: { include: { units: true } } },
  });

  console.log(`✔ Created store products with variants:`);
  console.log(`  - ${cardamom.name} (${cardamom.variants[0].variantName})`);
  console.log(`  - ${chili.name} (${chili.variants[0].variantName})`);
  console.log(`  - ${danoMilk.name} (${danoMilk.variants.length} Variants: 500g, 1KG)`);

  // 5. Seed Customers with Running Khata
  const customer1 = await prisma.customer.create({
    data: {
      name: 'হাজী রফিকুল ইসলাম',
      phone: '01811223344',
      address: 'কাচারী রোড, ফেনী সদর',
      customerType: SaleType.RETAIL,
      currentDue: new Prisma.Decimal('1500.00'),
      ledger: {
        create: [
          {
            entryType: CustomerLedgerType.OPENING_BALANCE,
            debit: new Prisma.Decimal('1500.00'),
            credit: new Prisma.Decimal('0.00'),
            balanceAfter: new Prisma.Decimal('1500.00'),
            note: 'পূর্বের খাতার বকেয়া হিসাব শুরু',
          },
        ],
      },
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'ভাই ভাই স্টোর (ছাগলনাইয়া বাজার)',
      phone: '01722334455',
      address: 'ছাগলনাইয়া বাজার, ফেনী',
      customerType: SaleType.WHOLESALE,
      currentDue: new Prisma.Decimal('12500.00'),
      ledger: {
        create: [
          {
            entryType: CustomerLedgerType.OPENING_BALANCE,
            debit: new Prisma.Decimal('12500.00'),
            credit: new Prisma.Decimal('0.00'),
            balanceAfter: new Prisma.Decimal('12500.00'),
            note: 'পাইকারি চালানের পূর্বের বকেয়া হিসাব শুরু',
          },
        ],
      },
    },
  });

  console.log(`\n✔ Created 2 Customers with running balance:`);
  console.log(`  - ${customer1.name} | Due: ৳${customer1.currentDue}`);
  console.log(`  - ${customer2.name} | Due: ৳${customer2.currentDue}`);

  // 6. Seed Suppliers (Mahajans)
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'হাজী মোজাম্মেল হক',
      companyName: 'মেসার্স হাজী বাণিজ্যালয় (খাতুনগঞ্জ আড়ত, চট্টগ্রাম)',
      phone: '01711998877',
      address: 'খাতুনগঞ্জ, কোতোয়ালী, চট্টগ্রাম',
      currentPayable: new Prisma.Decimal('65000.00'),
      ledger: {
        create: [
          {
            entryType: SupplierLedgerType.OPENING_BALANCE,
            credit: new Prisma.Decimal('65000.00'),
            debit: new Prisma.Decimal('0.00'),
            balanceAfter: new Prisma.Decimal('65000.00'),
            note: 'চট্টগ্রাম খাতুনগঞ্জ আড়তের পূর্বের দেনা হিসাব শুরু',
          },
        ],
      },
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'আরিফুল ইসলাম (ডিলার)',
      companyName: 'আড়ং ও ডানো ডিস্ট্রিবিউশন ফেনী',
      phone: '01822887766',
      address: 'বড় বাজার, ফেনী',
      currentPayable: new Prisma.Decimal('35000.00'),
      ledger: {
        create: [
          {
            entryType: SupplierLedgerType.OPENING_BALANCE,
            credit: new Prisma.Decimal('35000.00'),
            debit: new Prisma.Decimal('0.00'),
            balanceAfter: new Prisma.Decimal('35000.00'),
            note: 'ডানো ডিস্ট্রিবিউটরের পূর্বের দেনা হিসাব শুরু',
          },
        ],
      },
    },
  });

  console.log(`\n✔ Created 2 Suppliers / Mahajans:`);
  console.log(`  - ${supplier1.name} [${supplier1.companyName}] | Store Debt: ৳${supplier1.currentPayable}`);
  console.log(`  - ${supplier2.name} [${supplier2.companyName}] | Store Debt: ৳${supplier2.currentPayable}`);

  // 7. Seed Daily Expenses
  const exp1 = await prisma.dailyExpense.create({
    data: {
      category: ExpenseCategory.LABOR_KULI,
      amount: new Prisma.Decimal('750.00'),
      description: 'ট্রাক থেকে মরিচের বস্তা খালাস কুলি বিল',
    },
  });

  const exp2 = await prisma.dailyExpense.create({
    data: {
      category: ExpenseCategory.TEA_SNACKS,
      amount: new Prisma.Decimal('140.00'),
      description: 'দোকানের চা-বিস্কুট ও মেহমানদারি',
    },
  });

  console.log(`\n✔ Created 2 Store Daily Expenses:`);
  console.log(`  - [${exp1.category}] ${exp1.description} | ৳${exp1.amount}`);
  console.log(`  - [${exp2.category}] ${exp2.description} | ৳${exp2.amount}`);

  console.log('\nSeed completed successfully for Idris Brothers (Retail ERP Architecture)!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
