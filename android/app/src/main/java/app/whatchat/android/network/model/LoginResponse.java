package app.whatchat.android.network.model;

import com.google.gson.annotations.SerializedName;

public class LoginResponse {
    @SerializedName("token")
    private String token;

    @SerializedName("profileComplete")
    private boolean profileComplete;

    public String getToken() { return token; }
    public boolean isProfileComplete() { return profileComplete; }
}

