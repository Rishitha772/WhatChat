package app.whatchat.android.network.model;

import com.google.gson.annotations.SerializedName;

public class RegisterResponse {
    @SerializedName("message")
    private String message;

    @SerializedName("emailVerified")
    private boolean emailVerified;

    @SerializedName("verificationLink")
    private String verificationLink;

    public String getMessage() { return message; }
    public boolean isEmailVerified() { return emailVerified; }
    public String getVerificationLink() { return verificationLink; }
}

