package app.whatchat.android.contacts;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.provider.ContactsContract;
import androidx.annotation.NonNull;
import app.whatchat.android.network.ApiClient;
import app.whatchat.android.network.model.ContactItem;
import app.whatchat.android.network.model.SyncContactsRequest;
import app.whatchat.android.network.model.SyncContactsResponse;
import app.whatchat.android.utils.PhoneNumberNormalizer;
import java.util.*;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ContactSyncManager {

    public interface SyncCallback {
        void onSuccess(SyncContactsResponse response);
        void onError(String errorMessage);
    }

    public static void readDeviceContactsAndSync(Context context, String defaultCountryCode, SyncCallback callback) {
        new Thread(() -> {
            List<ContactItem> extractedList = new ArrayList<>();
            Set<String> seenNumbers = new HashSet<>();

            ContentResolver resolver = context.getContentResolver();
            Cursor cursor = null;

            try {
                String[] projection = new String[]{
                        ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                        ContactsContract.CommonDataKinds.Phone.NUMBER
                };

                cursor = resolver.query(
                        ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                        projection,
                        null,
                        null,
                        ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " ASC"
                );

                if (cursor != null) {
                    int nameIndex = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME);
                    int numberIndex = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER);

                    while (cursor.moveToNext()) {
                        String name = cursor.getString(nameIndex);
                        String rawNumber = cursor.getString(numberIndex);

                        String normalized = PhoneNumberNormalizer.normalize(rawNumber, defaultCountryCode);
                        if (normalized != null && !seenNumbers.contains(normalized)) {
                            seenNumbers.add(normalized);
                            extractedList.add(new ContactItem(name != null ? name : "Contact", normalized));
                        }
                    }
                }
            } catch (Exception e) {
                if (callback != null) {
                    callback.onError("Failed to read device contacts: " + e.getMessage());
                }
                return;
            } finally {
                if (cursor != null) cursor.close();
            }

            // Sync with backend API
            ApiClient.getService().syncContacts(new SyncContactsRequest(extractedList)).enqueue(new Callback<>() {
                @Override
                public void onResponse(@NonNull Call<SyncContactsResponse> call, @NonNull Response<SyncContactsResponse> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        if (callback != null) callback.onSuccess(response.body());
                    } else {
                        if (callback != null) callback.onError("Server responded with code " + response.code());
                    }
                }

                @Override
                public void onFailure(@NonNull Call<SyncContactsResponse> call, @NonNull Throwable t) {
                    if (callback != null) callback.onError(t.getMessage());
                }
            });
        }).start();
    }
}

