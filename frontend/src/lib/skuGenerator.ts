/**
 * Enterprise 6-Digit Base SKU Auto-Generation Engine
 * Tailored for Idris Brothers Grocery & Spice POS (Bengali weights/units -> Barcode-ready Code128 ASCII).
 */

const BENGALI_DIGITS: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

const BENGALI_TERM_REPLACEMENTS: Array<[RegExp, string]> = [
  [/কিলোগ্রাম|কেজি/g, ' KG '],
  [/মিলিলিটার|মিলি/g, ' ML '],
  [/লিটার|লিঃ/g, ' L '],
  [/গ্রাম|গ্রাঃ/g, ' G '],
  [/প্যাকেট|প্যাক|প্যাঃ/g, ' PKT '],
  [/পিস/g, ' PCS '],
  [/বোতল/g, ' BTL '],
  [/বস্তা/g, ' BAG '],
  [/কার্টন/g, ' CTN '],
  [/ডজন/g, ' DZN '],
  [/টিন/g, ' TIN '],
  [/জার/g, ' JAR '],
  [/পাল্লা/g, ' PAL '],
  [/দেশি|দেশী/g, ' DESHI '],
  [/আমদানি|ইন্ডিয়ান|ভারতীয়/g, ' IMP '],
  [/বোল্ড/g, ' BOLD '],
  [/চিকন/g, ' SLIM '],
  [/মিনিকেট/g, ' MINI '],
  [/নাজিরশাইল/g, ' NAJIR '],
  [/ছোট/g, ' SM '],
  [/মাঝারি/g, ' MD '],
  [/বড়/g, ' LG '],
];

/**
 * Cryptographically random 6-digit number string (100000 - 999999).
 */
export function generateRandom6Digits(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return String(100000 + (array[0] % 900000));
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Normalizes Bengali/English grocery pack sizes into concise Code128-friendly suffixes.
 * Example: "৫০০ গ্রাম" -> "500G", "১ কেজি" -> "1KG", "৫০ কেজি বস্তা" -> "50KG-BAG"
 */
export function cleanGrocerySizeCode(variantName?: string | null): string {
  if (!variantName) return '';
  const trimmed = variantName.trim();
  const lower = trimmed.toLowerCase();
  if (!trimmed || lower === 'default' || lower === 'regular' || trimmed === '-') {
    return '';
  }

  let normalized = trimmed.replace(/[০-৯]/g, (d) => BENGALI_DIGITS[d] || d);

  for (const [pattern, replacement] of BENGALI_TERM_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  normalized = normalized
    .toUpperCase()
    .replace(/\bKILOGRAMS?\b|\bKGS?\b/g, 'KG')
    .replace(/\bMILLILITERS?\b|\bMLS?\b/g, 'ML')
    .replace(/\bLITERS?\b|\bLITRES?\b|\bLTR\b/g, 'L')
    .replace(/\bGRAMS?\b|\bGMS?\b/g, 'G')
    .replace(/\bPACKETS?\b|\bPACKS?\b|\bPKTS?\b/g, 'PKT')
    .replace(/\bPIECES?\b|\bPCS\b/g, 'PCS')
    .replace(/\bBOTTLES?\b/g, 'BTL')
    .replace(/\bSACKS?\b|\bBAGS?\b/g, 'BAG')
    .replace(/\bCARTONS?\b/g, 'CTN');

  normalized = normalized.replace(
    /(\d+(?:\.\d+)?)\s+(KG|G|ML|L|PKT|PCS|BTL|BAG|CTN|DZN|TIN|JAR|PAL)\b/g,
    '$1$2'
  );

  normalized = normalized
    .replace(/[\s_]+/g, '-')
    .replace(/[^A-Z0-9.-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '');

  return normalized.slice(0, 14).replace(/-+$/, '');
}

/**
 * Extracts existing 6-digit base code from variants or simpleSku if available.
 */
export function extractBaseProductCode(
  variants: Array<{ sku?: string | null }> = [],
  simpleSku?: string | null
): string | null {
  if (simpleSku) {
    const match = simpleSku.trim().match(/^(\d{6})(?:-|$)/);
    if (match) return match[1];
  }
  for (const v of variants) {
    if (v.sku) {
      const match = v.sku.trim().match(/^(\d{6})(?:-|$)/);
      if (match) return match[1];
    }
  }
  return null;
}

/**
 * Generates conflict-free SKUs for a list of variants sharing one 6-digit base code.
 */
export function generateProductVariantSkus<T extends { variantName: string; sku: string }>(
  variants: T[],
  options: {
    baseCode?: string;
    preserveExistingSkus?: boolean;
  } = {}
): T[] {
  const { preserveExistingSkus = true } = options;
  const resolvedBase =
    options.baseCode || extractBaseProductCode(variants) || generateRandom6Digits();

  const usedSkus = new Set<string>();

  // Reserve existing SKUs first when preserving
  if (preserveExistingSkus) {
    for (const v of variants) {
      if (v.sku && v.sku.trim()) {
        usedSkus.add(v.sku.trim());
      }
    }
  }

  return variants.map((v, idx) => {
    const existing = v.sku?.trim();
    if (preserveExistingSkus && existing) {
      return v;
    }

    const cleanSize = cleanGrocerySizeCode(v.variantName);
    const isDefault =
      !v.variantName ||
      v.variantName.trim().toLowerCase() === 'default' ||
      v.variantName.trim().toLowerCase() === 'regular' ||
      v.variantName.trim() === '-';

    const baseCandidate = cleanSize
      ? `${resolvedBase}-${cleanSize}`
      : isDefault
      ? resolvedBase
      : `${resolvedBase}-V${idx + 1}`;

    let candidate = baseCandidate;
    let suffix = 2;
    while (usedSkus.has(candidate)) {
      candidate = `${baseCandidate}-${suffix}`;
      suffix++;
    }
    usedSkus.add(candidate);

    return { ...v, sku: candidate };
  });
}

/**
 * Generates a single conflict-free SKU for a newly added or regenerated variant row.
 */
export function generateSingleVariantSku(
  variantName: string,
  allVariants: Array<{ variantName: string; sku: string }>,
  rowIndex: number,
  simpleSku?: string
): string {
  const baseCode = extractBaseProductCode(allVariants, simpleSku) || generateRandom6Digits();
  const used = new Set<string>(
    allVariants
      .filter((_, i) => i !== rowIndex)
      .map((v) => v.sku?.trim())
      .filter(Boolean) as string[]
  );

  const cleanSize = cleanGrocerySizeCode(variantName);
  const isDefault =
    !variantName ||
    variantName.trim().toLowerCase() === 'default' ||
    variantName.trim().toLowerCase() === 'regular' ||
    variantName.trim() === '-';

  const baseCandidate = cleanSize
    ? `${baseCode}-${cleanSize}`
    : isDefault
    ? baseCode
    : `${baseCode}-V${rowIndex + 1}`;

  let candidate = baseCandidate;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${baseCandidate}-${suffix}`;
    suffix++;
  }
  return candidate;
}
