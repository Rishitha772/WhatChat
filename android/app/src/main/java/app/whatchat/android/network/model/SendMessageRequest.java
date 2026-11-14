package app.whatchat.android.network.model;

import com.google.gson.annotations.SerializedName;

public class SendMessageRequest {
    @SerializedName("conversationId")
    private final String conversationId;

    @SerializedName("text")
    private final String text;

    @SerializedName("senderName")
    private final String senderName;

    @SerializedName("type")
    private final String type;

    @SerializedName("mediaUrl")
    private final String mediaUrl;

    public SendMessageRequest(String conversationId, String text, String senderName) {
        this(conversationId, text, senderName, "text", null);
    }

    public SendMessageRequest(String conversationId, String text, String senderName, String type, String mediaUrl) {
        this.conversationId = conversationId;
        this.text = text;
        this.senderName = senderName;
        this.type = type != null ? type : "text";
        this.mediaUrl = mediaUrl;
    }

    public String getConversationId() { return conversationId; }
    public String getText() { return text; }
    public String getSenderName() { return senderName; }
    public String getType() { return type; }
    public String getMediaUrl() { return mediaUrl; }
}

