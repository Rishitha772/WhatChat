package app.whatchat.android.network.model;

import com.google.gson.annotations.SerializedName;

public class UserView {
    @SerializedName("id")
    private String id;

    @SerializedName("email")
    private String email;

    @SerializedName("fullName")
    private String fullName;

    @SerializedName("username")
    private String username;

    @SerializedName("about")
    private String about;

    @SerializedName("phoneNumber")
    private String phoneNumber;

    @SerializedName("avatarUrl")
    private String avatarUrl;

    @SerializedName("emailVerified")
    private boolean emailVerified;

    @SerializedName("profileComplete")
    private boolean profileComplete;

    public String getId() { return id != null ? id : ""; }
    public String getEmail() { return email != null ? email : ""; }
    public String getFullName() { return fullName != null ? fullName : "User"; }
    public String getUsername() { return username != null ? username : ""; }
    public String getAbout() { return about != null ? about : "Hey there! I am using WhatChat."; }
    public String getPhoneNumber() { return phoneNumber != null ? phoneNumber : ""; }
    public String getAvatarUrl() { return avatarUrl; }
    public boolean isEmailVerified() { return emailVerified; }
    public boolean isProfileComplete() { return profileComplete; }
}

