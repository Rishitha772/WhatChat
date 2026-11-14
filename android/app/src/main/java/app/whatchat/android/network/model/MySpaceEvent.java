package app.whatchat.android.network.model;

import com.google.gson.annotations.SerializedName;

public class MySpaceEvent {
    @SerializedName("id")
    private String id;

    @SerializedName("title")
    private String title;

    @SerializedName("description")
    private String description;

    @SerializedName("category")
    private String category;

    @SerializedName("coverImageUrl")
    private String coverImageUrl;

    @SerializedName("eventDate")
    private String eventDate;

    @SerializedName("messageCount")
    private int messageCount;

    public String getId() { return id != null ? id : ""; }
    public String getTitle() { return title != null ? title : "Memory Capsule"; }
    public String getDescription() { return description != null ? description : ""; }
    public String getCategory() { return category != null ? category : "General"; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public String getEventDate() { return eventDate != null ? eventDate : ""; }
    public int getMessageCount() { return messageCount; }
}

