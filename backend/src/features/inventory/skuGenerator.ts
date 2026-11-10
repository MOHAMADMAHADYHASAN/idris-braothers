import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

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
  return String(crypto.randomInt(100000, 1000000));
}

/**
 * Normalizes a grocery variant name (including Bengali weights/units) into a compact ASCII suffix.
 * Returns "" for Default/Regular or non-mappable text.
 * Example: "৫০০ গ্রাম" -> "500G", "১.৫ লিটার" -> "1.5L", "৫০ কেজি বস্তা" -> "50KG-BAG"
 */
export function cleanGrocerySizeCode(variantName?: string | null): string {
  if (!variantName) return '';
  const trimmed = variantName.trim();
  const lower = trimmed.toLowerCase();
  if (!trimmed || lower === 'default' || lower === 'regular' || trimmed === '-') {
    return '';
  }

  // 1. Convert Bengali digits -> ASCII digits
  let normalized = trimmed.replace(/[০-৯]/g, (d) => BENGALI_DIGITS[d] || d);

  // 2. Replace Bengali grocery terms
  for (const [pattern, replacement] of BENGALI_TERM_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  // 3. Normalize common English unit aliases
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

  // 4. Attach numeric values directly to measurement units (e.g. "500 G" -> "500G")
  normalized = normalized.replace(
    /(\d+(?:\.\d+)?)\s+(KG|G|ML|L|PKT|PCS|BTL|BAG|CTN|DZN|TIN|JAR|PAL)\b/g,
    '$1$2'
  );

  // 5. Keep only ASCII alphanumeric, dot, hyphen
  normalized = normalized
    .replace(/[\s_]+/g, '-')
    .replace(/[^A-Z0-9.-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '');

  return normalized.slice(0, 14).replace(/-+$/, '');
}

/**
 * Extracts a leading 6-digit base code from existing variant SKUs (e.g. "684192-500G" -> "684192").
 */
export function extractBaseProductCode(
  variants?: Array<{ sku?: string | null }>,
  simpleSku?: string | null
): string | null {
  if (simpleSku) {
    const match = simpleSku.trim().match(/^(\d{6})(?:-|$)/);
    if (match) return match[1];
  }
  if (variants) {
    for (const v of variants) {
      if (v.sku) {
        const match = v.sku.trim().match(/^(\d{6})(?:-|$)/);
        if (match) return match[1];
      }
    }
  }
  return null;
}

/**
 * Generates a unique 6-digit base code verified against the database (up to 25 collision retries).
 */
export async function generateUniqueBaseCode(
  tx: Prisma.TransactionClient | typeof prisma = prisma
): Promise<string> {
  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = generateRandom6Digits();
    const conflict = await tx.productVariant.findFirst({
      where: {
        OR: [{ sku: candidate }, { sku: { startsWith: `${candidate}-` } }],
      },
      select: { id: true },
    });
    if (!conflict) {
      return candidate;
    }
  }
  // High-entropy fallback if random space gets crowded
  return `${generateRandom6Digits()}${Math.floor(Math.random() * 10)}`;
}

/**
 * Builds a guaranteed-unique variant SKU inside a product batch and against DB.
 */
export async function generateUniqueVariantSku(
  baseCode: string,
  variantName: string | undefined | null,
  variantIndex: number,
  usedInBatch: Set<string>,
  tx: Prisma.TransactionClient | typeof prisma = prisma
): Promise<string> {
  const cleanSize = cleanGrocerySizeCode(variantName);
  const isDefaultName =
    !variantName ||
    variantName.trim().toLowerCase() === 'default' ||
    variantName.trim().toLowerCase() === 'regular' ||
    variantName.trim() === '-';

  const baseCandidate = cleanSize
    ? `${baseCode}-${cleanSize}`
    : isDefaultName
    ? baseCode
    : `${baseCode}-V${variantIndex + 1}`;

  let candidate = baseCandidate;
  let suffixIndex = 2;

  while (true) {
    if (!usedInBatch.has(candidate)) {
      const dbConflict = await tx.productVariant.findUnique({
        where: { sku: candidate },
        select: { id: true },
      });
      if (!dbConflict) {
        usedInBatch.add(candidate);
        return candidate;
      }
    }
    candidate = `${baseCandidate}-${suffixIndex}`;
    suffixIndex++;
  }
}
