package app.whatchat.android.memories;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import app.whatchat.android.databinding.FragmentMyspaceBinding;
import app.whatchat.android.network.ApiClient;
import app.whatchat.android.network.model.MySpaceEvent;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MySpaceFragment extends Fragment {

    private FragmentMyspaceBinding binding;
    private MemoryTimelineAdapter adapter;
    private final List<MySpaceEvent> eventList = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMyspaceBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        adapter = new MemoryTimelineAdapter(eventList, event -> {
            Toast.makeText(requireContext(), "Capsule: " + event.getTitle(), Toast.LENGTH_SHORT).show();
        });

        binding.rvCapsules.setLayoutManager(new LinearLayoutManager(requireContext()));
        binding.rvCapsules.setAdapter(adapter);

        binding.btnCreateCapsule.setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), CreateMemoryActivity.class));
        });

        binding.swipeRefreshMyspace.setOnRefreshListener(this::loadEvents);
    }

    @Override
    public void onResume() {
        super.onResume();
        loadEvents();
    }

    private void loadEvents() {
        binding.progressMyspace.setVisibility(View.VISIBLE);
        ApiClient.getService().getMySpaceEvents("").enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<MySpaceEvent>> call, @NonNull Response<List<MySpaceEvent>> response) {
                if (!isAdded()) return;
                binding.progressMyspace.setVisibility(View.GONE);
                binding.swipeRefreshMyspace.setRefreshing(false);

                if (response.isSuccessful() && response.body() != null) {
                    eventList.clear();
                    eventList.addAll(response.body());
                    adapter.notifyDataSetChanged();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<MySpaceEvent>> call, @NonNull Throwable t) {
                if (!isAdded()) return;
                binding.progressMyspace.setVisibility(View.GONE);
                binding.swipeRefreshMyspace.setRefreshing(false);
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}

