package app.whatchat.android.contacts;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import app.whatchat.android.R;
import app.whatchat.android.WhatChatApp;
import app.whatchat.android.databinding.FragmentContactsBinding;
import app.whatchat.android.messages.ConversationActivity;
import app.whatchat.android.network.ApiClient;
import app.whatchat.android.network.model.ContactItem;
import app.whatchat.android.network.model.ConversationItem;
import app.whatchat.android.network.model.SyncContactsResponse;
import app.whatchat.android.storage.SessionManager;
import java.util.*;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ContactsFragment extends Fragment {

    private FragmentContactsBinding binding;
    private ContactsAdapter adapter;
    private final List<ContactItem> displayedContacts = new ArrayList<>();
    private SessionManager sessionManager;

    private final ActivityResultLauncher<String> requestPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
                if (isGranted) {
                    performDeviceContactSync();
                } else {
                    Toast.makeText(requireContext(), "Contact permission was denied.", Toast.LENGTH_SHORT).show();
                }
            });

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentContactsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        sessionManager = WhatChatApp.getInstance().getSessionManager();

        adapter = new ContactsAdapter(displayedContacts, new ContactsAdapter.OnContactActionListener() {
            @Override
            public void onStartChat(ContactItem contact) {
                openChatWithContact(contact);
            }

            @Override
            public void onInvite(ContactItem contact) {
                shareInviteLink(contact);
            }
        });

        binding.rvContacts.setLayoutManager(new LinearLayoutManager(requireContext()));
        binding.rvContacts.setAdapter(adapter);

        binding.btnSyncContacts.setOnClickListener(v -> showPermissionExplanationAndRequest());
        binding.btnResync.setOnClickListener(v -> performDeviceContactSync());

        updateUiState();
    }

    private void updateUiState() {
        if (sessionManager.isContactsLinked()) {
            binding.layoutPermissionGate.setVisibility(View.GONE);
            binding.layoutContactsContent.setVisibility(View.VISIBLE);
            loadSavedContacts();
        } else {
            binding.layoutPermissionGate.setVisibility(View.VISIBLE);
            binding.layoutContactsContent.setVisibility(View.GONE);
        }
    }

    private void showPermissionExplanationAndRequest() {
        new AlertDialog.Builder(requireContext())
                .setTitle(R.string.contacts_permission_title)
                .setMessage(R.string.contacts_permission_desc)
                .setPositiveButton(R.string.allow_and_sync, (dialog, which) -> {
                    if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_CONTACTS)
                            == PackageManager.PERMISSION_GRANTED) {
                        performDeviceContactSync();
                    } else {
                        requestPermissionLauncher.launch(Manifest.permission.READ_CONTACTS);
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void performDeviceContactSync() {
        binding.progressContacts.setVisibility(View.VISIBLE);

        ContactSyncManager.readDeviceContactsAndSync(requireContext(), "+91", new ContactSyncManager.SyncCallback() {
            @Override
            public void onSuccess(SyncContactsResponse response) {
                if (!isAdded()) return;
                requireActivity().runOnUiThread(() -> {
                    binding.progressContacts.setVisibility(View.GONE);
                    sessionManager.setContactsLinked(true);
                    updateUiState();

                    displayedContacts.clear();
                    if (response.getMatchedContacts() != null) {
                        displayedContacts.addAll(response.getMatchedContacts());
                    }
                    if (response.getUnregisteredContacts() != null) {
                        displayedContacts.addAll(response.getUnregisteredContacts());
                    }
                    adapter.notifyDataSetChanged();
                    binding.tvContactsCount.setText("Contacts (" + displayedContacts.size() + ")");
                    Toast.makeText(requireContext(), "Matched " + response.getMatchedCount() + " WhatChat friends!", Toast.LENGTH_SHORT).show();
                });
            }

            @Override
            public void onError(String errorMessage) {
                if (!isAdded()) return;
                requireActivity().runOnUiThread(() -> {
                    binding.progressContacts.setVisibility(View.GONE);
                    Toast.makeText(requireContext(), "Sync failed: " + errorMessage, Toast.LENGTH_LONG).show();
                });
            }
        });
    }

    private void loadSavedContacts() {
        binding.progressContacts.setVisibility(View.VISIBLE);
        ApiClient.getService().getContacts().enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<ContactItem>> call, @NonNull Response<List<ContactItem>> response) {
                if (!isAdded()) return;
                binding.progressContacts.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    displayedContacts.clear();
                    for (ContactItem item : response.body()) {
                        item.setRegistered(true);
                        displayedContacts.add(item);
                    }
                    adapter.notifyDataSetChanged();
                    binding.tvContactsCount.setText("Contacts (" + displayedContacts.size() + ")");
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<ContactItem>> call, @NonNull Throwable t) {
                if (!isAdded()) return;
                binding.progressContacts.setVisibility(View.GONE);
            }
        });
    }

    private void openChatWithContact(ContactItem contact) {
        String recipientId = contact.getContactUserId();
        Map<String, Object> payload = Map.of(
                "type", "direct",
                "recipientId", recipientId
        );

        binding.progressContacts.setVisibility(View.VISIBLE);
        ApiClient.getService().createConversation(payload).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<ConversationItem> call, @NonNull Response<ConversationItem> response) {
                if (!isAdded()) return;
                binding.progressContacts.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    Intent intent = new Intent(requireContext(), ConversationActivity.class);
                    intent.putExtra("conversationId", response.body().getId());
                    intent.putExtra("conversationName", contact.getDisplayName());
                    intent.putExtra("isGroup", false);
                    startActivity(intent);
                }
            }

            @Override
            public void onFailure(@NonNull Call<ConversationItem> call, @NonNull Throwable t) {
                if (!isAdded()) return;
                binding.progressContacts.setVisibility(View.GONE);
                Toast.makeText(requireContext(), "Failed to open conversation", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void shareInviteLink(ContactItem contact) {
        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_SUBJECT, "Join WhatChat");
        shareIntent.putExtra(Intent.EXTRA_TEXT, getString(R.string.share_invite_text));
        startActivity(Intent.createChooser(shareIntent, getString(R.string.share_invite_link)));
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}

