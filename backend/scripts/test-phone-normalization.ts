/**
 * Test Suite: Bangladeshi Phone Number Normalization, Validation & Gateway Formatting
 */

import {
  normalizePhone,
  isValidBDPhone,
  toGatewayPhone,
  formatPhone,
  toEnglishDigits,
} from '../src/common/utils/phone';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`  ✔ [PASS] ${msg}`);
  }
}

console.log('========================================================================');
console.log('🧪 IDRIS BROTHERS: BANGLADESHI PHONE NUMBER TEST SUITE 🧪');
console.log('========================================================================\n');

console.log('📱 MODULE 1: Normalization to 11-digit Local Format (01XXXXXXXXX)');
assert(normalizePhone('01712345678') === '01712345678', 'Standard 11-digit number stays intact');
assert(normalizePhone('+8801712345678') === '01712345678', '+880 prefix converts to 01XXXXXXXXX');
assert(normalizePhone('8801712345678') === '01712345678', '880 (13 digit) prefix converts to 01XXXXXXXXX');
assert(normalizePhone('01712-345678') === '01712345678', 'Hyphenated phone numbers stripped');
assert(normalizePhone('01712 345 678') === '01712345678', 'Spaced phone numbers stripped');
assert(normalizePhone('(017) 1234-5678') === '01712345678', 'Parentheses and hyphens stripped');
assert(normalizePhone('1712345678') === '01712345678', '10-digit number without 0 prepends leading 0');
assert(normalizePhone('০১৭১২৩৪৫৬৭৮') === '01712345678', 'Bengali numerals converted to ASCII 01712345678');
assert(normalizePhone('+৮৮০১৭১২৩৪৫৬৭৮') === '01712345678', 'Bengali numerals with +৮৮০ prefix handled');
assert(normalizePhone('') === '', 'Empty string returns empty');
assert(normalizePhone(null) === '', 'Null returns empty');
assert(normalizePhone(undefined) === '', 'Undefined returns empty');

console.log('\n🛡️ MODULE 2: Operator Prefix & Length Validation (isValidBDPhone)');
// Valid Operators: 013, 014, 015, 016, 017, 018, 019
assert(isValidBDPhone('01312345678'), 'Valid GP 013');
assert(isValidBDPhone('01412345678'), 'Valid Banglalink 014');
assert(isValidBDPhone('01512345678'), 'Valid Teletalk 015');
assert(isValidBDPhone('01612345678'), 'Valid Airtel 016');
assert(isValidBDPhone('01712345678'), 'Valid GP 017');
assert(isValidBDPhone('01812345678'), 'Valid Robi 018');
assert(isValidBDPhone('01912345678'), 'Valid Banglalink 019');
assert(isValidBDPhone('+8801811223344'), 'Valid international prefix +8801811223344');
assert(isValidBDPhone('০১৭১২৩৪৫৬৭৮'), 'Valid Bengali digits phone number');

// Invalid Operators / Formats
assert(!isValidBDPhone('01212345678'), 'Invalid operator 012 rejected');
assert(!isValidBDPhone('01012345678'), 'Invalid operator 010 rejected');
assert(!isValidBDPhone('01112345678'), 'Defunct Citycell 011 rejected');
assert(!isValidBDPhone('0171234567'), '10-digit number (incomplete) rejected');
assert(!isValidBDPhone('017123456789'), '12-digit number rejected');
assert(!isValidBDPhone(''), 'Empty string rejected');
assert(!isValidBDPhone('abcdefghijk'), 'Non-numeric string rejected');
assert(!isValidBDPhone('01712345abc'), 'Alphanumeric mix rejected');

console.log('\n🌐 MODULE 3: SMS Gateway & Meta CAPI Format (toGatewayPhone)');
assert(toGatewayPhone('01712345678') === '8801712345678', 'Converts 01XXXXXXXXX to 8801XXXXXXXXX');
assert(toGatewayPhone('+8801712345678') === '8801712345678', 'Converts +8801712345678 to 8801712345678');
assert(toGatewayPhone('1712345678') === '8801712345678', 'Converts 1712345678 to 8801712345678');
assert(toGatewayPhone('০১৭১২৩৪৫৬৭৮') === '8801712345678', 'Converts Bengali digits to 8801712345678');
assert(toGatewayPhone('') === '', 'Empty string returns empty for gateway');

console.log('\n📄 MODULE 4: Display Formatting (formatPhone)');
assert(formatPhone('01712345678') === '01712-345678', 'Default hyphenated format');
assert(formatPhone('+8801712345678') === '01712-345678', 'Formats international input nicely');
assert(formatPhone('01712345678', ' ') === '01712 345678', 'Custom space separator');

console.log('\n========================================================================');
console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
console.log('========================================================================');
