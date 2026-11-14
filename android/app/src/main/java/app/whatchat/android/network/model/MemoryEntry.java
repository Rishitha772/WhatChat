package app.whatchat.android.network.model;

import com.google.gson.annotations.SerializedName;

public class MemoryEntry {
    @SerializedName("id")
    private String id;

    @SerializedName("eventId")
    private String eventId;

    @SerializedName("text")
    private String text;

    @SerializedName("type")
    private String type; // "note", "photo", "voice"

    @SerializedName("mediaUrl")
    private String mediaUrl;

    @SerializedName("createdAt")
    private String createdAt;

    public String getId() { return id != null ? id : ""; }
    public String getEventId() { return eventId != null ? eventId : ""; }
    public String getText() { return text != null ? text : ""; }
    public String getType() { return type != null ? type : "note"; }
    public String getMediaUrl() { return mediaUrl; }
    public String getCreatedAt() { return createdAt != null ? createdAt : ""; }
}

