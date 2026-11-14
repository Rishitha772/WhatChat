package app.whatchat.android.network.model;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;

public class SyncContactsResponse {
    @SerializedName("matchedContacts")
    private List<ContactItem> matchedContacts;

    @SerializedName("unregisteredContacts")
    private List<ContactItem> unregisteredContacts;

    @SerializedName("matchedCount")
    private int matchedCount;

    @SerializedName("unregisteredCount")
    private int unregisteredCount;

    public List<ContactItem> getMatchedContacts() {
        return matchedContacts != null ? matchedContacts : new ArrayList<>();
    }

    public List<ContactItem> getUnregisteredContacts() {
        return unregisteredContacts != null ? unregisteredContacts : new ArrayList<>();
    }

    public int getMatchedCount() { return matchedCount; }
    public int getUnregisteredCount() { return unregisteredCount; }
}

