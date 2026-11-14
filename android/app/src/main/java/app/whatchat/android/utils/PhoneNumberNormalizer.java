package app.whatchat.android.utils;

public class PhoneNumberNormalizer {

    private static final String E164_REGEX = "^\\+[1-9]\\d{6,14}$";

    /**
     * Normalizes a raw phone number into strict international E.164 format.
     * e.g.: "+91 98765 43210" -> "+919876543210"
     * "09876543210" with default "+91" -> "+919876543210"
     */
    public static String normalize(String rawNumber, String defaultCountryCode) {
        if (rawNumber == null || rawNumber.trim().isEmpty()) {
            return null;
        }

        String cleaned = rawNumber.replaceAll("[^0-9+]", "");
        if (cleaned.isEmpty()) {
            return null;
        }

        String normalized;
        if (cleaned.startsWith("+")) {
            normalized = cleaned;
        } else if (cleaned.startsWith("00")) {
            normalized = "+" + cleaned.substring(2);
        } else if (cleaned.startsWith("0")) {
            String prefix = (defaultCountryCode != null && !defaultCountryCode.isEmpty()) ? defaultCountryCode : "+91";
            if (!prefix.startsWith("+")) prefix = "+" + prefix;
            normalized = prefix + cleaned.substring(1);
        } else {
            String prefix = (defaultCountryCode != null && !defaultCountryCode.isEmpty()) ? defaultCountryCode : "+91";
            if (!prefix.startsWith("+")) prefix = "+" + prefix;
            normalized = prefix + cleaned;
        }

        if (normalized.matches(E164_REGEX)) {
            return normalized;
        }

        return null;
    }

    public static boolean isValidE164(String number) {
        return number != null && number.matches(E164_REGEX);
    }
}

