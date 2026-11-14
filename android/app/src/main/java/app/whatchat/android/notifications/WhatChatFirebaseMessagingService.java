package app.whatchat.android.notifications;

import android.app.PendingIntent;
import android.content.Intent;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import app.whatchat.android.MainActivity;
import app.whatchat.android.R;
import app.whatchat.android.WhatChatApp;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class WhatChatFirebaseMessagingService extends FirebaseMessagingService {

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        // Send token to backend or associate with session
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        String title = remoteMessage.getNotification() != null ?
                remoteMessage.getNotification().getTitle() : "WhatChat Message";
        String body = remoteMessage.getNotification() != null ?
                remoteMessage.getNotification().getBody() : "You received a new message";

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent,
                PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, WhatChatApp.CHANNEL_MESSAGES)
                .setSmallIcon(R.drawable.ic_nav_chats)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent);

        try {
            NotificationManagerCompat manager = NotificationManagerCompat.from(this);
            manager.notify((int) System.currentTimeMillis(), builder.build());
        } catch (SecurityException ignored) {
            // Permission check on Android 13+
        }
    }
}

