"use client";

import { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:5000/api/v1";

interface Product {
  id: string;
  name: string;
  barcode: string | null;
  sku: string | null;
  stock: number;
  lowStockLimit: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  currentDue: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface InvoiceReceipt {
  id: string;
  invoiceNumber: string;
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  customer?: { name: string; phone: string } | null;
  items: Array<{
    product: { name: string; unit: string };
    quantity: number;
    unitPrice: number;
    subTotal: number;
  }>;
}

export default function POSDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [activeTab, setActiveTab] = useState<"pos" | "inventory" | "customers">("pos");
  const [receipt, setReceipt] = useState<InvoiceReceipt | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial products & customers
  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory?limit=50`);
      const data = await res.json();
      if (data.success) {
        setProducts(
          data.data.products.map((p: any) => ({
            ...p,
            stock: Number(p.stock),
            sellingPrice: Number(p.sellingPrice),
            costPrice: Number(p.costPrice),
            lowStockLimit: Number(p.lowStockLimit),
          }))
        );
      }
    } catch {
      showToast("error", "Failed to connect to Backend API at http://localhost:5000");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers?limit=50`);
      const data = await res.json();
      if (data.success) {
        setCustomers(
          data.data.customers.map((c: any) => ({
            ...c,
            currentDue: Number(c.currentDue),
          }))
        );
      }
    } catch {
      // Backend may be offline
    }
  };

  // Barcode / Name Instant Add to Cart
  const handleBarcodeOrSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Check if match by barcode
    const matchByBarcode = products.find((p) => p.barcode === query);
    if (matchByBarcode) {
      addToCart(matchByBarcode);
      setSearchQuery("");
      return;
    }

    // Try API Barcode lookup
    try {
      const res = await fetch(`${API_BASE}/inventory/barcode/${query}`);
      const data = await res.json();
      if (data.success && data.data) {
        const prod = {
          ...data.data,
          stock: Number(data.data.stock),
          sellingPrice: Number(data.data.sellingPrice),
          costPrice: Number(data.data.costPrice),
          lowStockLimit: Number(data.data.lowStockLimit),
        };
        addToCart(prod);
        setSearchQuery("");
        return;
      }
    } catch {}

    // Fallback: match by product name
    const matchByName = products.find((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    if (matchByName) {
      addToCart(matchByName);
      setSearchQuery("");
      return;
    }

    showToast("error", `Product not found for "${query}"`);
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      showToast("error", `"${product.name}" is out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast("error", `Cannot add more. Available stock: ${product.stock}`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              showToast("error", `Max available stock is ${item.product.stock}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setPaidAmount("");
    setSelectedCustomerId("");
  };

  // Calculations
  const subTotal = cart.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );
  const grandTotal = Math.max(0, subTotal - (Number(discount) || 0));
  const currentPaid = paidAmount === "" ? grandTotal : Number(paidAmount);
  const dueAmount = Math.max(0, grandTotal - currentPaid);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Checkout API Call
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast("error", "Cart is empty!");
      return;
    }

    if (dueAmount > 0 && !selectedCustomerId) {
      showToast("error", "Customer profile is required when there is Due (Baki)!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerId: selectedCustomerId || undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        discount: Number(discount) || 0,
        paidAmount: currentPaid,
        paymentMethod: dueAmount > 0 ? (currentPaid > 0 ? "SPLIT" : "DUE") : paymentMethod,
      };

      const res = await fetch(`${API_BASE}/sales/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        showToast("error", data.message || "Checkout failed");
        setLoading(false);
        return;
      }

      setReceipt(data.data);
      showToast("success", `Sale completed! Invoice #${data.data.invoiceNumber}`);
      clearCart();
      fetchProducts();
      fetchCustomers();
    } catch {
      showToast("error", "Error connecting to server during checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* TOP HEADER */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 text-slate-950 p-2 rounded-lg font-bold text-xl tracking-wider">
            🏪 IDRIS POS
          </div>
          <span className="text-sm text-slate-400">Grocery Store Counter</span>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setActiveTab("pos")}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
              activeTab === "pos"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🛒 Billing Counter (POS)
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
              activeTab === "inventory"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📦 Inventory Stock ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
              activeTab === "customers"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            👥 Baki Khata ({customers.length})
          </button>
        </div>

        {/* LIVE SERVER STATUS */}
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Backend API : 5000 (Online)
        </div>
      </header>

      {/* TOAST MESSAGE */}
      {message && (
        <div
          className={`fixed top-16 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm font-semibold transition-all ${
            message.type === "success"
              ? "bg-emerald-900 border-emerald-600 text-emerald-100"
              : "bg-rose-900 border-rose-600 text-rose-100"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6">
        {activeTab === "pos" && (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
            {/* LEFT COLUMN: SCANNER & PRODUCT CATALOG */}
            <div className="col-span-7 flex flex-col gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
              {/* SCANNER BAR */}
              <form onSubmit={handleBarcodeOrSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Scan Barcode or Type Product Name..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
                    autoFocus
                  />
                  <span className="absolute right-3 top-3 text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
                    Scanner Ready
                  </span>
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 rounded-xl transition"
                >
                  Add
                </button>
              </form>

              {/* PRODUCTS GRID */}
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-3 gap-3">
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => addToCart(prod)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        prod.stock <= prod.lowStockLimit
                          ? "bg-amber-950/20 border-amber-800/80 hover:border-amber-500"
                          : "bg-slate-900/80 border-slate-700 hover:border-emerald-500 hover:scale-[1.01]"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-semibold text-sm line-clamp-2 text-slate-200">
                            {prod.name}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Barcode: {prod.barcode || "N/A"}
                        </p>
                      </div>

                      <div className="flex justify-between items-end mt-3 pt-2 border-t border-slate-800">
                        <div>
                          <span className="text-lg font-bold text-emerald-400">
                            ৳{prod.sellingPrice}
                          </span>
                          <span className="text-xs text-slate-400">/{prod.unit}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            prod.stock <= prod.lowStockLimit
                              ? "bg-amber-900/60 text-amber-300 border border-amber-700"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          Stock: {prod.stock}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACTIVE CART & CHECKOUT PANEL */}
            <div className="col-span-5 flex flex-col bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow-xl justify-between">
              <div>
                {/* CUSTOMER SELECTOR */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex-1 mr-2">
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Customer Profile (For Baki / Regulars)
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">👤 Walk-in Guest Customer (Cash)</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone}) - Due: ৳{c.currentDue}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedCustomer && (
                    <div className="text-right bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                      <span className="text-xs text-slate-400 block">Existing Due</span>
                      <span className="text-sm font-bold text-rose-400">
                        ৳{selectedCustomer.currentDue}
                      </span>
                    </div>
                  )}
                </div>

                {/* CART ITEMS LIST */}
                <div className="h-60 overflow-y-auto mt-3 pr-1 space-y-2">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                      <span className="text-3xl mb-2">🛒</span>
                      Cart is empty. Scan barcodes or click items.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-slate-800"
                      >
                        <div className="flex-1 mr-2">
                          <p className="text-sm font-medium text-slate-200 line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            ৳{item.product.sellingPrice} × {item.quantity} ={" "}
                            <span className="text-emerald-400 font-semibold">
                              ৳{item.product.sellingPrice * item.quantity}
                            </span>
                          </p>
                        </div>

                        {/* QUANTITY CONTROLS */}
                        <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-sm font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-2 text-slate-500 hover:text-rose-400 p-1 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* CHECKOUT FINANCIAL SUMMARY */}
              <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-200">৳{subTotal}</span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-400">Discount (৳)</span>
                  <input
                    type="number"
                    min="0"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="0"
                    className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-slate-700/60">
                  <span className="text-base font-bold text-slate-200">Grand Total</span>
                  <span className="text-2xl font-black text-emerald-400">৳{grandTotal}</span>
                </div>

                {/* PAYMENT SECTION */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Paid Amount (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder={grandTotal.toString()}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="CASH">💵 Cash</option>
                      <option value="BKASH">📱 bKash</option>
                      <option value="NAGAD">📱 Nagad</option>
                      <option value="CARD">💳 Card</option>
                    </select>
                  </div>
                </div>

                {/* DUE BANNER (IF ANY) */}
                {dueAmount > 0 && (
                  <div className="bg-rose-950/60 border border-rose-800 text-rose-300 px-3 py-2 rounded-lg flex justify-between items-center text-xs">
                    <span>Remaining Due (Baki):</span>
                    <span className="text-sm font-bold text-rose-400">৳{dueAmount}</span>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={clearCart}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-semibold text-sm transition"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading || cart.length === 0}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition flex justify-center items-center gap-2"
                  >
                    {loading ? "Processing..." : `Complete Sale • ৳${currentPaid}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY TAB VIEW */}
        {activeTab === "inventory" && (
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-bold mb-4">Store Inventory Catalog</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Barcode</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Buying Price</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Est. Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-750">
                    <td className="py-3 px-4 font-medium">{p.name}</td>
                    <td className="py-3 px-4 text-slate-400">{p.barcode || "-"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.stock <= p.lowStockLimit
                            ? "bg-amber-900/60 text-amber-300"
                            : "bg-emerald-950 text-emerald-400"
                        }`}
                      >
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4">৳{p.costPrice}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">৳{p.sellingPrice}</td>
                    <td className="py-3 px-4 text-emerald-300">
                      ৳{(p.sellingPrice - p.costPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CUSTOMERS / BAKI KHATA TAB VIEW */}
        {activeTab === "customers" && (
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-bold mb-4">Customer Directory & Baki Khata</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Current Due (মোট বকেয়া)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-750">
                    <td className="py-3 px-4 font-semibold text-slate-200">{c.name}</td>
                    <td className="py-3 px-4 text-slate-400">{c.phone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm font-bold ${
                          c.currentDue > 0 ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        ৳{c.currentDue}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setActiveTab("pos");
                        }}
                        className="bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                      >
                        New Sale
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* THERMAL PRINT RECEIPT MODAL */}
      {receipt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-black p-6 rounded-2xl w-full max-w-sm shadow-2xl font-mono text-xs">
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <h2 className="text-base font-bold">🏪 IDRIS BROTHERS STORE</h2>
              <p className="text-[10px] text-gray-600">Local Grocery & General Store</p>
              <p className="text-[10px] text-gray-500 mt-1">Invoice: #{receipt.invoiceNumber}</p>
              <p className="text-[10px] text-gray-500">
                Date: {new Date(receipt.createdAt).toLocaleString()}
              </p>
              {receipt.customer && (
                <p className="text-[10px] font-bold text-gray-800 mt-1">
                  Customer: {receipt.customer.name} ({receipt.customer.phone})
                </p>
              )}
            </div>

            <div className="py-3 space-y-1.5 border-b border-dashed border-gray-400">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="flex-1 truncate">
                    {item.product.name} (x{item.quantity})
                  </span>
                  <span className="font-bold">৳{item.subTotal}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{receipt.subTotal}</span>
              </div>
              {Number(receipt.discount) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount:</span>
                  <span>-৳{receipt.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-300">
                <span>Grand Total:</span>
                <span>৳{receipt.grandTotal}</span>
              </div>
              <div className="flex justify-between text-gray-800">
                <span>Paid ({receipt.paymentMethod}):</span>
                <span>৳{receipt.paidAmount}</span>
              </div>
              {Number(receipt.dueAmount) > 0 && (
                <div className="flex justify-between font-bold text-red-600 pt-1">
                  <span>Remaining Due (Baki):</span>
                  <span>৳{receipt.dueAmount}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-500">
              Thank you for shopping with us! Please come again.
            </div>

            <div className="mt-4 flex gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-black text-white py-2 rounded-lg font-bold text-xs hover:bg-gray-800"
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => setReceipt(null)}
                className="px-4 bg-gray-200 text-gray-800 py-2 rounded-lg font-bold text-xs hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
