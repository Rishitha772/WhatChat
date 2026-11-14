package app.whatchat.android.network.model;

import com.google.gson.annotations.SerializedName;

public class MessageItem {
    @SerializedName("id")
    private String id;

    @SerializedName("conversationId")
    private String conversationId;

    @SerializedName("senderId")
    private String senderId;

    @SerializedName("senderName")
    private String senderName;

    @SerializedName("text")
    private String text;

    @SerializedName("type")
    private String type; // "text", "image", "audio", "file"

    @SerializedName("mediaUrl")
    private String mediaUrl;

    @SerializedName("status")
    private String status; // "sent", "delivered", "read"

    @SerializedName("createdAt")
    private String createdAt;

    public String getId() { return id != null ? id : ""; }
    public String getConversationId() { return conversationId != null ? conversationId : ""; }
    public String getSenderId() { return senderId != null ? senderId : ""; }
    public String getSenderName() { return senderName != null ? senderName : "User"; }
    public String getText() { return text != null ? text : ""; }
    public String getType() { return type != null ? type : "text"; }
    public String getMediaUrl() { return mediaUrl; }
    public String getStatus() { return status != null ? status : "sent"; }
    public String getCreatedAt() { return createdAt != null ? createdAt : ""; }
}

