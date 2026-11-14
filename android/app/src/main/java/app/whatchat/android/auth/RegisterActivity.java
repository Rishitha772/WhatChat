package app.whatchat.android.auth;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import app.whatchat.android.databinding.ActivityRegisterBinding;
import app.whatchat.android.network.ApiClient;
import app.whatchat.android.network.model.RegisterRequest;
import app.whatchat.android.network.model.RegisterResponse;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    private ActivityRegisterBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityRegisterBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnRegister.setOnClickListener(v -> performRegister());
        binding.tvGotoLogin.setOnClickListener(v -> finish());
    }

    private void performRegister() {
        String name = binding.etRegName.getText().toString().trim();
        String email = binding.etRegEmail.getText().toString().trim();
        String password = binding.etRegPassword.getText().toString().trim();

        if (name.isEmpty()) {
            binding.etRegName.setError("Full name is required");
            return;
        }

        if (email.isEmpty()) {
            binding.etRegEmail.setError("Email is required");
            return;
        }

        if (password.length() < 8) {
            binding.etRegPassword.setError("Password must be at least 8 characters");
            return;
        }

        binding.tvRegError.setVisibility(View.GONE);
        binding.progressRegister.setVisibility(View.VISIBLE);
        binding.btnRegister.setEnabled(false);

        ApiClient.getService().register(new RegisterRequest(name, email, password)).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<RegisterResponse> call, @NonNull Response<RegisterResponse> response) {
                binding.progressRegister.setVisibility(View.GONE);
                binding.btnRegister.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(RegisterActivity.this, "Account created! Please sign in.", Toast.LENGTH_LONG).show();
                    finish();
                } else {
                    binding.tvRegError.setVisibility(View.VISIBLE);
                    binding.tvRegError.setText("Registration failed. An account may already use this email.");
                }
            }

            @Override
            public void onFailure(@NonNull Call<RegisterResponse> call, @NonNull Throwable t) {
                binding.progressRegister.setVisibility(View.GONE);
                binding.btnRegister.setEnabled(true);
                binding.tvRegError.setVisibility(View.VISIBLE);
                binding.tvRegError.setText("Network error: " + t.getMessage());
            }
        });
    }
}

