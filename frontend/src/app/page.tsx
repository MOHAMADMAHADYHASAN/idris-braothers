import { Suspense } from "react";
import { Product, Customer } from "../types/pos";
import { POSClientApp } from "../components/POSClientApp";

const API_BASE = "http://localhost:5000/api/v1";

export const dynamic = "force-dynamic";

// ⚡ SERVER-SIDE RENDERING (SSR / React Server Component)
async function POSServerLoader() {
  let products: Product[] = [];
  let customers: Customer[] = [];

  try {
    const [prodRes, custRes] = await Promise.all([
      fetch(`${API_BASE}/inventory?limit=50`, { cache: "no-store" }),
      fetch(`${API_BASE}/customers?limit=50`, { cache: "no-store" }),
    ]);

    const prodData = await prodRes.json();
    const custData = await custRes.json();

    if (prodData.success) {
      products = prodData.data.products.map((p: any) => ({
        ...p,
        stock: Number(p.stock),
        sellingPrice: Number(p.sellingPrice),
        costPrice: Number(p.costPrice),
        lowStockLimit: Number(p.lowStockLimit),
      }));
    }

    if (custData.success) {
      customers = custData.data.customers.map((c: any) => ({
        ...c,
        currentDue: Number(c.currentDue),
      }));
    }
  } catch (error) {
    console.error("Error during Next.js SSR fetch:", error);
  }

  return <POSClientApp initialProducts={products} initialCustomers={customers} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 font-semibold text-lg">
          Loading Idris Brothers POS Terminal...
        </div>
      }
    >
      <POSServerLoader />
    </Suspense>
  );
}
