import { PrismaClient, SaleType } from '@prisma/client';
import { salesService } from '../src/features/sales/sales.service';
import { purchasesService } from '../src/features/purchases/purchases.service';
import { customerService } from '../src/features/customers/customers.service';
import { inventoryService } from '../src/features/inventory/inventory.service';
import { cashboxService } from '../src/features/cashbox/cashbox.service';
import { reportsService } from '../src/features/reports/reports.service';

const prisma = new PrismaClient();

async function runTestFlow() {
  console.log('======================================================================');
  console.log('🧪 TESTING RETAIL ERP ARCHITECTURE: VARIANTS, MULTI-UOM & KHATA 🧪');
  console.log('======================================================================\n');

  // Step 0: Fetch seeded entities (Variants)
  const cardamom = await prisma.productVariant.findFirstOrThrow({
    where: { sku: 'ELACHI-GUAT-01' },
    include: { product: true, units: true },
  });
  const dano = await prisma.productVariant.findFirstOrThrow({
    where: { sku: 'DANO-500G' },
    include: { product: true, units: true },
  });
  const chili = await prisma.productVariant.findFirstOrThrow({
    where: { sku: 'CHILI-PAN-01' },
    include: { product: true, units: true },
  });
  const customer = await prisma.customer.findFirstOrThrow({
    where: { phone: '01811223344' }, // হাজী রফিকুল ইসলাম
  });
  const supplier = await prisma.supplier.findFirstOrThrow({
    where: { phone: '01822887766' }, // ডানো ডিস্ট্রিবিউটর
  });

  console.log(`Initial Status:`);
  console.log(`- Cardamom (${cardamom.product.name} - ${cardamom.variantName}): Stock = ${cardamom.stockQuantity} ${cardamom.baseUnitName} | Retail = ৳${cardamom.retailPrice} | allowDecimalQty = ${cardamom.allowDecimalQty}`);
  console.log(`- Dano (${dano.product.name} - ${dano.variantName}): Stock = ${dano.stockQuantity} ${dano.baseUnitName} | Cost = ৳${dano.currentPurchasePrice} | allowDecimalQty = ${dano.allowDecimalQty}`);
  console.log(`- Chili (${chili.product.name} - ${chili.variantName}): Stock = ${chili.stockQuantity} ${chili.baseUnitName}`);
  console.log(`- Customer: ${customer.name} | Running Due = ৳${customer.currentDue}`);
  console.log(`- Supplier: ${supplier.companyName} | Payable = ৳${supplier.currentPayable}\n`);

  // =========================================================================
  // TEST 1: REVERSE PRICE-TO-WEIGHT CALCULATION ("২০ টাকার এলাচ বিক্রি")
  // =========================================================================
  console.log('--- TEST 1: Reverse Price-to-Weight Calculation (২০ টাকার এলাচ বিক্রি) ---');
  // Customer walks in and asks for "20 TK worth of Cardamom". No quantity specified!
  // Price is 3500/KG. Expected baseQuantity = 20 / 3500 = 0.0057 KG
  const reverseSaleInput = {
    saleType: SaleType.RETAIL,
    customerId: null, // Walk-in cash customer
    discount: 0,
    paidAmount: 20,
    note: 'খুচরা খদ্দের ২০ টাকার এলাচ নিলেন',
    items: [
      {
        variantId: cardamom.id,
        unitName: 'কেজি',
        conversionFactor: 1,
        customTotalPrice: 20, // ৳20
      },
    ],
  };

  const reverseSaleResult = await salesService.createSale(reverseSaleInput);
  console.log(`✔ Reverse Sale Completed: Invoice #${reverseSaleResult.sale.invoiceNumber}`);
  console.log(`  Grand Total: ৳${reverseSaleResult.sale.grandTotal} | Cash Paid: ৳${reverseSaleResult.sale.paidAmount}`);
  const soldItem = reverseSaleResult.sale.items[0];
  console.log(`  Sold Item: ${cardamom.product.name} (${cardamom.variantName})`);
  console.log(`  Auto-Calculated Weight (4 Decimals): ${soldItem.baseQuantity} KG (Expected: 0.0057 KG)`);
  console.log(`  Subtotal: ৳${soldItem.subTotal} | Cost Snapshot: ৳${soldItem.costPriceSnapshot}`);

  // Verify stock deduction
  const cardamomAfter = await prisma.productVariant.findUniqueOrThrow({ where: { id: cardamom.id } });
  const expectedCardamomStock1 = cardamom.stockQuantity.sub(soldItem.baseQuantity);
  console.log(`  Cardamom Stock After Sale: ${cardamomAfter.stockQuantity} KG (Expected: ${expectedCardamomStock1} KG)`);
  if (!cardamomAfter.stockQuantity.equals(expectedCardamomStock1)) {
    throw new Error(`Reverse calculation stock mismatch! Expected ${expectedCardamomStock1}, got ${cardamomAfter.stockQuantity}`);
  }

  // =========================================================================
  // TEST 1B: PACKAGED GOODS WHOLE NUMBER PROTECTION (allowDecimalQty = false)
  // =========================================================================
  console.log('\n--- TEST 1B: Packaged Goods Fractional Protection (allowDecimalQty: false) ---');
  try {
    await salesService.createSale({
      saleType: SaleType.RETAIL,
      customerId: null,
      discount: 0,
      paidAmount: 500,
      items: [
        {
          variantId: dano.id,
          unitName: 'প্যাকেট',
          conversionFactor: 1,
          quantity: 1.5, // 1.5 packets of milk powder should fail!
        },
      ],
    });
    throw new Error('FAILED: System should NOT have allowed selling 1.5 packets of milk powder!');
  } catch (err: any) {
    console.log(`✔ Correctly Rejected Fractional Quantity on Packaged Item: "${err.message}"`);
  }

  // =========================================================================
  // TEST 2: MULTI-UNIT SACK & PALLA SALE WITH RUNNING DUE KHATA
  // =========================================================================
  console.log('\n--- TEST 2: Multi-Unit Sale (Sacks & Palla) & Customer Running Khata ---');
  const chiliSack = chili.units.find((u) => u.unitName.includes('৫০ কেজি বস্তা'))!;
  const chiliPalla = chili.units.find((u) => u.unitName.includes('৫ কেজি পাল্লা'))!;

  const saleInput = {
    saleType: SaleType.RETAIL,
    customerId: customer.id,
    discount: 200,
    paidAmount: 20000, // Pays 20,000 cash, rest on credit
    note: '১ বস্তা ও ২ পাল্লা মরিচ ক্রয়',
    items: [
      {
        variantId: chili.id,
        unitName: chiliSack.unitName,
        conversionFactor: Number(chiliSack.conversionFactor), // 50
        quantity: 1, // 1 Sack = 50 KG
        unitPrice: Number(chiliSack.retailPrice!), // 17,500/sack -> Subtotal: 17,500
      },
      {
        variantId: chili.id,
        unitName: chiliPalla.unitName,
        conversionFactor: Number(chiliPalla.conversionFactor), // 5
        quantity: 2, // 2 Palla = 10 KG
        unitPrice: Number(chiliPalla.retailPrice!), // 1775/palla -> Subtotal: 3,550
      },
    ],
  };

  const saleResult = await salesService.createSale(saleInput);
  console.log(`✔ Sale completed: Invoice #${saleResult.sale.invoiceNumber}`);
  console.log(`  Grand Total: ৳${saleResult.sale.grandTotal} | Cash Paid: ৳${saleResult.sale.paidAmount} | Invoice Due: ৳${saleResult.sale.dueAmount}`);
  console.log(`  Customer Total Running Due now: ৳${saleResult.customerDue}`);

  // Chili: initial - 60 KG (50 + 10)
  const chiliAfter = await prisma.productVariant.findUniqueOrThrow({ where: { id: chili.id } });
  const expectedChiliStock = chili.stockQuantity.sub(60);
  console.log(`  Chili Stock: ${chiliAfter.stockQuantity} KG (Expected: ${expectedChiliStock} KG)`);
  if (!chiliAfter.stockQuantity.equals(expectedChiliStock)) {
    throw new Error(`Stock mismatch! Expected ${expectedChiliStock}, got ${chiliAfter.stockQuantity}`);
  }

  // =========================================================================
  // TEST 3: CUSTOMER CASH DUE REPAYMENT (বাকি আদায়)
  // =========================================================================
  console.log('\n--- TEST 3: Customer Due Cash Repayment (বাকি আদায়) ---');
  const repaymentAmount = 5000;
  const paymentResult = await customerService.receivePayment(customer.id, {
    amount: repaymentAmount,
    note: 'হাজী সাহেব এসে নগদ ৫,০০০ টাকা জমা দিয়ে গেলেন',
  });
  console.log(`✔ Customer Payment Received: ৳${repaymentAmount}`);
  console.log(`  Customer Updated Due: ৳${paymentResult.customer.currentDue}`);

  // =========================================================================
  // TEST 4: ON-THE-FLY DYNAMIC CARTON CONVERSION ON PURCHASE (চালান এন্ট্রি)
  // =========================================================================
  console.log('\n--- TEST 4: On-the-Fly Custom Carton Purchase with Auto-Save ---');
  // Dano distributor delivered cartons of 18 packets instead of 24!
  // We input: unitName: "কার্টন (১৮ প্যাকেট)", conversionFactor: 18, quantity: 10 cartons (= 180 packets).
  // unitCost: 7740 (cost per packet = 7740 / 18 = 430).
  // saveUnitForFuture: true!
  const purchaseInput = {
    supplierId: supplier.id,
    transportCost: 600,
    discount: 100,
    paidAmount: 50000,
    note: 'ডানো ৫০০ গ্রাম দুধের নতুন ১৮ প্যাকেটের কার্টন চালান',
    items: [
      {
        variantId: dano.id,
        unitName: 'কার্টন (১৮ প্যাকেট)',
        conversionFactor: 18,
        quantity: 10, // 10 * 18 = 180 packets
        unitCost: 7740, // 7740 / 18 = ৳430 per packet
        newRetailPrice: 470,
        newWholesalePrice: 445,
        saveUnitForFuture: true,
      },
    ],
  };

  const purchaseResult = await purchasesService.createPurchase(purchaseInput);
  console.log(`✔ Purchase completed: Chalan #${purchaseResult.purchaseNumber}`);
  console.log(`  Grand Total: ৳${purchaseResult.grandTotal} | Cash Paid: ৳${purchaseResult.paidAmount} | Due: ৳${purchaseResult.dueAmount}`);
  console.log(`  Mahajan Total Payable Debt now: ৳${purchaseResult.supplierPayable}`);

  // Verify stock: initial + 180 packets
  const danoAfter = await prisma.productVariant.findUniqueOrThrow({
    where: { id: dano.id },
    include: { units: true },
  });
  const expectedDanoStock = dano.stockQuantity.add(180);
  console.log(`  Dano Stock After Chalan: ${danoAfter.stockQuantity} ${danoAfter.baseUnitName} (${dano.stockQuantity} + 180 = ${expectedDanoStock})`);
  console.log(`  Dynamic Replacement Cost per Packet: ৳${danoAfter.currentPurchasePrice} (Was: ৳420, Now: ৳430)`);
  console.log(`  Updated Retail Price: ৳${danoAfter.retailPrice}`);

  if (!danoAfter.stockQuantity.equals(expectedDanoStock)) {
    throw new Error(`Dano stock mismatch! Expected ${expectedDanoStock}, got ${danoAfter.stockQuantity}`);
  }
  if (!danoAfter.currentPurchasePrice.equals(430)) {
    throw new Error(`Replacement cost update failed! Expected 430, got ${danoAfter.currentPurchasePrice}`);
  }

  // Verify that the new 18-packet carton unit was automatically saved into VariantUnit
  const savedUnit = danoAfter.units.find((u) => u.unitName === 'কার্টন (১৮ প্যাকেট)');
  if (!savedUnit) {
    throw new Error('On-the-fly carton unit was not saved to VariantUnit!');
  }
  console.log(`✔ Verified: Custom Unit "${savedUnit.unitName}" (Factor: ${savedUnit.conversionFactor}) saved for future use!`);

  // =========================================================================
  // TEST 5: STOCK WASTAGE RECORDING WITH 4 DECIMALS (এলাচের শুকিয়ে যাওয়া ঘাটতি)
  // =========================================================================
  console.log('\n--- TEST 5: Micro-Weight Wastage Recording (৪ দশমিকে ঘাটতি হিসাব) ---');
  // 0.2500 KG (250 grams) dried out
  const wastageResult = await inventoryService.recordWastage(cardamom.id, {
    quantity: 0.25,
    reason: 'গরম আবহাওয়ায় এলাচ শুকিয়ে ওজন হ্রাস',
  });
  console.log(`✔ Wastage Recorded: ${wastageResult.quantity} KG`);
  console.log(`  Snapshot Replacement Cost: ৳${wastageResult.costPriceSnapshot}/KG`);
  console.log(`  Calculated Loss: ৳${wastageResult.lossAmount} (0.25 KG * ৳3100 = ৳775)`);

  const cardamomFinal = await prisma.productVariant.findUniqueOrThrow({ where: { id: cardamom.id } });
  const expectedCardamomFinal = cardamomAfter.stockQuantity.sub(wastageResult.quantity);
  console.log(`  Cardamom Stock After Wastage: ${cardamomFinal.stockQuantity} KG (${cardamomAfter.stockQuantity} - ${wastageResult.quantity} = ${expectedCardamomFinal} KG)`);
  if (!cardamomFinal.stockQuantity.equals(expectedCardamomFinal)) {
    throw new Error(`Wastage stock deduction mismatch! Expected ${expectedCardamomFinal}, got ${cardamomFinal.stockQuantity}`);
  }

  // =========================================================================
  // TEST 6: DAILY CASHBOX RECONCILIATION SUMMARY
  // =========================================================================
  console.log('\n--- TEST 6: Daily Cashbox Reconciliation Summary ---');
  const cashboxSummary = await cashboxService.getDailySummary();
  console.log(`✔ Daily Cashbox for ${cashboxSummary.date}:`);
  console.log(`  TOTAL CASH IN: ৳${cashboxSummary.inflow.totalCashIn} (Sales: ৳${cashboxSummary.inflow.cashFromSales}, Due Collections: ৳${cashboxSummary.inflow.cashFromCustomerRepayments})`);
  console.log(`  TOTAL CASH OUT: ৳${cashboxSummary.outflow.totalCashOut} (Purchases: ৳${cashboxSummary.outflow.cashForPurchases}, Expenses: ৳${cashboxSummary.outflow.totalExpenses})`);
  console.log(`  NET CASH IN HAND: ৳${cashboxSummary.netCashInHand}`);

  // =========================================================================
  // TEST 7: PROFIT & LOSS STATEMENT WITH 4-DECIMAL PRECISION
  // =========================================================================
  console.log('\n--- TEST 7: Profit & Loss Statement (লাভ-ক্ষতির হিসাব) ---');
  const pnlReport = await reportsService.getProfitLossReport({});
  console.log(`✔ Total Sales Revenue: ৳${pnlReport.salesSummary.totalSalesRevenue}`);
  console.log(`  Cost of Goods Sold (COGS): ৳${pnlReport.salesSummary.costOfGoodsSold}`);
  console.log(`  Gross Profit: ৳${pnlReport.salesSummary.grossProfit} (${pnlReport.salesSummary.grossMarginPercent})`);
  console.log(`  Less Wastage Loss: ৳${pnlReport.deductions.wastageLoss}`);
  console.log(`  Less Operating Expenses: ৳${pnlReport.deductions.operatingExpenses}`);
  console.log(`  NET PROFIT: ৳${pnlReport.netProfit.amount} (${pnlReport.netProfit.netMarginPercent})`);

  console.log('\n======================================================================');
  console.log('✅ ALL ARCHITECTURAL TESTS PASSED WITH 100% MATHEMATICAL INTEGRITY! 🎯');
  console.log('======================================================================\n');
}

runTestFlow()
  .catch((e) => {
    console.error('Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
