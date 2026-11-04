import { PrismaClient, UnitType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding grocery store, customer & supplier data for Idris Brothers POS...\n');

  // Clean existing test data (safe for local development)
  await prisma.supplierLedger.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.supplier.deleteMany();

  await prisma.customerLedger.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();

  // 1. Seed Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Rupchanda Fortified Soybean Oil 1L',
        sku: 'OIL-RUP-1L',
        barcode: '8941100123456',
        stock: 50,
        lowStockLimit: 10,
        unit: UnitType.LITER,
        costPrice: 175.0,
        sellingPrice: 185.0,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Fresh Refined Sugar 1kg',
        sku: 'SUG-FRE-1KG',
        barcode: '8941100987654',
        stock: 40,
        lowStockLimit: 8,
        unit: UnitType.KG,
        costPrice: 125.0,
        sellingPrice: 135.0,
      },
    }),
    prisma.product.create({
      data: {
        name: 'ACI Pure Vacuum Salt 1kg',
        sku: 'SLT-ACI-1KG',
        barcode: '8941100555555',
        stock: 60,
        lowStockLimit: 15,
        unit: UnitType.KG,
        costPrice: 35.0,
        sellingPrice: 42.0,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Maggi 2-Minute Noodles Family Pack',
        sku: 'NDL-MAG-FAM',
        barcode: '8941100777777',
        stock: 100,
        lowStockLimit: 20,
        unit: UnitType.PACKET,
        costPrice: 22.0,
        sellingPrice: 28.0,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pran Crispy Toast Biscuit 300g',
        sku: 'BSC-PRN-300G',
        barcode: '8941100333333',
        stock: 25,
        lowStockLimit: 5,
        unit: UnitType.PACKET,
        costPrice: 45.0,
        sellingPrice: 55.0,
      },
    }),
  ]);

  console.log(`Created ${products.length} grocery items:`);
  products.forEach((p) => {
    console.log(`  - [${p.barcode}] ${p.name} | Stock: ${p.stock} ${p.unit} | Price: ৳${p.sellingPrice}`);
  });

  // 2. Seed Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Md. Rahim Uddin',
        phone: '01711000111',
        address: 'House 12, Road 4, Sector 7',
        currentDue: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Karim Chowdhury',
        phone: '01822000222',
        address: 'Shop 5, Local Market',
        currentDue: 0,
      },
    }),
  ]);

  console.log(`\nCreated ${customers.length} regular customers:`);
  customers.forEach((c) => {
    console.log(`  - ${c.name} (${c.phone}) | Initial Due: ৳${c.currentDue}`);
  });

  // 3. Seed Suppliers (Mahajans)
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Shamim Hossain (Dealer)',
        companyName: 'Meghna Group of Industries',
        phone: '01733000333',
        address: 'Tejgaon Industrial Area, Dhaka',
        currentPayable: 0,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Kamrul Hasan',
        companyName: 'Square Consumer Products Ltd',
        phone: '01944000444',
        address: 'Mohakhali C/A, Dhaka',
        currentPayable: 0,
      },
    }),
  ]);

  console.log(`\nCreated ${suppliers.length} wholesale suppliers:`);
  suppliers.forEach((s) => {
    console.log(`  - ${s.name} [${s.companyName}] (${s.phone}) | Initial Debt: ৳${s.currentPayable}`);
  });

  console.log('\nSeed completed successfully! Database is ready for full supply chain testing.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
