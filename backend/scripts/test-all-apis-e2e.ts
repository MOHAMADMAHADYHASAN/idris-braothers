const BASE_URL = 'http://localhost:5000/api/v1';
const SERVER_URL = 'http://localhost:5000';

interface TestResult {
  module: string;
  endpoint: string;
  method: string;
  status: number;
  expectedStatus: number;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

async function request(method: string, url: string, body?: any): Promise<{ status: number; data: any }> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function record(module: string, endpoint: string, method: string, status: number, expectedStatus: number, message?: string) {
  const passed = status === expectedStatus;
  results.push({ module, endpoint, method, status, expectedStatus, passed, message });
  const icon = passed ? '✔' : '❌';
  console.log(`  ${icon} [${method}] ${endpoint} -> ${status} ${passed ? 'OK' : `(Expected ${expectedStatus}: ${JSON.stringify(message)})`}`);
}

async function runAllApiTests() {
  console.log('======================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE END-TO-END HTTP API TEST AUDIT 🚀');
  console.log('======================================================================\n');

  // -------------------------------------------------------------------------
  // 1. HEALTH CHECK
  // -------------------------------------------------------------------------
  console.log('--- 1. Health Check Module ---');
  const healthRes = await request('GET', `${SERVER_URL}/health`);
  record('Health', '/health', 'GET', healthRes.status, 200, healthRes.data.service);

  // -------------------------------------------------------------------------
  // 2. UNIT MASTER
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Dynamic Unit Master Module ---');
  // List units
  const listUnitsRes = await request('GET', `${BASE_URL}/units`);
  record('Unit Master', '/units', 'GET', listUnitsRes.status, 200);

  // Create unit
  const createUnitRes = await request('POST', `${BASE_URL}/units`, {
    name: `ড্রাম_${Date.now()}`,
    banglaName: 'তেলের বড় ড্রাম',
    category: 'CONTAINER',
  });
  record('Unit Master', '/units', 'POST', createUnitRes.status, 201);
  const createdUnitId = createUnitRes.data.data?.id;

  if (createdUnitId) {
    // Get unit by id
    const getUnitRes = await request('GET', `${BASE_URL}/units/${createdUnitId}`);
    record('Unit Master', `/units/${createdUnitId}`, 'GET', getUnitRes.status, 200);

    // Update unit
    const updateUnitRes = await request('PATCH', `${BASE_URL}/units/${createdUnitId}`, {
      banglaName: 'সয়াবিন তেলের ড্রাম ২০০ লিটার',
    });
    record('Unit Master', `/units/${createdUnitId}`, 'PATCH', updateUnitRes.status, 200);

    // Delete unit
    const deleteUnitRes = await request('DELETE', `${BASE_URL}/units/${createdUnitId}`);
    record('Unit Master', `/units/${createdUnitId}`, 'DELETE', deleteUnitRes.status, 200);
  }

  // -------------------------------------------------------------------------
  // 3. INVENTORY & PRODUCTS
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Inventory & Products Module ---');
  // List products
  const listProdRes = await request('GET', `${BASE_URL}/inventory?page=1&limit=10`);
  record('Inventory', '/inventory', 'GET', listProdRes.status, 200);

  // Create product with baseUnit and multi-units
  const uniqueSku = `CIN-STK-${Date.now().toString().slice(-4)}`;
  const uniqueBarcode = `890${Date.now().toString().slice(-9)}`;
  const createProdRes = await request('POST', `${BASE_URL}/inventory`, {
    name: 'দারুচিনি স্টিক স্পেশাল',
    banglaName: 'দারুচিনি স্টিক',
    category: 'SPICES',
    sku: uniqueSku,
    barcode: uniqueBarcode,
    baseUnitName: 'কেজি',
    currentPurchasePrice: 520,
    retailPrice: 620,
    wholesalePrice: 570,
    stockQuantity: 50.0000,
    lowStockAlert: 10.0000,
  });
  record('Inventory', '/inventory', 'POST', createProdRes.status, 201);
  const newProductId = createProdRes.data.data?.id;

  if (newProductId) {
    // Get product by ID
    const getProdRes = await request('GET', `${BASE_URL}/inventory/${newProductId}`);
    record('Inventory', `/inventory/${newProductId}`, 'GET', getProdRes.status, 200);

    // Get product by Barcode
    const getBarcodeRes = await request('GET', `${BASE_URL}/inventory/barcode/${uniqueBarcode}`);
    record('Inventory', `/inventory/barcode/${uniqueBarcode}`, 'GET', getBarcodeRes.status, 200);

    // Update product prices
    const updatePriceRes = await request('PATCH', `${BASE_URL}/inventory/${newProductId}/prices`, {
      currentPurchasePrice: 540,
      retailPrice: 650,
      wholesalePrice: 590,
    });
    record('Inventory', `/inventory/${newProductId}/prices`, 'PATCH', updatePriceRes.status, 200);

    // Add multi-unit
    const addUnitRes = await request('POST', `${BASE_URL}/inventory/${newProductId}/units`, {
      unitName: '১০ কেজি বস্তা',
      conversionFactor: 10,
      retailPrice: 6300,
      wholesalePrice: 5800,
    });
    record('Inventory', `/inventory/${newProductId}/units`, 'POST', addUnitRes.status, 201);
    const addedUnitId = addUnitRes.data.data?.id;

    if (addedUnitId) {
      // Delete product unit
      const delUnitRes = await request('DELETE', `${BASE_URL}/inventory/units/${addedUnitId}`);
      record('Inventory', `/inventory/units/${addedUnitId}`, 'DELETE', delUnitRes.status, 200);
    }

    // Record stock wastage (e.g. 0.2000 KG)
    const wastageRes = await request('POST', `${BASE_URL}/inventory/${newProductId}/wastage`, {
      quantity: 0.2000,
      reason: 'ভাঙা ও গুঁড়া হওয়ার কারণে ঘাটতি',
      note: 'অডিট ঘাটতি লিপিবদ্ধ',
    });
    record('Inventory', `/inventory/${newProductId}/wastage`, 'POST', wastageRes.status, 201);

    // List wastages
    const listWastageRes = await request('GET', `${BASE_URL}/inventory/wastages?page=1&limit=10`);
    record('Inventory', '/inventory/wastages', 'GET', listWastageRes.status, 200);
  }

  // -------------------------------------------------------------------------
  // 4. CUSTOMERS & KHATA (বাকির খাতা)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Customer Khata & Running Due Module ---');
  // List customers
  const listCustRes = await request('GET', `${BASE_URL}/customers?page=1&limit=10`);
  record('Customers', '/customers', 'GET', listCustRes.status, 200);

  // Create customer
  const createCustRes = await request('POST', `${BASE_URL}/customers`, {
    name: 'কাশেম স্টোর (সোনাগাজী বাজার)',
    phone: `01711${Date.now().toString().slice(-6)}`,
    address: 'সোনাগাজী বাজার, ফেনী',
    customerType: 'WHOLESALE',
    openingDue: 5000,
  });
  record('Customers', '/customers', 'POST', createCustRes.status, 201);
  const newCustomerId = createCustRes.data.data?.id;

  if (newCustomerId) {
    // Get customer by ID
    const getCustRes = await request('GET', `${BASE_URL}/customers/${newCustomerId}`);
    record('Customers', `/customers/${newCustomerId}`, 'GET', getCustRes.status, 200);

    // Update customer
    const updateCustRes = await request('PATCH', `${BASE_URL}/customers/${newCustomerId}`, {
      address: 'মেইন রোড, সোনাগাজী, ফেনী',
    });
    record('Customers', `/customers/${newCustomerId}`, 'PATCH', updateCustRes.status, 200);

    // Receive due payment
    const payCustRes = await request('POST', `${BASE_URL}/customers/${newCustomerId}/payments`, {
      amount: 2000,
      note: 'কাশেম ভাই এসে নগদ ২,০০০ টাকা পরিশোধ করলেন',
    });
    record('Customers', `/customers/${newCustomerId}/payments`, 'POST', payCustRes.status, 200);

    // Customer balance adjustment (discount/rebate)
    const adjustCustRes = await request('POST', `${BASE_URL}/customers/${newCustomerId}/adjustments`, {
      amount: -100,
      reason: 'বিশেষ ছাড়',
    });
    record('Customers', `/customers/${newCustomerId}/adjustments`, 'POST', adjustCustRes.status, 200);

    // Customer ledger
    const ledgerCustRes = await request('GET', `${BASE_URL}/customers/${newCustomerId}/ledger?page=1&limit=20`);
    record('Customers', `/customers/${newCustomerId}/ledger`, 'GET', ledgerCustRes.status, 200);
  }

  // -------------------------------------------------------------------------
  // 5. SUPPLIERS & MAHAJAN KHATA (মহাজনের খাতা)
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Suppliers & Mahajan Khata Module ---');
  // List suppliers
  const listSuppRes = await request('GET', `${BASE_URL}/suppliers?page=1&limit=10`);
  record('Suppliers', '/suppliers', 'GET', listSuppRes.status, 200);

  // Create supplier
  const createSuppRes = await request('POST', `${BASE_URL}/suppliers`, {
    name: 'আবুল কালাম',
    companyName: 'মেসার্স কালাম ব্রাদার্স (পাহাড়তলী আড়ত, চট্টগ্রাম)',
    phone: `01822${Date.now().toString().slice(-6)}`,
    address: 'পাহাড়তলী, চট্টগ্রাম',
    openingPayable: 40000,
  });
  record('Suppliers', '/suppliers', 'POST', createSuppRes.status, 201);
  const newSupplierId = createSuppRes.data.data?.id;

  if (newSupplierId) {
    // Get supplier by ID
    const getSuppRes = await request('GET', `${BASE_URL}/suppliers/${newSupplierId}`);
    record('Suppliers', `/suppliers/${newSupplierId}`, 'GET', getSuppRes.status, 200);

    // Update supplier
    const updateSuppRes = await request('PATCH', `${BASE_URL}/suppliers/${newSupplierId}`, {
      address: 'পাহাড়তলী রেলওয়ে মার্কেট, চট্টগ্রাম',
    });
    record('Suppliers', `/suppliers/${newSupplierId}`, 'PATCH', updateSuppRes.status, 200);

    // Pay supplier
    const paySuppRes = await request('POST', `${BASE_URL}/suppliers/${newSupplierId}/payments`, {
      amount: 15000,
      note: 'আড়তের চালানের বিপরীতে নগদ ১৫,০০০ টাকা পরিশোধ',
    });
    record('Suppliers', `/suppliers/${newSupplierId}/payments`, 'POST', paySuppRes.status, 200);

    // Adjust supplier balance
    const adjustSuppRes = await request('POST', `${BASE_URL}/suppliers/${newSupplierId}/adjustments`, {
      amount: -200,
      reason: 'ট্রাক লোডিং দেরির কারণে মহাজন ২০০ টাকা ছাড় দিলেন',
    });
    record('Suppliers', `/suppliers/${newSupplierId}/adjustments`, 'POST', adjustSuppRes.status, 200);

    // Supplier ledger
    const ledgerSuppRes = await request('GET', `${BASE_URL}/suppliers/${newSupplierId}/ledger?page=1&limit=20`);
    record('Suppliers', `/suppliers/${newSupplierId}/ledger`, 'GET', ledgerSuppRes.status, 200);
  }

  // -------------------------------------------------------------------------
  // 6. PURCHASES (চালান এন্ট্রি ও নতুন কার্টন সংরক্ষণ)
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Purchases & Chalan Module ---');
  if (newSupplierId && newProductId) {
    const createPurchaseRes = await request('POST', `${BASE_URL}/purchases`, {
      supplierId: newSupplierId,
      transportCost: 300,
      discount: 50,
      paidAmount: 5000,
      note: 'দারুচিনি স্টিকের নতুন চালান',
      items: [
        {
          productId: newProductId,
          unitName: 'কার্টন (১০ কেজি)',
          conversionFactor: 10,
          quantity: 2, // 2 cartons = 20 KG
          unitCost: 5300, // 530/kg
          newRetailPrice: 660,
          newWholesalePrice: 600,
          saveUnitForFuture: true,
        },
      ],
    });
    record('Purchases', '/purchases', 'POST', createPurchaseRes.status, 201);
    const purchaseId = createPurchaseRes.data.data?.id;

    // List purchases
    const listPurchaseRes = await request('GET', `${BASE_URL}/purchases?page=1&limit=10`);
    record('Purchases', '/purchases', 'GET', listPurchaseRes.status, 200);

    if (purchaseId) {
      // Get purchase by ID
      const getPurchaseRes = await request('GET', `${BASE_URL}/purchases/${purchaseId}`);
      record('Purchases', `/purchases/${purchaseId}`, 'GET', getPurchaseRes.status, 200);
    }
  }

  // -------------------------------------------------------------------------
  // 7. SALES & POS (বিক্রয় ও থার্মাল রিসিপ্ট)
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Sales & POS Module ---');
  if (newProductId && newCustomerId) {
    const createSaleRes = await request('POST', `${BASE_URL}/sales`, {
      saleType: 'WHOLESALE',
      customerId: newCustomerId,
      discount: 20,
      paidAmount: 1000,
      note: 'দারুচিনি পাইকারি বিক্রি',
      items: [
        {
          productId: newProductId,
          unitName: 'কেজি',
          conversionFactor: 1,
          quantity: 2,
          unitPrice: 600,
        },
      ],
    });
    record('Sales', '/sales', 'POST', createSaleRes.status, 201);
    const saleId = createSaleRes.data.data?.id;

    // List sales
    const listSaleRes = await request('GET', `${BASE_URL}/sales?page=1&limit=10`);
    record('Sales', '/sales', 'GET', listSaleRes.status, 200);

    if (saleId) {
      // Get sale by ID
      const getSaleRes = await request('GET', `${BASE_URL}/sales/${saleId}`);
      record('Sales', `/sales/${saleId}`, 'GET', getSaleRes.status, 200);

      // Get sale thermal receipt
      const getReceiptRes = await request('GET', `${BASE_URL}/sales/${saleId}/receipt`);
      record('Sales', `/sales/${saleId}/receipt`, 'GET', getReceiptRes.status, 200);
    }
  }

  // -------------------------------------------------------------------------
  // 8. DAILY EXPENSES (দোকানের খরচ)
  // -------------------------------------------------------------------------
  console.log('\n--- 8. Daily Expenses Module ---');
  // Create expense
  const createExpRes = await request('POST', `${BASE_URL}/expenses`, {
    category: 'ELECTRICITY_UTILITY',
    amount: 1200,
    description: 'দোকানের মাসিক বিদ্যুৎ বিল',
    note: 'পল্লী বিদ্যুৎ অফিস কাউন্টারে জমা',
  });
  record('Expenses', '/expenses', 'POST', createExpRes.status, 201);
  const expenseId = createExpRes.data.data?.id;

  // List expenses
  const listExpRes = await request('GET', `${BASE_URL}/expenses?page=1&limit=10`);
  record('Expenses', '/expenses', 'GET', listExpRes.status, 200);

  if (expenseId) {
    // Get expense by ID
    const getExpRes = await request('GET', `${BASE_URL}/expenses/${expenseId}`);
    record('Expenses', `/expenses/${expenseId}`, 'GET', getExpRes.status, 200);

    // Update expense
    const updateExpRes = await request('PATCH', `${BASE_URL}/expenses/${expenseId}`, {
      amount: 1250,
      note: 'বিল ও সার্ভিস চার্জসহ মোট',
    });
    record('Expenses', `/expenses/${expenseId}`, 'PATCH', updateExpRes.status, 200);

    // Delete expense
    const deleteExpRes = await request('DELETE', `${BASE_URL}/expenses/${expenseId}`);
    record('Expenses', `/expenses/${expenseId}`, 'DELETE', deleteExpRes.status, 200);
  }

  // -------------------------------------------------------------------------
  // 9. CASHBOX RECONCILIATION (ক্যাশ ড্রয়ার হিসাব)
  // -------------------------------------------------------------------------
  console.log('\n--- 9. Daily Cashbox Reconciliation Module ---');
  const cashboxRes = await request('GET', `${BASE_URL}/cashbox/daily-summary`);
  record('Cashbox', '/cashbox/daily-summary', 'GET', cashboxRes.status, 200);

  // -------------------------------------------------------------------------
  // 10. REPORTS & ANALYTICS (রিপোর্ট ও পরিসংখ্যান)
  // -------------------------------------------------------------------------
  console.log('\n--- 10. Reports & Analytics Module ---');
  // Profit & Loss
  const pnlRes = await request('GET', `${BASE_URL}/reports/profit-loss`);
  record('Reports', '/reports/profit-loss', 'GET', pnlRes.status, 200);

  // Inventory valuation
  const valRes = await request('GET', `${BASE_URL}/reports/inventory-valuation`);
  record('Reports', '/reports/inventory-valuation', 'GET', valRes.status, 200);

  // Dues summary
  const duesRes = await request('GET', `${BASE_URL}/reports/dues-summary`);
  record('Reports', '/reports/dues-summary', 'GET', duesRes.status, 200);

  // Top selling products
  const topRes = await request('GET', `${BASE_URL}/reports/top-selling?limit=5`);
  record('Reports', '/reports/top-selling', 'GET', topRes.status, 200);

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`TOTAL ENDPOINTS TESTED: ${total}`);
  console.log(`PASSED: ${passed} ✔`);
  console.log(`FAILED: ${failed} ${failed > 0 ? '❌' : '🎉'}`);
  console.log(`SUCCESS RATE: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('======================================================================\n');

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter((r) => !r.passed).forEach((r) => console.log(`- [${r.method}] ${r.endpoint}: Status ${r.status} (Expected ${r.expectedStatus})`));
  }
}

runAllApiTests().catch(console.error);
