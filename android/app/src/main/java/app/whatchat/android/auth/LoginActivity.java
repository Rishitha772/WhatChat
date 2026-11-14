package app.whatchat.android.auth;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import app.whatchat.android.MainActivity;
import app.whatchat.android.WhatChatApp;
import app.whatchat.android.databinding.ActivityLoginBinding;
import app.whatchat.android.network.ApiClient;
import app.whatchat.android.network.model.LoginRequest;
import app.whatchat.android.network.model.LoginResponse;
import app.whatchat.android.network.model.UserView;
import app.whatchat.android.storage.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private ActivityLoginBinding binding;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityLoginBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        sessionManager = WhatChatApp.getInstance().getSessionManager();
        binding.etServerUrl.setText(sessionManager.getBaseUrl());

        binding.btnLogin.setOnClickListener(v -> performLogin());

        binding.tvGotoRegister.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
        });
    }

    private void performLogin() {
        String email = binding.etEmail.getText().toString().trim();
        String password = binding.etPassword.getText().toString().trim();
        String customUrl = binding.etServerUrl.getText().toString().trim();

        if (email.isEmpty()) {
            binding.etEmail.setError("Email is required");
            return;
        }

        if (password.isEmpty()) {
            binding.etPassword.setError("Password is required");
            return;
        }

        if (!customUrl.isEmpty()) {
            sessionManager.setBaseUrl(customUrl);
            ApiClient.init(sessionManager);
        }

        binding.tvError.setVisibility(View.GONE);
        binding.progressLogin.setVisibility(View.VISIBLE);
        binding.btnLogin.setEnabled(false);

        ApiClient.getService().login(new LoginRequest(email, password)).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<LoginResponse> call, @NonNull Response<LoginResponse> response) {
                binding.progressLogin.setVisibility(View.GONE);
                binding.btnLogin.setEnabled(true);

                if (response.isSuccessful() && response.body() != null && response.body().getToken() != null) {
                    String token = response.body().getToken();
                    sessionManager.saveSession(token, "", email, "WhatChat User", "");

                    // Re-init with authenticated token
                    ApiClient.init(sessionManager);

                    // Fetch user details
                    fetchUserDetailsAndProceed();
                } else {
                    binding.tvError.setVisibility(View.VISIBLE);
                    binding.tvError.setText("Invalid email or password. Please try again.");
                }
            }

            @Override
            public void onFailure(@NonNull Call<LoginResponse> call, @NonNull Throwable t) {
                binding.progressLogin.setVisibility(View.GONE);
                binding.btnLogin.setEnabled(true);
                binding.tvError.setVisibility(View.VISIBLE);
                binding.tvError.setText("Connection failed: " + t.getMessage() + ". Check server URL.");
            }
        });
    }

    private void fetchUserDetailsAndProceed() {
        ApiClient.getService().getCurrentUser().enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<UserView> call, @NonNull Response<UserView> response) {
                if (response.isSuccessful() && response.body() != null) {
                    UserView user = response.body();
                    sessionManager.saveSession(
                            sessionManager.getToken(),
                            user.getId(),
                            user.getEmail(),
                            user.getFullName(),
                            user.getPhoneNumber()
                    );
                    sessionManager.updateProfile(user.getFullName(), user.getUsername(), user.getPhoneNumber(), user.getAvatarUrl());
                }

                Toast.makeText(LoginActivity.this, "Welcome to WhatChat!", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }

            @Override
            public void onFailure(@NonNull Call<UserView> call, @NonNull Throwable t) {
                // Proceed even if profile fetch has delay
                Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }
}

