package app.whatchat.android.contacts;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import app.whatchat.android.R;
import app.whatchat.android.databinding.ItemContactBinding;
import app.whatchat.android.network.model.ContactItem;
import com.bumptech.glide.Glide;
import java.util.List;

public class ContactsAdapter extends RecyclerView.Adapter<ContactsAdapter.ContactViewHolder> {

    public interface OnContactActionListener {
        void onStartChat(ContactItem contact);
        void onInvite(ContactItem contact);
    }

    private final List<ContactItem> contactList;
    private final OnContactActionListener listener;

    public ContactsAdapter(List<ContactItem> contactList, OnContactActionListener listener) {
        this.contactList = contactList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ContactViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemContactBinding binding = ItemContactBinding.inflate(
                LayoutInflater.from(parent.getContext()), parent, false);
        return new ContactViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ContactViewHolder holder, int position) {
        holder.bind(contactList.get(position));
    }

    @Override
    public int getItemCount() {
        return contactList.size();
    }

    class ContactViewHolder extends RecyclerView.ViewHolder {
        private final ItemContactBinding binding;

        public ContactViewHolder(ItemContactBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        public void bind(ContactItem item) {
            binding.tvContactName.setText(item.getDisplayName());
            binding.tvContactPhone.setText(item.getPhoneNumber());

            String initial = item.getDisplayName().isEmpty() ? "C" : item.getDisplayName().substring(0, 1).toUpperCase();
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

            if (item.isRegistered()) {
                binding.tvContactAbout.setText(item.getAbout());
                binding.btnAction.setText("Chat");
                binding.btnAction.setBackgroundResource(R.drawable.bg_squircle_primary);
                binding.btnAction.setTextColor(itemView.getContext().getColor(R.color.text_white));
                binding.btnAction.setOnClickListener(v -> {
                    if (listener != null) listener.onStartChat(item);
                });
            } else {
                binding.tvContactAbout.setText("Not registered on WhatChat");
                binding.btnAction.setText("Invite");
                binding.btnAction.setBackgroundResource(R.drawable.bg_squircle_soft);
                binding.btnAction.setTextColor(itemView.getContext().getColor(R.color.text_purple));
                binding.btnAction.setOnClickListener(v -> {
                    if (listener != null) listener.onInvite(item);
                });
            }
        }
    }
}

