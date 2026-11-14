package app.whatchat.android.storage;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

public class SessionManager {

    private static final String PREF_NAME = "whatchat_secure_session";
    private static final String KEY_TOKEN = "jwt_token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_EMAIL = "user_email";
    private static final String KEY_FULL_NAME = "user_full_name";
    private static final String KEY_USERNAME = "user_username";
    private static final String KEY_PHONE = "user_phone";
    private static final String KEY_AVATAR = "user_avatar";
    private static final String KEY_BASE_URL = "base_url";
    private static final String KEY_CONTACTS_LINKED = "contacts_linked_with_device";

    public static final String DEFAULT_EMULATOR_URL = "http://10.0.2.2:8080/";

    private SharedPreferences prefs;

    public SessionManager(Context context) {
        try {
            MasterKey masterKey = new MasterKey.Builder(context)
                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                    .build();

            prefs = EncryptedSharedPreferences.create(
                    context,
                    PREF_NAME,
                    masterKey,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM);
        } catch (Exception e) {
            // Fallback to private mode shared preferences if Keystore encounters provider
            // issues
            prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        }
    }

    public void saveSession(String token, String userId, String email, String fullName, String phone) {
        prefs.edit()
                .putString(KEY_TOKEN, token)
                .putString(KEY_USER_ID, userId)
                .putString(KEY_EMAIL, email)
                .putString(KEY_FULL_NAME, fullName)
                .putString(KEY_PHONE, phone)
                .apply();
    }

    public void updateProfile(String fullName, String username, String phone, String avatar) {
        prefs.edit()
                .putString(KEY_FULL_NAME, fullName)
                .putString(KEY_USERNAME, username)
                .putString(KEY_PHONE, phone)
                .putString(KEY_AVATAR, avatar)
                .apply();
    }

    public boolean isLoggedIn() {
        String token = getToken();
        return token != null && !token.trim().isEmpty();
    }

    public String getToken() {
        return prefs.getString(KEY_TOKEN, null);
    }

    public String getUserId() {
        return prefs.getString(KEY_USER_ID, "");
    }

    public String getUserEmail() {
        return prefs.getString(KEY_EMAIL, "");
    }

    public String getFullName() {
        return prefs.getString(KEY_FULL_NAME, "WhatChat User");
    }

    public String getUsername() {
        return prefs.getString(KEY_USERNAME, "");
    }

    public String getPhoneNumber() {
        return prefs.getString(KEY_PHONE, "");
    }

    public String getAvatarUrl() {
        return prefs.getString(KEY_AVATAR, null);
    }

    public String getBaseUrl() {
        return prefs.getString(KEY_BASE_URL, DEFAULT_EMULATOR_URL);
    }

    public void setBaseUrl(String url) {
        if (!url.endsWith("/")) {
            url += "/";
        }
        prefs.edit().putString(KEY_BASE_URL, url).apply();
    }

    public boolean isContactsLinked() {
        return prefs.getBoolean(KEY_CONTACTS_LINKED, false);
    }

    public void setContactsLinked(boolean linked) {
        prefs.edit().putBoolean(KEY_CONTACTS_LINKED, linked).apply();
    }

    public void clearSession() {
        String currentBaseUrl = getBaseUrl();
        prefs.edit().clear().apply();
        setBaseUrl(currentBaseUrl);
    }
}
