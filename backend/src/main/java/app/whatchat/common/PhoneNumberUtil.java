package app.whatchat.common;

import java.util.regex.Pattern;

/**
 * Utility for international phone number normalization and validation.
 * Enforces the international E.164 standard format (+[country code][subscriber number]).
 */
public final class PhoneNumberUtil {

    private static final Pattern E164_PATTERN = Pattern.compile("^\\+[1-9]\\d{6,14}$");

    private PhoneNumberUtil() {}

    /**
     * Normalizes a phone number into strict E.164 format (+[country_code][national_number]).
     *
     * @param rawPhone The raw phone number string from user or device address book.
     * @param defaultCountryCode Optional country code (e.g. "+91" or "91") if input lacks a plus prefix.
     * @return Normalized E.164 phone string (e.g. "+919876543210"), or null if invalid.
     */
    public static String normalize(String rawPhone, String defaultCountryCode) {
        if (rawPhone == null || rawPhone.isBlank()) {
            return null;
        }

        // 1. Remove all spaces, dashes, parentheses, dots, and common formatting artifacts
        String cleaned = rawPhone.replaceAll("[\\s\\-\\(\\)\\.]", "").trim();

        // 2. Replace international double zero prefix ("00") with standard "+"
        if (cleaned.startsWith("00")) {
            cleaned = "+" + cleaned.substring(2);
        }

        // 3. Handle numbers without a leading "+"
        if (!cleaned.startsWith("+")) {
            if (defaultCountryCode != null && !defaultCountryCode.isBlank()) {
                String cc = defaultCountryCode.trim().startsWith("+")
                        ? defaultCountryCode.trim()
                        : "+" + defaultCountryCode.trim();
                // Strip national trunk prefix '0' if present (e.g. 09876543210 -> +919876543210)
                if (cleaned.startsWith("0")) {
                    cleaned = cleaned.substring(1);
                }
                cleaned = cc + cleaned;
            } else {
                cleaned = "+" + cleaned;
            }
        }

        // 4. Validate against E.164 regex (+[1-9] followed by 6 to 14 digits)
        if (E164_PATTERN.matcher(cleaned).matches()) {
            return cleaned;
        }

        return null;
    }

    /**
     * Convenience method for normalizing numbers that typically already include country codes.
     */
    public static String normalize(String rawPhone) {
        return normalize(rawPhone, null);
    }

    /**
     * Checks if a phone number string matches strict E.164 format.
     */
    public static boolean isValidE164(String phone) {
        return phone != null && E164_PATTERN.matcher(phone).matches();
    }
}

