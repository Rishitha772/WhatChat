package app.whatchat.android.network.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class SyncContactsRequest {
    @SerializedName("contacts")
    private final List<ContactItem> contacts;

    public SyncContactsRequest(List<ContactItem> contacts) {
        this.contacts = contacts;
    }

    public List<ContactItem> getContacts() {
        return contacts;
    }
}

