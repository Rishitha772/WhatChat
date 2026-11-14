package app.whatchat.android.network.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class ConversationItem {
    @SerializedName("id")
    private String id;

    @SerializedName("name")
    private String name;

    @SerializedName("type")
    private String type; // "direct" or "group"

    @SerializedName("avatarUrl")
    private String avatarUrl;

    @SerializedName("participants")
    private List<String> participants;

    @SerializedName("lastMessage")
    private String lastMessage;

    @SerializedName("lastMessageTime")
    private String lastMessageTime;

    @SerializedName("unreadCount")
    private int unreadCount;

    public String getId() { return id != null ? id : ""; }
    public String getName() { return name != null ? name : "Chat"; }
    public String getType() { return type != null ? type : "direct"; }
    public boolean isGroup() { return "group".equalsIgnoreCase(type); }
    public String getAvatarUrl() { return avatarUrl; }
    public List<String> getParticipants() { return participants; }
    public String getLastMessage() { return lastMessage != null ? lastMessage : ""; }
    public String getLastMessageTime() { return lastMessageTime != null ? lastMessageTime : ""; }
    public int getUnreadCount() { return unreadCount; }
}

