package app.whatchat.android.network;

import app.whatchat.android.network.model.*;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.http.*;

public interface ApiService {

    // --- Authentication ---
    @POST("api/v1/auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("api/v1/auth/register")
    Call<RegisterResponse> register(@Body RegisterRequest request);

    @POST("api/v1/auth/verify-email")
    Call<Map<String, String>> verifyEmail(@Body Map<String, String> tokenPayload);

    @POST("api/v1/auth/resend-verification")
    Call<Map<String, Object>> resendVerification(@Body Map<String, String> emailPayload);

    @POST("api/v1/auth/forgot-password")
    Call<Map<String, Object>> forgotPassword(@Body Map<String, String> emailPayload);

    @POST("api/v1/auth/logout")
    Call<Map<String, Object>> logout();

    @GET("api/v1/auth/me")
    Call<UserView> getCurrentUser();

    // --- User Profile ---
    @GET("api/v1/users/profile")
    Call<UserView> getProfile();

    @PUT("api/v1/users/profile")
    Call<UserView> updateProfile(@Body Map<String, String> payload);

    @GET("api/v1/users/search")
    Call<List<UserView>> searchUsers(@Query("q") String query);

    // --- Contacts & Synchronization ---
    @POST("api/v1/contacts/sync")
    Call<SyncContactsResponse> syncContacts(@Body SyncContactsRequest request);

    @GET("api/v1/contacts")
    Call<List<ContactItem>> getContacts();

    @POST("api/v1/contacts")
    Call<ContactItem> addContact(@Body Map<String, Object> payload);

    @GET("api/v1/contacts/search")
    Call<List<ContactItem>> searchContacts(@Query("q") String query);

    @DELETE("api/v1/contacts/{id}")
    Call<Map<String, Object>> deleteContact(@Path("id") String contactId);

    // --- Conversations & Chats ---
    @GET("api/v1/conversations")
    Call<List<ConversationItem>> getConversations();

    @POST("api/v1/conversations")
    Call<ConversationItem> createConversation(@Body Map<String, Object> payload);

    @POST("api/v1/conversations/group")
    Call<ConversationItem> createGroup(@Body Map<String, Object> payload);

    @GET("api/v1/conversations/{id}")
    Call<ConversationItem> getConversation(@Path("id") String conversationId);

    // --- Messages ---
    @GET("api/v1/messages/{conversationId}")
    Call<List<MessageItem>> getMessages(
            @Path("conversationId") String conversationId,
            @Query("page") int page,
            @Query("size") int size
    );

    @POST("api/v1/messages")
    Call<MessageItem> sendMessage(@Body SendMessageRequest request);

    @PUT("api/v1/messages/{id}/read")
    Call<MessageItem> markRead(@Path("id") String messageId);

    // --- My Space ---
    @GET("api/v1/myspace/events")
    Call<List<MySpaceEvent>> getMySpaceEvents(@Query("search") String search);

    @POST("api/v1/myspace/events")
    Call<MySpaceEvent> createMySpaceEvent(@Body Map<String, Object> payload);

    @GET("api/v1/myspace/events/{id}/messages")
    Call<List<MemoryEntry>> getEventMessages(@Path("id") String eventId);

    @POST("api/v1/myspace/events/{id}/messages")
    Call<MemoryEntry> addMemoryEntry(@Path("id") String eventId, @Body Map<String, Object> payload);
}

