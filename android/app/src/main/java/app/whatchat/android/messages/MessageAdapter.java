package app.whatchat.android.messages;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import app.whatchat.android.WhatChatApp;
import app.whatchat.android.databinding.ItemMessageReceivedBinding;
import app.whatchat.android.databinding.ItemMessageSentBinding;
import app.whatchat.android.network.model.MessageItem;
import app.whatchat.android.utils.DateUtils;
import com.bumptech.glide.Glide;
import java.util.List;

public class MessageAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private static final int TYPE_SENT = 1;
    private static final int TYPE_RECEIVED = 2;

    private final List<MessageItem> messages;
    private final String currentUserId;

    public MessageAdapter(List<MessageItem> messages) {
        this.messages = messages;
        this.currentUserId = WhatChatApp.getInstance().getSessionManager().getUserId();
    }

    @Override
    public int getItemViewType(int position) {
        MessageItem item = messages.get(position);
        if (currentUserId.equals(item.getSenderId()) || "You".equalsIgnoreCase(item.getSenderName())) {
            return TYPE_SENT;
        } else {
            return TYPE_RECEIVED;
        }
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater inflater = LayoutInflater.from(parent.getContext());
        if (viewType == TYPE_SENT) {
            ItemMessageSentBinding binding = ItemMessageSentBinding.inflate(inflater, parent, false);
            return new SentViewHolder(binding);
        } else {
            ItemMessageReceivedBinding binding = ItemMessageReceivedBinding.inflate(inflater, parent, false);
            return new ReceivedViewHolder(binding);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        MessageItem item = messages.get(position);
        if (holder instanceof SentViewHolder) {
            ((SentViewHolder) holder).bind(item);
        } else if (holder instanceof ReceivedViewHolder) {
            ((ReceivedViewHolder) holder).bind(item);
        }
    }

    @Override
    public int getItemCount() {
        return messages.size();
    }

    static class SentViewHolder extends RecyclerView.ViewHolder {
        private final ItemMessageSentBinding binding;

        public SentViewHolder(ItemMessageSentBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        public void bind(MessageItem item) {
            binding.tvText.setText(item.getText());
            binding.tvTime.setText(DateUtils.formatTime(item.getCreatedAt()));

            if (item.getMediaUrl() != null && !item.getMediaUrl().isEmpty()) {
                binding.ivMedia.setVisibility(View.VISIBLE);
                Glide.with(itemView.getContext()).load(item.getMediaUrl()).into(binding.ivMedia);
            } else {
                binding.ivMedia.setVisibility(View.GONE);
            }
        }
    }

    static class ReceivedViewHolder extends RecyclerView.ViewHolder {
        private final ItemMessageReceivedBinding binding;

        public ReceivedViewHolder(ItemMessageReceivedBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        public void bind(MessageItem item) {
            binding.tvText.setText(item.getText());
            binding.tvTime.setText(DateUtils.formatTime(item.getCreatedAt()));

            if (item.getSenderName() != null && !item.getSenderName().isEmpty()) {
                binding.tvSenderName.setVisibility(View.VISIBLE);
                binding.tvSenderName.setText(item.getSenderName());
            } else {
                binding.tvSenderName.setVisibility(View.GONE);
            }

            if (item.getMediaUrl() != null && !item.getMediaUrl().isEmpty()) {
                binding.ivMedia.setVisibility(View.VISIBLE);
                Glide.with(itemView.getContext()).load(item.getMediaUrl()).into(binding.ivMedia);
            } else {
                binding.ivMedia.setVisibility(View.GONE);
            }
        }
    }
}

