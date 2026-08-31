/**
 * amountToWords.ts
 * Converts a numeric amount to Indian currency words.
 * Example: 43000 → "Forty Three Thousand Rupees Only"
 */

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

function convertHundreds(n: number): string {
  if (n === 0) return '';
  let result = '';
  if (n >= 100) {
    result += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    result += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    result += ones[n] + ' ';
  }
  return result.trim();
}

export function amountToWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  let n = rounded;
  const parts: string[] = [];

  // Crores (10,000,000)
  if (n >= 10000000) {
    const crores = Math.floor(n / 10000000);
    parts.push(convertHundreds(crores) + ' Crore');
    n %= 10000000;
  }

  // Lakhs (100,000)
  if (n >= 100000) {
    const lakhs = Math.floor(n / 100000);
    parts.push(convertHundreds(lakhs) + ' Lakh');
    n %= 100000;
  }

  // Thousands
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    parts.push(convertHundreds(thousands) + ' Thousand');
    n %= 1000;
  }

  // Remainder
  if (n > 0) {
    parts.push(convertHundreds(n));
  }

  return parts.join(' ') + ' Rupees Only';
}
