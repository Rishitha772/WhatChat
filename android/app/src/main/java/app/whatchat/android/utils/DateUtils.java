package app.whatchat.android.utils;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class DateUtils {

    private static final SimpleDateFormat TIME_FORMAT = new SimpleDateFormat("hh:mm a", Locale.getDefault());
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("MMM dd, yyyy", Locale.getDefault());

    public static String formatTime(String isoString) {
        if (isoString == null || isoString.isEmpty()) return "";
        try {
            // ISO-8601 parsing fallback
            long epoch = java.time.Instant.parse(isoString).toEpochMilli();
            return TIME_FORMAT.format(new Date(epoch));
        } catch (Exception e) {
            return isoString;
        }
    }

    public static String formatDate(String isoString) {
        if (isoString == null || isoString.isEmpty()) return "";
        try {
            long epoch = java.time.Instant.parse(isoString).toEpochMilli();
            return DATE_FORMAT.format(new Date(epoch));
        } catch (Exception e) {
            return isoString;
        }
    }
}

