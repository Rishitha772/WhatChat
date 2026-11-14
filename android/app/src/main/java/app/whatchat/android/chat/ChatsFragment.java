package app.whatchat.android.chat;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import app.whatchat.android.databinding.FragmentChatsBinding;
import app.whatchat.android.messages.ConversationActivity;
import app.whatchat.android.network.ApiClient;
import app.whatchat.android.network.model.ConversationItem;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ChatsFragment extends Fragment {

    private FragmentChatsBinding binding;
    private ChatListAdapter adapter;
    private final List<ConversationItem> conversations = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentChatsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        adapter = new ChatListAdapter(conversations, conversation -> {
            Intent intent = new Intent(requireContext(), ConversationActivity.class);
            intent.putExtra("conversationId", conversation.getId());
            intent.putExtra("conversationName", conversation.getName());
            intent.putExtra("isGroup", conversation.isGroup());
            startActivity(intent);
        });

        binding.rvChats.setLayoutManager(new LinearLayoutManager(requireContext()));
        binding.rvChats.setAdapter(adapter);

        binding.swipeRefresh.setOnRefreshListener(this::fetchConversations);
        fetchConversations();
    }

    private void fetchConversations() {
        binding.progressBar.setVisibility(View.VISIBLE);
        ApiClient.getService().getConversations().enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<ConversationItem>> call, @NonNull Response<List<ConversationItem>> response) {
                if (!isAdded()) return;
                binding.progressBar.setVisibility(View.GONE);
                binding.swipeRefresh.setRefreshing(false);

                if (response.isSuccessful() && response.body() != null) {
                    conversations.clear();
                    conversations.addAll(response.body());
                    adapter.notifyDataSetChanged();

                    if (conversations.isEmpty()) {
                        binding.layoutEmpty.setVisibility(View.VISIBLE);
                        binding.rvChats.setVisibility(View.GONE);
                    } else {
                        binding.layoutEmpty.setVisibility(View.GONE);
                        binding.rvChats.setVisibility(View.VISIBLE);
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<ConversationItem>> call, @NonNull Throwable t) {
                if (!isAdded()) return;
                binding.progressBar.setVisibility(View.GONE);
                binding.swipeRefresh.setRefreshing(false);
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}

