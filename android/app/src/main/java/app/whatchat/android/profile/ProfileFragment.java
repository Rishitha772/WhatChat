package app.whatchat.android.profile;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import app.whatchat.android.WhatChatApp;
import app.whatchat.android.auth.LoginActivity;
import app.whatchat.android.databinding.FragmentProfileBinding;
import app.whatchat.android.network.ApiClient;
import app.whatchat.android.network.model.UserView;
import app.whatchat.android.storage.SessionManager;
import java.util.HashMap;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileFragment extends Fragment {

    private FragmentProfileBinding binding;
    private SessionManager sessionManager;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState) {
        binding = FragmentProfileBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        sessionManager = WhatChatApp.getInstance().getSessionManager();

        binding.tvProfileName.setText(sessionManager.getFullName());
        binding.tvProfileEmail.setText(sessionManager.getUserEmail());
        binding.etFullName.setText(sessionManager.getFullName());
        binding.etUsername.setText(sessionManager.getUsername());
        binding.etPhone.setText(sessionManager.getPhoneNumber());

        String initial = sessionManager.getFullName().isEmpty() ? "U"
                : sessionManager.getFullName().substring(0, 1).toUpperCase();
        binding.tvAvatarInitial.setText(initial);

        loadProfile();

        binding.btnSaveProfile.setOnClickListener(v -> saveProfile());
        binding.btnLogout.setOnClickListener(v -> logout());
    }

    private void loadProfile() {
        ApiClient.getService().getProfile().enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<UserView> call, @NonNull Response<UserView> response) {
                if (!isAdded())
                    return;
                if (response.isSuccessful() && response.body() != null) {
                    UserView user = response.body();
                    binding.tvProfileName.setText(user.getFullName());
                    binding.tvProfileEmail.setText(user.getEmail());
                    binding.etFullName.setText(user.getFullName());
                    binding.etUsername.setText(user.getUsername());
                    binding.etPhone.setText(user.getPhoneNumber());
                    binding.etAbout.setText(user.getAbout());

                    sessionManager.updateProfile(user.getFullName(), user.getUsername(), user.getPhoneNumber(),
                            user.getAvatarUrl());
                }
            }

            @Override
            public void onFailure(@NonNull Call<UserView> call, @NonNull Throwable t) {
                // Ignore silent failure
            }
        });
    }

    private void saveProfile() {
        String name = binding.etFullName.getText().toString().trim();
        String username = binding.etUsername.getText().toString().trim();
        String phone = binding.etPhone.getText().toString().trim();
        String about = binding.etAbout.getText().toString().trim();

        if (name.isEmpty()) {
            binding.etFullName.setError("Name cannot be empty");
            return;
        }

        Map<String, String> payload = new HashMap<>();
        payload.put("fullName", name);
        payload.put("username", username);
        payload.put("phoneNumber", phone);
        payload.put("about", about);

        binding.btnSaveProfile.setEnabled(false);
        ApiClient.getService().updateProfile(payload).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<UserView> call, @NonNull Response<UserView> response) {
                if (!isAdded())
                    return;
                binding.btnSaveProfile.setEnabled(true);
                if (response.isSuccessful() && response.body() != null) {
                    UserView user = response.body();
                    sessionManager.updateProfile(user.getFullName(), user.getUsername(), user.getPhoneNumber(),
                            user.getAvatarUrl());
                    binding.tvProfileName.setText(user.getFullName());
                    Toast.makeText(requireContext(), "Profile updated successfully!", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(requireContext(), "Failed to update profile", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<UserView> call, @NonNull Throwable t) {
                if (!isAdded())
                    return;
                binding.btnSaveProfile.setEnabled(true);
                Toast.makeText(requireContext(), "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void logout() {
        sessionManager.clearSession();
        Intent intent = new Intent(requireContext(), LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        requireActivity().finish();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
