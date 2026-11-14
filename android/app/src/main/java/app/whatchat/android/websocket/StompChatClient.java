package app.whatchat.android.websocket;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import app.whatchat.android.storage.SessionManager;
import java.util.concurrent.TimeUnit;
import okhttp3.*;

public class StompChatClient {

    private static final String TAG = "StompChatClient";

    public interface MessageListener {
        void onMessageReceived(String topic, String payload);
    }

    private final String wsUrl;
    private final String token;
    private WebSocket webSocket;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private MessageListener listener;
    private boolean isConnected = false;

    public StompChatClient(SessionManager sessionManager) {
        String base = sessionManager.getBaseUrl();
        // Convert http:// to ws://
        String wsBase = base.replace("http://", "ws://").replace("https://", "wss://");
        if (!wsBase.endsWith("/")) wsBase += "/";
        this.wsUrl = wsBase + "ws";
        this.token = sessionManager.getToken();
    }

    public void setMessageListener(MessageListener listener) {
        this.listener = listener;
    }

    public void connect() {
        OkHttpClient client = new OkHttpClient.Builder()
                .readTimeout(0, TimeUnit.MILLISECONDS)
                .build();

        Request request = new Request.Builder()
                .url(wsUrl)
                .build();

        webSocket = client.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(@NonNull WebSocket ws, @NonNull Response response) {
                Log.d(TAG, "WebSocket connected, sending STOMP CONNECT");
                String connectFrame = "CONNECT\n" +
                        "accept-version:1.2,1.1,1.0\n" +
                        "heart-beat:10000,10000\n" +
                        (token != null ? "Authorization:Bearer " + token + "\n" : "") +
                        "\n\0";
                ws.send(connectFrame);
            }

            @Override
            public void onMessage(@NonNull WebSocket ws, @NonNull String text) {
                handleStompFrame(text);
            }

            @Override
            public void onFailure(@NonNull WebSocket ws, @NonNull Throwable t, @Nullable Response response) {
                Log.e(TAG, "WebSocket failure: " + t.getMessage());
                isConnected = false;
            }

            @Override
            public void onClosed(@NonNull WebSocket ws, int code, @NonNull String reason) {
                Log.d(TAG, "WebSocket closed: " + reason);
                isConnected = false;
            }
        });
    }

    private void handleStompFrame(String frame) {
        if (frame.startsWith("CONNECTED")) {
            Log.d(TAG, "STOMP protocol connected!");
            isConnected = true;
        } else if (frame.startsWith("MESSAGE")) {
            int bodyIndex = frame.indexOf("\n\n");
            if (bodyIndex == -1) {
                bodyIndex = frame.indexOf("\r\n\r\n");
            }
            if (bodyIndex != -1) {
                String body = frame.substring(bodyIndex + (frame.contains("\r\n\r\n") ? 4 : 2));
                if (body.endsWith("\0")) {
                    body = body.substring(0, body.length() - 1);
                }

                final String messagePayload = body;
                mainHandler.post(() -> {
                    if (listener != null) {
                        listener.onMessageReceived("", messagePayload);
                    }
                });
            }
        }
    }

    public void subscribe(String topic, String subId) {
        if (webSocket != null) {
            String frame = "SUBSCRIBE\n" +
                    "id:" + subId + "\n" +
                    "destination:" + topic + "\n" +
                    "\n\0";
            webSocket.send(frame);
            Log.d(TAG, "Subscribed to " + topic);
        }
    }

    public void send(String destination, String jsonPayload) {
        if (webSocket != null) {
            String frame = "SEND\n" +
                    "destination:" + destination + "\n" +
                    "content-type:application/json\n" +
                    "\n" +
                    jsonPayload +
                    "\0";
            webSocket.send(frame);
        }
    }

    public void disconnect() {
        if (webSocket != null) {
            String frame = "DISCONNECT\n\n\0";
            webSocket.send(frame);
            webSocket.close(1000, "Client disconnect");
            webSocket = null;
            isConnected = false;
        }
    }
}

