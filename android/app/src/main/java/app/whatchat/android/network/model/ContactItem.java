package app.whatchat.android.network.model;

import com.google.gson.annotations.SerializedName;

public class ContactItem {
    @SerializedName("id")
    private String id;

    @SerializedName("contactUserId")
    private String contactUserId;

    @SerializedName("userId")
    private String userId;

    @SerializedName("displayName")
    private String displayName;

    @SerializedName("name")
    private String name;

    @SerializedName("phoneNumber")
    private String phoneNumber;

    @SerializedName("username")
    private String username;

    @SerializedName("avatarUrl")
    private String avatarUrl;

    @SerializedName("profilePicture")
    private String profilePicture;

    @SerializedName("about")
    private String about;

    @SerializedName("isRegistered")
    private boolean isRegistered;

    public ContactItem() {}

    public ContactItem(String name, String phoneNumber) {
        this.displayName = name;
        this.name = name;
        this.phoneNumber = phoneNumber;
    }

    public String getId() { return id != null ? id : (contactUserId != null ? contactUserId : userId); }
    public String getContactUserId() { return contactUserId != null ? contactUserId : (userId != null ? userId : id); }
    public String getDisplayName() { return displayName != null ? displayName : (name != null ? name : "Contact"); }
    public String getPhoneNumber() { return phoneNumber != null ? phoneNumber : ""; }
    public String getUsername() { return username != null ? username : ""; }
    public String getAvatarUrl() { return avatarUrl != null ? avatarUrl : profilePicture; }
    public String getAbout() { return about != null ? about : "Hey there! I am using WhatChat."; }
    public boolean isRegistered() { return isRegistered; }
    public void setRegistered(boolean registered) { isRegistered = registered; }
}

