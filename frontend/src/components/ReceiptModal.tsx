"use client";

import { useCartStore } from "../store/useCartStore";

export function ReceiptModal() {
  const { receipt, setReceipt } = useCartStore();

  if (!receipt) return null;

  return (
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

        <div className="mt-4 flex gap-2">
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
  );
}
