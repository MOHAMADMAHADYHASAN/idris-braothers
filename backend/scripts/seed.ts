import { PrismaClient, SaleType, CustomerLedgerType, SupplierLedgerType, ExpenseCategory, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Feni Bazar Morichpotti Store with 100% Dynamic Units & Micro-Spices...\n');

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
  await prisma.productUnit.deleteMany();
  await prisma.product.deleteMany();
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

  // 3. Seed High-Value Spices & Grocery Products
  // 3.1 High-Value Micro-Spices (এলাচ, দারুচিনি, লবঙ্গ)
  const cardamom = await prisma.product.create({
    data: {
      name: 'সবুজ এলাচ (গুয়াতেমালা বোল্ড)',
      banglaName: 'খাঁটি গুয়াতেমালা সবুজ এলাচ',
      sku: 'ELACHI-GUAT-01',
      barcode: '8941002001',
      category: 'মসলা',
      baseUnitName: 'কেজি',
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
  });

  const cinnamon = await prisma.product.create({
    data: {
      name: 'দারুচিনি (ভিয়েতনামি রোল)',
      banglaName: 'ভিয়েতনামি মিষ্টি দারুচিনি',
      sku: 'CINNAMON-VIET-01',
      barcode: '8941002002',
      category: 'মসলা',
      baseUnitName: 'কেজি',
      stockQuantity: new Prisma.Decimal('40.0000'),
      lowStockAlert: new Prisma.Decimal('5.0000'),
      currentPurchasePrice: new Prisma.Decimal('480.00'),
      retailPrice: new Prisma.Decimal('560.00'),
      wholesalePrice: new Prisma.Decimal('510.00'),
    },
  });

  // 3.2 Pre-Packaged Items (Packets are baseUnitName, cartons have dynamic capacities)
  const dano500g = await prisma.product.create({
    data: {
      name: 'ডানো মিল্ক পাউডার ৫০০ গ্রাম প্যাকেট',
      banglaName: 'ডানো ফুলক্রিম গুঁড়া দুধ ৫০০ গ্রাম',
      sku: 'DANO-MILK-500G',
      barcode: '8941002003',
      category: 'দুধ ও গুঁড়া দুধ',
      baseUnitName: 'প্যাকেট', // Base unit strictly PACKET!
      stockQuantity: new Prisma.Decimal('120.0000'), // 120 packets
      lowStockAlert: new Prisma.Decimal('24.0000'),
      currentPurchasePrice: new Prisma.Decimal('420.00'), // ৳420 per packet
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
  });

  // 3.3 Bulk Loose Commodities (শুকনা মরিচ, পেঁয়াজ)
  const chili = await prisma.product.create({
    data: {
      name: 'শুকনা মরিচ (পঞ্চগড়)',
      banglaName: 'পঞ্চগড়ের বোম্বাই শুকনা মরিচ',
      sku: 'CHILI-PAN-01',
      barcode: '8941002004',
      category: 'মসলা',
      baseUnitName: 'কেজি',
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
  });

  const onion = await prisma.product.create({
    data: {
      name: 'দেশি পেঁয়াজ (ফরিদপুর)',
      banglaName: 'ফরিদপুরের দেশি পেঁয়াজ',
      sku: 'ONION-FAR-01',
      barcode: '8941002005',
      category: 'পেঁয়াজ-রসুন',
      baseUnitName: 'কেজি',
      stockQuantity: new Prisma.Decimal('500.0000'),
      lowStockAlert: new Prisma.Decimal('50.0000'),
      currentPurchasePrice: new Prisma.Decimal('85.00'),
      retailPrice: new Prisma.Decimal('100.00'),
      wholesalePrice: new Prisma.Decimal('92.00'),
      units: {
        create: [
          {
            unitName: '৪০ কেজি বস্তা',
            conversionFactor: new Prisma.Decimal('40.0000'),
            retailPrice: new Prisma.Decimal('3900.00'),
            wholesalePrice: new Prisma.Decimal('3680.00'),
          },
          {
            unitName: '৫ কেজি পাল্লা',
            conversionFactor: new Prisma.Decimal('5.0000'),
            retailPrice: new Prisma.Decimal('490.00'),
            wholesalePrice: new Prisma.Decimal('460.00'),
          },
        ],
      },
    },
  });

  console.log(`✔ Created 5 store products:`);
  console.log(`  1. ${cardamom.name} | Stock: ${cardamom.stockQuantity} ${cardamom.baseUnitName} | Cost: ৳${cardamom.currentPurchasePrice}`);
  console.log(`  2. ${cinnamon.name} | Stock: ${cinnamon.stockQuantity} ${cinnamon.baseUnitName} | Cost: ৳${cinnamon.currentPurchasePrice}`);
  console.log(`  3. ${dano500g.name} | Stock: ${dano500g.stockQuantity} ${dano500g.baseUnitName} | Cost: ৳${dano500g.currentPurchasePrice}`);
  console.log(`  4. ${chili.name} | Stock: ${chili.stockQuantity} ${chili.baseUnitName} | Cost: ৳${chili.currentPurchasePrice}`);
  console.log(`  5. ${onion.name} | Stock: ${onion.stockQuantity} ${onion.baseUnitName} | Cost: ৳${onion.currentPurchasePrice}`);

  // 4. Seed Customers with Running Khata
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

  // 5. Seed Suppliers (Mahajans)
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

  // 6. Seed Daily Expenses
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

  console.log('\nSeed completed successfully for Idris Brothers (Feni Bazar Morichpotti)!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
