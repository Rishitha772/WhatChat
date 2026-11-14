package app.whatchat.android.messages;

import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.PickVisualMediaRequest;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import app.whatchat.android.WhatChatApp;
import app.whatchat.android.databinding.ActivityConversationBinding;
import app.whatchat.android.network.ApiClient;
import app.whatchat.android.network.model.MessageItem;
import app.whatchat.android.network.model.SendMessageRequest;
import app.whatchat.android.storage.SessionManager;
import app.whatchat.android.websocket.StompChatClient;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ConversationActivity extends AppCompatActivity {

    private ActivityConversationBinding binding;
    private MessageAdapter adapter;
    private final List<MessageItem> messageList = new ArrayList<>();
    private String conversationId;
    private String conversationName;
    private SessionManager sessionManager;
    private StompChatClient stompClient;
    private final Gson gson = new Gson();

    private final ActivityResultLauncher<PickVisualMediaRequest> pickMedia =
            registerForActivityResult(new ActivityResultContracts.PickVisualMedia(), uri -> {
                if (uri != null) {
                    sendImageMessage(uri);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityConversationBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        sessionManager = WhatChatApp.getInstance().getSessionManager();
        conversationId = getIntent().getStringExtra("conversationId");
        conversationName = getIntent().getStringExtra("conversationName");

        if (conversationName != null) {
            binding.tvChatTitle.setText(conversationName);
            String initial = conversationName.isEmpty() ? "C" : conversationName.substring(0, 1).toUpperCase();
            binding.tvHeaderAvatarInitial.setText(initial);
        }

        binding.btnBack.setOnClickListener(v -> finish());

        adapter = new MessageAdapter(messageList);
        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        layoutManager.setStackFromEnd(true);
        binding.rvMessages.setLayoutManager(layoutManager);
        binding.rvMessages.setAdapter(adapter);

        binding.btnSend.setOnClickListener(v -> {
            String text = binding.etMessage.getText().toString().trim();
            if (!text.isEmpty()) {
                sendTextMessage(text);
            }
        });

        binding.btnAttach.setOnClickListener(v -> {
            pickMedia.launch(new PickVisualMediaRequest.Builder()
                    .setMediaType(ActivityResultContracts.PickVisualMedia.ImageOnly.INSTANCE)
                    .build());
        });

        loadMessages();
        setupWebSocket();
    }

    private void loadMessages() {
        if (conversationId == null) return;
        ApiClient.getService().getMessages(conversationId, 0, 50).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<MessageItem>> call, @NonNull Response<List<MessageItem>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    messageList.clear();
                    messageList.addAll(response.body());
                    adapter.notifyDataSetChanged();
                    if (!messageList.isEmpty()) {
                        binding.rvMessages.scrollToPosition(messageList.size() - 1);
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<MessageItem>> call, @NonNull Throwable t) {
                // Ignore silent failure
            }
        });
    }

    private void setupWebSocket() {
        stompClient = new StompChatClient(sessionManager);
        stompClient.setMessageListener((topic, payload) -> {
            try {
                MessageItem incoming = gson.fromJson(payload, MessageItem.class);
                if (incoming != null && conversationId.equals(incoming.getConversationId())) {
                    boolean alreadyExists = false;
                    for (MessageItem item : messageList) {
                        if (item.getId().equals(incoming.getId())) {
                            alreadyExists = true;
                            break;
                        }
                    }
                    if (!alreadyExists) {
                        messageList.add(incoming);
                        adapter.notifyItemInserted(messageList.size() - 1);
                        binding.rvMessages.smoothScrollToPosition(messageList.size() - 1);
                    }
                }
            } catch (Exception ignored) {}
        });

        stompClient.connect();
        if (conversationId != null) {
            stompClient.subscribe("/topic/conversations." + conversationId, "sub-" + conversationId);
        }
    }

    private void sendTextMessage(String text) {
        binding.etMessage.setText("");

        SendMessageRequest request = new SendMessageRequest(
                conversationId,
                text,
                sessionManager.getFullName()
        );

        ApiClient.getService().sendMessage(request).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<MessageItem> call, @NonNull Response<MessageItem> response) {
                if (response.isSuccessful() && response.body() != null) {
                    messageList.add(response.body());
                    adapter.notifyItemInserted(messageList.size() - 1);
                    binding.rvMessages.smoothScrollToPosition(messageList.size() - 1);
                }
            }

            @Override
            public void onFailure(@NonNull Call<MessageItem> call, @NonNull Throwable t) {
                Toast.makeText(ConversationActivity.this, "Failed to send message", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void sendImageMessage(Uri uri) {
        // Send image message with URI
        SendMessageRequest request = new SendMessageRequest(
                conversationId,
                "Photo",
                sessionManager.getFullName(),
                "image",
                uri.toString()
        );

        ApiClient.getService().sendMessage(request).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<MessageItem> call, @NonNull Response<MessageItem> response) {
                if (response.isSuccessful() && response.body() != null) {
                    messageList.add(response.body());
                    adapter.notifyItemInserted(messageList.size() - 1);
                    binding.rvMessages.smoothScrollToPosition(messageList.size() - 1);
                }
            }

            @Override
            public void onFailure(@NonNull Call<MessageItem> call, @NonNull Throwable t) {
                Toast.makeText(ConversationActivity.this, "Failed to send photo", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (stompClient != null) {
            stompClient.disconnect();
        }
    }
}

