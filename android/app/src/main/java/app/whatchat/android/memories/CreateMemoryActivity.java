package app.whatchat.android.memories;

import android.os.Bundle;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import app.whatchat.android.databinding.ActivityCreateMemoryBinding;
import app.whatchat.android.network.ApiClient;
import app.whatchat.android.network.model.MySpaceEvent;
import java.time.Instant;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CreateMemoryActivity extends AppCompatActivity {

    private ActivityCreateMemoryBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityCreateMemoryBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.toolbar.setNavigationOnClickListener(v -> finish());

        binding.btnSaveCapsule.setOnClickListener(v -> {
            String title = binding.etTitle.getText().toString().trim();
            String category = binding.etCategory.getText().toString().trim();
            String description = binding.etDescription.getText().toString().trim();

            if (title.isEmpty()) {
                binding.etTitle.setError("Title is required");
                return;
            }

            Map<String, Object> payload = Map.of(
                    "title", title,
                    "category", category.isEmpty() ? "General" : category,
                    "description", description,
                    "eventDate", Instant.now().toString()
            );

            ApiClient.getService().createMySpaceEvent(payload).enqueue(new Callback<>() {
                @Override
                public void onResponse(@NonNull Call<MySpaceEvent> call, @NonNull Response<MySpaceEvent> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        Toast.makeText(CreateMemoryActivity.this, "Memory Capsule Created!", Toast.LENGTH_SHORT).show();
                        finish();
                    } else {
                        Toast.makeText(CreateMemoryActivity.this, "Failed to create capsule", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(@NonNull Call<MySpaceEvent> call, @NonNull Throwable t) {
                    Toast.makeText(CreateMemoryActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        });
    }
}

