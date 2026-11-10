/**
 * Lightweight Code128B Barcode SVG Pattern Generator
 * Produces crisp, scan-ready vector barcodes for Idris Brothers POS & Thermal Label Printers.
 */

// Code128 patterns (index 0 to 106)
// Each number string represents widths of alternating bars (B) and spaces (S): [b1, s1, b2, s2, b3, s3]
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', // 0-9
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', // 10-19
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', // 20-29
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', // 30-39
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', // 40-49
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', // 50-59
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', // 60-69
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', // 70-79
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', // 80-89
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', // 90-99
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112' // 100-106 (106 is STOP pattern)
];

const START_CODE_B = 104;
const STOP_CODE = 106;

export interface BarcodeBar {
  x: number;
  width: number;
}

/**
 * Encodes an ASCII string into Code128 subset B bars.
 * Returns an array of dark bar coordinates and total barcode module width.
 */
export function generateCode128Bars(text: string, unitWidth = 2): { bars: BarcodeBar[]; totalWidth: number } {
  const safeText = (text || '100001').replace(/[^\x20-\x7E]/g, '');
  if (!safeText) {
    return { bars: [], totalWidth: 0 };
  }

  const codes: number[] = [START_CODE_B];
  for (let i = 0; i < safeText.length; i++) {
    codes.push(safeText.charCodeAt(i) - 32);
  }

  // Calculate checksum
  let checksum = codes[0];
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i;
  }
  codes.push(checksum % 103);
  codes.push(STOP_CODE);

  // Convert codes to widths
  let currentX = 10; // Left quiet zone
  const bars: BarcodeBar[] = [];

  for (let cIdx = 0; cIdx < codes.length; cIdx++) {
    const pattern = CODE128_PATTERNS[codes[cIdx]];
    if (!pattern) continue;

    for (let pIdx = 0; pIdx < pattern.length; pIdx++) {
      const width = parseInt(pattern[pIdx], 10) * unitWidth;
      const isBar = pIdx % 2 === 0;

      if (isBar) {
        bars.push({ x: currentX, width });
      }
      currentX += width;
    }
  }

  currentX += 10; // Right quiet zone
  return { bars, totalWidth: currentX };
}
