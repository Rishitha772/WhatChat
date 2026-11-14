package app.whatchat.android.network;

import app.whatchat.android.storage.SessionManager;
import java.util.concurrent.TimeUnit;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {

    private static ApiClient instance;
    private final ApiService apiService;
    private final OkHttpClient okHttpClient;
    private final Retrofit retrofit;

    private ApiClient(SessionManager sessionManager) {
        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        logging.setLevel(HttpLoggingInterceptor.Level.BODY);

        okHttpClient = new OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(20, TimeUnit.SECONDS)
                .writeTimeout(20, TimeUnit.SECONDS)
                .addInterceptor(new AuthInterceptor(sessionManager))
                .addInterceptor(logging)
                .build();

        retrofit = new Retrofit.Builder()
                .baseUrl(sessionManager.getBaseUrl())
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        apiService = retrofit.create(ApiService.class);
    }

    public static synchronized void init(SessionManager sessionManager) {
        instance = new ApiClient(sessionManager);
    }

    public static synchronized ApiClient getInstance() {
        if (instance == null) {
            throw new IllegalStateException("ApiClient not initialized. Call init() first.");
        }
        return instance;
    }

    public ApiService getApiService() {
        return apiService;
    }

    public OkHttpClient getOkHttpClient() {
        return okHttpClient;
    }

    public static ApiService getService() {
        return getInstance().getApiService();
    }
}

