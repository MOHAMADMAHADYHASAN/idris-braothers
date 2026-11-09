/**
 * ESC/POS Thermal Receipt Command Generator
 * Strictly formatted for 80mm (42/48 col) & 58mm (32 col) thermal printers.
 * Compatible with Xprinter, Rongta, Epson, Sunmi, and Android RawBT print servers.
 */

import { ThermalReceiptData } from '@/features/pos/pos.types';

// ESC/POS Byte Constants
const ESC = '\x1b';
const GS = '\x1d';

export const ESC_COMMANDS = {
  INIT: `${ESC}@`, // Initialize printer
  ALIGN_LEFT: `${ESC}a\x00`,
  ALIGN_CENTER: `${ESC}a\x01`,
  ALIGN_RIGHT: `${ESC}a\x02`,
  BOLD_ON: `${ESC}E\x01`,
  BOLD_OFF: `${ESC}E\x00`,
  DOUBLE_ON: `${ESC}!\x30`, // Double height & width
  DOUBLE_HEIGHT: `${ESC}!\x10`,
  NORMAL: `${ESC}!\x00`,
  UNDERLINE_ON: `${ESC}-\x01`,
  UNDERLINE_OFF: `${ESC}-\x00`,
  FEED_2: '\n\n',
  FEED_3: '\n\n\n',
  CUT_FULL: `${GS}V\x00`, // Full cut
  CUT_PARTIAL: `${GS}V\x42\x00`, // Partial cut (feed paper + cut)
  BEEP: `${ESC}B\x02\x02`, // Buzzer beep (2 beeps, 100ms)
};

/**
 * Pads left and right text to fit exact column width
 */
function justifyRow(left: string, right: string, width: number): string {
  const spaceNeeded = width - (left.length + right.length);
  if (spaceNeeded <= 0) {
    return left.slice(0, width - right.length - 1) + ' ' + right;
  }
  return left + ' '.repeat(spaceNeeded) + right;
}

/**
 * Builds standard plain-text ESC/POS payload for 80mm or 58mm thermal rolls.
 */
export function generateEscPosCommands(
  data: ThermalReceiptData,
  paperWidth: '58mm' | '80mm' = '80mm'
): { textPayload: string; binaryBuffer: Uint8Array } {
  const colWidth = paperWidth === '58mm' ? 32 : 48;
  const divider = '-'.repeat(colWidth);
  const doubleDivider = '='.repeat(colWidth);

  let out = '';

  // 1. Initialize Printer & Beep
  out += ESC_COMMANDS.INIT;
  out += ESC_COMMANDS.BEEP;

  // 2. Header (Centered, Double Height Store Name)
  out += ESC_COMMANDS.ALIGN_CENTER;
  out += ESC_COMMANDS.DOUBLE_ON;
  out += `${data.storeInfo.name}\n`;
  out += ESC_COMMANDS.NORMAL;
  out += `${data.storeInfo.tagline}\n`;
  out += `${data.storeInfo.address}\n`;
  out += `${data.storeInfo.market}\n`;
  out += `Mobile: ${data.storeInfo.phone}\n`;
  out += `${divider}\n`;

  // 3. Invoice Metadata
  out += ESC_COMMANDS.ALIGN_LEFT;
  out += justifyRow(`Memo: ${data.invoice.invoiceNumber}`, `Type: ${data.invoice.saleType}`, colWidth) + '\n';
  out += justifyRow(`Date: ${data.invoice.date}`, data.invoice.time, colWidth) + '\n';

  if (data.customer) {
    out += `${divider}\n`;
    out += `Customer: ${data.customer.name}\n`;
    if (data.customer.phone) {
      out += `Phone: ${data.customer.phone}\n`;
    }
    if (data.customer.previousDue > 0) {
      out += justifyRow('Prev Due:', `Tk ${data.customer.previousDue.toFixed(2)}`, colWidth) + '\n';
    }
  }

  // 4. Items Table
  out += `${divider}\n`;
  if (paperWidth === '58mm') {
    out += justifyRow('Item / Qty x Rate', 'Total', colWidth) + '\n';
  } else {
    out += justifyRow('Item Description', 'Qty x Rate     Total', colWidth) + '\n';
  }
  out += `${divider}\n`;

  data.items.forEach((item) => {
    out += `${item.name}\n`;
    const details = `${item.qty} ${item.unit} x ${item.rate}`;
    out += justifyRow(`  ${details}`, String(item.total), colWidth) + '\n';
  });

  out += `${doubleDivider}\n`;

  // 5. Settlement & Math
  out += justifyRow('Sub Total:', `Tk ${data.summary.subTotal.toFixed(2)}`, colWidth) + '\n';
  if (data.summary.discount > 0) {
    out += justifyRow('Discount (-):', `Tk ${data.summary.discount.toFixed(2)}`, colWidth) + '\n';
  }

  out += ESC_COMMANDS.BOLD_ON;
  out += justifyRow('Grand Total:', `Tk ${data.summary.grandTotal.toFixed(2)}`, colWidth) + '\n';
  out += justifyRow('Cash Paid:', `Tk ${data.summary.cashPaid.toFixed(2)}`, colWidth) + '\n';

  if (data.summary.invoiceDue > 0) {
    out += justifyRow('Invoice Due:', `Tk ${data.summary.invoiceDue.toFixed(2)}`, colWidth) + '\n';
  }
  if (data.customer) {
    out += `${divider}\n`;
    out += justifyRow('Total Khata Due:', `Tk ${data.summary.customerTotalDueAfterSale.toFixed(2)}`, colWidth) + '\n';
  }
  out += ESC_COMMANDS.BOLD_OFF;

  // 6. Footer
  out += `${divider}\n`;
  out += ESC_COMMANDS.ALIGN_CENTER;
  out += 'Thank you, please come again!\n';
  out += 'Goods once sold are not returnable\n';
  out += 'Idris Brothers POS System - Feni\n';

  // 7. Feed & Cut
  out += ESC_COMMANDS.FEED_3;
  out += ESC_COMMANDS.CUT_PARTIAL;

  // Encode into binary Uint8Array
  const encoder = new TextEncoder();
  const binaryBuffer = encoder.encode(out);

  return {
    textPayload: out,
    binaryBuffer,
  };
}

/**
 * Triggers a download of raw ESC/POS binary file for direct USB spooling.
 */
export function downloadEscPosFile(data: ThermalReceiptData, paperWidth: '58mm' | '80mm' = '80mm') {
  const { binaryBuffer } = generateEscPosCommands(data, paperWidth);
  const blob = new Blob([binaryBuffer as unknown as BlobPart], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RECEIPT-${data.invoice.invoiceNumber}-${paperWidth}.prn`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
