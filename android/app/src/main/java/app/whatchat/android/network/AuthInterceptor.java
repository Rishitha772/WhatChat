package app.whatchat.android.network;

import androidx.annotation.NonNull;
import app.whatchat.android.storage.SessionManager;
import java.io.IOException;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

public class AuthInterceptor implements Interceptor {

    private final SessionManager sessionManager;

    public AuthInterceptor(SessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    @NonNull
    @Override
    public Response intercept(@NonNull Chain chain) throws IOException {
        Request original = chain.request();
        Request.Builder builder = original.newBuilder();

        builder.header("Accept", "application/json");

        if (sessionManager != null && sessionManager.isLoggedIn()) {
            String token = sessionManager.getToken();
            if (token != null && !token.isBlank()) {
                builder.header("Authorization", "Bearer " + token);
            }
        }

        return chain.proceed(builder.build());
    }
}

