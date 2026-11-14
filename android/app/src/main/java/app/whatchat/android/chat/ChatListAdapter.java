package app.whatchat.android.chat;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import app.whatchat.android.databinding.ItemConversationBinding;
import app.whatchat.android.network.model.ConversationItem;
import app.whatchat.android.utils.DateUtils;
import com.bumptech.glide.Glide;
import java.util.List;

public class ChatListAdapter extends RecyclerView.Adapter<ChatListAdapter.ChatViewHolder> {

    public interface OnChatClickListener {
        void onChatClick(ConversationItem conversation);
    }

    private final List<ConversationItem> conversations;
    private final OnChatClickListener listener;

    public ChatListAdapter(List<ConversationItem> conversations, OnChatClickListener listener) {
        this.conversations = conversations;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ChatViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemConversationBinding binding = ItemConversationBinding.inflate(
                LayoutInflater.from(parent.getContext()), parent, false);
        return new ChatViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ChatViewHolder holder, int position) {
        holder.bind(conversations.get(position));
    }

    @Override
    public int getItemCount() {
        return conversations.size();
    }

    class ChatViewHolder extends RecyclerView.ViewHolder {
        private final ItemConversationBinding binding;

        public ChatViewHolder(ItemConversationBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        public void bind(ConversationItem item) {
            binding.tvName.setText(item.getName());
            binding.tvLastMessage.setText(item.getLastMessage().isEmpty() ? "Tap to chat" : item.getLastMessage());
            binding.tvTime.setText(DateUtils.formatTime(item.getLastMessageTime()));

            String initial = item.getName().isEmpty() ? "C" : item.getName().substring(0, 1).toUpperCase();
            binding.tvAvatarInitial.setText(initial);

            if (item.getAvatarUrl() != null && !item.getAvatarUrl().isEmpty()) {
                binding.ivAvatar.setVisibility(View.VISIBLE);
                binding.tvAvatarInitial.setVisibility(View.GONE);
                Glide.with(itemView.getContext())
                        .load(item.getAvatarUrl())
                        .into(binding.ivAvatar);
            } else {
                binding.ivAvatar.setVisibility(View.GONE);
                binding.tvAvatarInitial.setVisibility(View.VISIBLE);
            }

            if (item.getUnreadCount() > 0) {
                binding.tvUnreadBadge.setVisibility(View.VISIBLE);
                binding.tvUnreadBadge.setText(String.valueOf(item.getUnreadCount()));
            } else {
                binding.tvUnreadBadge.setVisibility(View.GONE);
            }

            itemView.setOnClickListener(v -> {
                if (listener != null) listener.onChatClick(item);
            });
        }
    }
}

