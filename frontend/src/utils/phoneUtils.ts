/**
 * Phone number normalization, validation, and browser contact integration.
 * Adheres to international E.164 format (+[country code][national subscriber number]).
 */

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

/**
 * Normalizes a raw phone number into strict E.164 format.
 * Examples:
 *   "+91 98765 43210" -> "+919876543210"
 *   "(555) 123-4567", defaultCountryCode "+1" -> "+15551234567"
 *   "0044 7911 123456" -> "+447911123456"
 */
export function normalizePhoneNumber(rawPhone: string, defaultCountryCode = '+91'): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') return null;

  // 1. Remove all spaces, dashes, parentheses, dots
  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '').trim();

  // 2. Replace international trunk prefix 00 with +
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }

  // 3. If no plus prefix, add default country code
  if (!cleaned.startsWith('+')) {
    const cc = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    // Strip leading national trunk 0 (e.g. 09876543210 -> +919876543210)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    cleaned = cc + cleaned;
  }

  // 4. Validate against E.164 standard
  if (E164_REGEX.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Checks if a string is a valid E.164 phone number.
 */
export function isValidE164(phone: string): boolean {
  return E164_REGEX.test(phone);
}

/**
 * Formats an E.164 number nicely for display (e.g. "+91 98765 43210").
 */
export function formatDisplayPhone(phone?: string): string {
  if (!phone) return '';
  if (!phone.startsWith('+')) return phone;
  // If Indian +91
  if (phone.startsWith('+91') && phone.length === 13) {
    return `+91 ${phone.substring(3, 8)} ${phone.substring(8)}`;
  }
  // If US/CA +1
  if (phone.startsWith('+1') && phone.length === 12) {
    return `+1 (${phone.substring(2, 5)}) ${phone.substring(5, 8)}-${phone.substring(8)}`;
  }
  return phone;
}

/**
 * Detects whether the current browser supports the W3C Contact Picker API.
 * Supported on mobile browsers (Chrome Android 80+, etc.).
 */
export function isContactPickerSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'contacts' in navigator &&
    'ContactsManager' in window &&
    typeof (navigator as any).contacts?.select === 'function'
  );
}

/**
 * Requests contact access from the device through the browser Contact Picker API.
 * Throws an error or returns contact list.
 */
export async function pickDeviceContacts(): Promise<Array<{ name: string; phoneNumber: string }>> {
  if (!isContactPickerSupported()) {
    throw new Error('UNSUPPORTED_PLATFORM');
  }

  const props = ['name', 'tel'];
  const opts = { multiple: true };

  try {
    const rawList = await (navigator as any).contacts.select(props, opts);
    if (!Array.isArray(rawList)) return [];

    const results: Array<{ name: string; phoneNumber: string }> = [];
    for (const item of rawList) {
      const name = item.name?.[0] || 'Device Contact';
      const phones = item.tel || [];
      for (const p of phones) {
        if (p && typeof p === 'string') {
          results.push({ name, phoneNumber: p });
        }
      }
    }
    return results;
  } catch (err: any) {
    if (err?.name === 'SecurityError' || err?.name === 'NotAllowedError') {
      throw new Error('PERMISSION_DENIED');
    }
    if (err?.name === 'AbortError') {
      throw new Error('USER_CANCELLED');
    }
    throw err;
  }
}

/**
 * Parses user pasted or manually typed contacts into normalized items.
 * Supports lines like:
 *   "Rahul, +91 9876543210"
 *   "Priya: +919876543211"
 *   "+919876543212"
 */
export function parseManualContacts(rawText: string, defaultCountryCode = '+91'): Array<{ name: string; phoneNumber: string }> {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/[\r\n;,]+/);
  const list: Array<{ name: string; phoneNumber: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for "Name, Phone" or "Name: Phone" or "Name - Phone"
    const match = trimmed.match(/^([^,:–-]+)[:,\t–-]\s*(.+)$/);
    if (match) {
      const name = match[1].trim();
      const phone = match[2].trim();
      const normalized = normalizePhoneNumber(phone, defaultCountryCode);
      if (normalized) {
        list.push({ name: name || 'Contact', phoneNumber: normalized });
      }
    } else {
      // Just phone number
      const normalized = normalizePhoneNumber(trimmed, defaultCountryCode);
      if (normalized) {
        list.push({ name: 'Contact', phoneNumber: normalized });
      }
    }
  }

  return list;
}

/**
 * Parses vCard (.vcf) address book export format.
 */
export function parseVCard(vcfContent: string, defaultCountryCode = '+91'): Array<{ name: string; phoneNumber: string }> {
  const cards = vcfContent.split(/BEGIN:VCARD/i);
  const list: Array<{ name: string; phoneNumber: string }> = [];

  for (const card of cards) {
    if (!card.trim()) continue;
    let name = 'Contact';
    const nameMatch = card.match(/FN:(.+)/i) || card.match(/N:(?:[^;]*;)?([^;]+)/i);
    if (nameMatch) {
      name = nameMatch[1].trim();
    }

    const telMatches = card.matchAll(/TEL[^:]*:(.+)/gi);
    for (const tm of telMatches) {
      const rawTel = tm[1].trim();
      const normalized = normalizePhoneNumber(rawTel, defaultCountryCode);
      if (normalized) {
        list.push({ name, phoneNumber: normalized });
      }
    }
  }

  return list;
}

/**
 * Invites a contact to WhatChat using Web Share API or falls back to clipboard copy.
 */
export async function shareWhatChatInvite(contactName?: string): Promise<{ shared: boolean; message: string }> {
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://whatchat.app';
  const nameSalutation = contactName && contactName !== 'Contact' ? `Hey ${contactName}! ` : 'Hey! ';
  const inviteText = `${nameSalutation}I'm using WhatChat for real-time messaging and personal memories. Chat with me here: ${appUrl}`;

  if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
    try {
      await (navigator as any).share({
        title: 'Join me on WhatChat',
        text: inviteText,
        url: appUrl,
      });
      return { shared: true, message: 'Invite shared successfully!' };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { shared: false, message: 'Share was cancelled.' };
      }
    }
  }

  // Fallback to Clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(inviteText);
      return { shared: true, message: 'Invite link copied to clipboard! Paste it into SMS or WhatsApp.' };
    }
  } catch {
    // ignore
  }

  return { shared: false, message: `Share link: ${appUrl}` };
}

