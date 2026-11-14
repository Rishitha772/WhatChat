package app.whatchat.android;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import app.whatchat.android.network.ApiClient;
import app.whatchat.android.storage.SessionManager;

public class WhatChatApp extends Application {

    public static final String CHANNEL_MESSAGES = "whatchat_messages";
    public static final String CHANNEL_UPDATES = "whatchat_updates";

    private static WhatChatApp instance;
    private SessionManager sessionManager;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        sessionManager = new SessionManager(this);
        ApiClient.init(sessionManager);
        createNotificationChannels();
    }

    public static WhatChatApp getInstance() {
        return instance;
    }

    public SessionManager getSessionManager() {
        return sessionManager;
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel msgChannel = new NotificationChannel(
                    CHANNEL_MESSAGES,
                    "Chat Messages",
                    NotificationManager.IMPORTANCE_HIGH
            );
            msgChannel.setDescription("Notifications for incoming direct and group messages");
            msgChannel.enableVibration(true);

            NotificationChannel updateChannel = new NotificationChannel(
                    CHANNEL_UPDATES,
                    "WhatChat Alerts",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            updateChannel.setDescription("Account and memory capsule alerts");

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(msgChannel);
                manager.createNotificationChannel(updateChannel);
            }
        }
    }
}

