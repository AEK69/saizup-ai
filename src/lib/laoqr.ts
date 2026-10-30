// Lao QR / BCEL One EMVCo Standard QR Code Generator
// Compliant with Bank of the Lao PDR (BOL) and LAPNet / BCEL OnePay specifications

/**
 * Calculates CRC16-CCITT checksum for EMVCo QR strings
 */
export function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Formats an EMVCo TLV (Tag-Length-Value) field
 */
function tlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

export interface LaoQrOptions {
  accountNumber?: string;
  merchantName?: string;
  merchantCity?: string;
  amount: number;
  orderId: string;
}

/**
 * Generates an official EMVCo Lao QR string scanable by BCEL One & any Lao banking app
 * Currency: 418 (Lao Kip - LAK)
 */
export function generateLaoQrPayload(options: LaoQrOptions): string {
  const merchantAccount = options.accountNumber || '010120000889977001';
  const merchantName = options.merchantName || 'SAIZUP AI STUDIO';
  const merchantCity = options.merchantCity || 'VIENTIANE';

  // Tag 26: Merchant Account Information for Lao QR (LAPNet / BCEL One)
  const tag26Sub00 = tlv('00', 'LA.BOL.LAOQR');
  const tag26Sub01 = tlv('01', merchantAccount);
  const tag26Value = `${tag26Sub00}${tag26Sub01}`;
  const tag26 = tlv('26', tag26Value);

  // Tag 62: Additional Data Field (Reference / Order ID)
  const tag62Sub01 = tlv('01', options.orderId.replace(/[^A-Za-z0-9]/g, ''));
  const tag62Value = `${tag62Sub01}`;
  const tag62 = tlv('62', tag62Value);

  // Construct base EMVCo payload
  let raw =
    tlv('00', '01') + // Format indicator
    tlv('01', '12') + // 12 = Dynamic QR (with specific amount)
    tag26 +
    tlv('52', '0000') + // Merchant category
    tlv('53', '418') + // Currency: 418 = LAK (Lao Kip)
    tlv('54', Math.round(options.amount).toString()) + // Amount in Kip
    tlv('58', 'LA') + // Country code: Laos
    tlv('59', merchantName.slice(0, 25)) + // Merchant name
    tlv('60', merchantCity.slice(0, 15)) + // City
    tag62 +
    '6304'; // Tag 63 with length 04 for CRC

  const checksum = crc16(raw);
  return `${raw}${checksum}`;
}
