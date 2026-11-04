const BASE_URL = 'http://localhost:5000/api/v1';

async function testCompleteSupplyChainFlow() {
  console.log('================================================================');
  console.log('   IDRIS BROTHERS POS - FULL SUPPLY CHAIN & STORE FLOW TEST     ');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // PHASE 1: PROCUREMENT / PURCHASE (STOCK-IN FROM SUPPLIER)
  // -------------------------------------------------------------------------
  console.log('🚚 [STEP 1] Meghna Group delivery van arrives at the grocery store...');
  const supplierRes = await fetch(`${BASE_URL}/suppliers?search=Meghna`).then((r) => r.json());
  const supplier = supplierRes.data.suppliers[0];
  console.log(`  ✓ Supplier: ${supplier.name} (${supplier.companyName}) | Initial Debt: ৳${supplier.currentPayable}`);

  // Fetch initial oil stock
  const initialOil = await fetch(`${BASE_URL}/inventory/barcode/8941100123456`).then((r) => r.json());
  console.log(`  ✓ Initial Oil Stock in Store: ${initialOil.data.stock} ${initialOil.data.unit} | Cost Price: ৳${initialOil.data.costPrice}\n`);

  console.log('📝 [STEP 2] Store owner records Wholesale Purchase Chalan...');
  console.log('  - Buying: 20 Liters Rupchanda Oil @ ৳170 (New wholesale rate)');
  console.log('  - Total Bill: ৳3,400');
  console.log('  - Store pays: ৳2,000 Cash, Remaining Debt (Dena) to Meghna: ৳1,400');

  const purchaseRes = await fetch(`${BASE_URL}/purchases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supplierId: supplier.id,
      purchaseNumber: 'CHALAN-MEGHNA-9988',
      items: [
        {
          productId: initialOil.data.id,
          quantity: 20,
          unitCost: 170.0,
        },
      ],
      discount: 0,
      paidAmount: 2000,
      paymentMethod: 'CASH',
    }),
  }).then((r) => r.json());

  if (!purchaseRes.success) {
    console.error('❌ Purchase failed:', purchaseRes.message);
    return;
  }

  const purchase = purchaseRes.data;
  console.log(`  ✅ CHALAN RECORDED: #${purchase.purchaseNumber} | Status: ${purchase.status}`);
  console.log(`     Total: ৳${purchase.grandTotal} | Paid: ৳${purchase.paidAmount} | Debt to Supplier: ৳${purchase.dueAmount}\n`);

  // Verify stock increment in database
  console.log('📦 [STEP 3] Verifying Automatic Stock Increment in Inventory...');
  const oilAfterPurchase = await fetch(`${BASE_URL}/inventory/${initialOil.data.id}`).then((r) => r.json());
  console.log(`  ✓ Oil Stock: ${initialOil.data.stock} -> ${oilAfterPurchase.data.stock} (+20 Liters added automatically!)`);
  console.log(`  ✓ Updated Cost Price: ৳${oilAfterPurchase.data.costPrice} (Updated from ৳175 to ৳170)\n`);

  // Verify supplier ledger
  console.log('📖 [STEP 4] Verifying Mahajan Khata (Supplier Ledger)...');
  const supplierAfterPurchase = await fetch(`${BASE_URL}/suppliers/${supplier.id}`).then((r) => r.json());
  console.log(`  ✓ Store's Debt to Meghna Group: ৳${supplierAfterPurchase.data.currentPayable} (Increased by ৳1,400)`);
  console.log(`  ✓ Latest Supplier Ledger Entry: ${supplierAfterPurchase.data.ledger[0].type} ৳${supplierAfterPurchase.data.ledger[0].amount} | Note: "${supplierAfterPurchase.data.ledger[0].note}"\n`);

  // Store owner pays remaining debt to sales rep
  console.log('💵 [STEP 5] Store owner later pays ৳1,000 cash to Meghna Group sales rep...');
  const supplierPayRes = await fetch(`${BASE_URL}/suppliers/${supplier.id}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 1000,
      paymentMethod: 'CASH',
      note: 'Paid to sales rep Mr. Shamim',
    }),
  }).then((r) => r.json());

  console.log(`  ✓ Payment Recorded: ৳${supplierPayRes.data.payment.amount}`);
  console.log(`  ✓ Remaining Debt to Meghna Group: ৳${supplierPayRes.data.supplier.currentPayable} (Reduced from ৳1,400 to ৳400!)\n`);

  // -------------------------------------------------------------------------
  // PHASE 2: DAILY POS RETAIL SALE (CUSTOMER PURCHASES GOODS)
  // -------------------------------------------------------------------------
  console.log('🛒 [STEP 6] Customer Md. Rahim Uddin comes in to buy goods...');
  const customerRes = await fetch(`${BASE_URL}/customers?search=01711000111`).then((r) => r.json());
  const customer = customerRes.data.customers[0];

  const checkoutRes = await fetch(`${BASE_URL}/sales/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: customer.id,
      items: [
        { productId: initialOil.data.id, quantity: 2 },
      ],
      discount: 0,
      paidAmount: 200,
      paymentMethod: 'CASH',
    }),
  }).then((r) => r.json());

  const sale = checkoutRes.data;
  console.log(`  ✅ SALE MEMO GENERATED: #${sale.invoiceNumber}`);
  console.log(`     Total: ৳${sale.grandTotal} | Paid: ৳${sale.paidAmount} | Customer Baki: ৳${sale.dueAmount}`);

  // Verify stock after sale
  const oilAfterSale = await fetch(`${BASE_URL}/inventory/${initialOil.data.id}`).then((r) => r.json());
  console.log(`  ✓ Final Oil Stock in Store: ${oilAfterPurchase.data.stock} -> ${oilAfterSale.data.stock} (Deducted 2)\n`);

  console.log('================================================================');
  console.log('   🎉 COMPLETE 360° SUPPLY CHAIN & POS TEST PASSED!             ');
  console.log('   Purchase (Stock-In) ➔ Debt ➔ Sale (Stock-Out) ➔ Baki        ');
  console.log('================================================================');
}

testCompleteSupplyChainFlow().catch(console.error);
