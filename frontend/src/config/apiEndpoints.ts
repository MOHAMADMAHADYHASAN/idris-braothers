/**
 * Centralized API Endpoints Configuration
 * Strict Typed Route Registry for Idris Brothers Grocery & Spice POS Backend.
 * No hardcoded URL strings are permitted inside any service or component.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SERVER_BASE_URL = API_BASE_URL.replace('/api/v1', '');

export const API_ENDPOINTS = {
  // System Health
  HEALTH: `${SERVER_BASE_URL}/health`,

  // Dynamic Unit Master (কেজি, গ্রাম, প্যাকেট, বস্তা, কার্টন, টিন)
  UNITS: {
    BASE: `${API_BASE_URL}/units`,
    BY_ID: (id: string) => `${API_BASE_URL}/units/${id}`,
  },

  // Products & Inventory Management
  PRODUCTS: {
    BASE: `${API_BASE_URL}/inventory`,
    BY_ID: (id: string) => `${API_BASE_URL}/inventory/${id}`,
    BY_BARCODE: (barcode: string) => `${API_BASE_URL}/inventory/barcode/${encodeURIComponent(barcode)}`,
    PRICES: (id: string) => `${API_BASE_URL}/inventory/${id}/prices`,
    ADD_UNIT: (id: string) => `${API_BASE_URL}/inventory/${id}/units`,
    DELETE_UNIT: (unitId: string) => `${API_BASE_URL}/inventory/units/${unitId}`,
    RECORD_WASTAGE: (id: string) => `${API_BASE_URL}/inventory/${id}/wastage`,
    WASTAGES: `${API_BASE_URL}/inventory/wastages`,
  },

  // POS & Sales (Retail, Wholesale, Sacks, Reverse Calculation & Thermal Receipt)
  SALES: {
    BASE: `${API_BASE_URL}/sales`,
    BY_ID: (id: string) => `${API_BASE_URL}/sales/${id}`,
    RECEIPT: (id: string) => `${API_BASE_URL}/sales/${id}/receipt`,
  },

  // Purchases & Supplier Challans (On-the-fly Carton & Replacement Cost)
  PURCHASES: {
    BASE: `${API_BASE_URL}/purchases`,
    BY_ID: (id: string) => `${API_BASE_URL}/purchases/${id}`,
  },

  // Customer Khata (Running Due, Cash Repayment & Ledger)
  CUSTOMERS: {
    BASE: `${API_BASE_URL}/customers`,
    BY_ID: (id: string) => `${API_BASE_URL}/customers/${id}`,
    PAYMENTS: (id: string) => `${API_BASE_URL}/customers/${id}/payments`,
    ADJUSTMENTS: (id: string) => `${API_BASE_URL}/customers/${id}/adjustments`,
    LEDGER: (id: string) => `${API_BASE_URL}/customers/${id}/ledger`,
  },

  // Supplier / Mahajan Khata (Running Payable & Debt Repayment)
  SUPPLIERS: {
    BASE: `${API_BASE_URL}/suppliers`,
    BY_ID: (id: string) => `${API_BASE_URL}/suppliers/${id}`,
    PAYMENTS: (id: string) => `${API_BASE_URL}/suppliers/${id}/payments`,
    ADJUSTMENTS: (id: string) => `${API_BASE_URL}/suppliers/${id}/adjustments`,
    LEDGER: (id: string) => `${API_BASE_URL}/suppliers/${id}/ledger`,
  },

  // Store Daily Expenses (Labor/Kuli, Van, Electricity, Tea/Snacks)
  EXPENSES: {
    BASE: `${API_BASE_URL}/expenses`,
    BY_ID: (id: string) => `${API_BASE_URL}/expenses/${id}`,
  },

  // Daily Cashbox Closing (Cash In - Cash Out = Net Cash in Hand)
  CASHBOX: {
    DAILY_SUMMARY: `${API_BASE_URL}/cashbox/daily-summary`,
  },

  // Financial & Operational Reports
  REPORTS: {
    PROFIT_LOSS: `${API_BASE_URL}/reports/profit-loss`,
    INVENTORY_VALUATION: `${API_BASE_URL}/reports/inventory-valuation`,
    DUES_SUMMARY: `${API_BASE_URL}/reports/dues-summary`,
    TOP_SELLING: `${API_BASE_URL}/reports/top-selling`,
  },
} as const;
