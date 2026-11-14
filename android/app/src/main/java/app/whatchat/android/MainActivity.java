package app.whatchat.android;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import app.whatchat.android.chat.ChatsFragment;
import app.whatchat.android.contacts.ContactsFragment;
import app.whatchat.android.databinding.ActivityMainBinding;
import app.whatchat.android.memories.MySpaceFragment;
import app.whatchat.android.profile.ProfileFragment;

public class MainActivity extends AppCompatActivity {

    private ActivityMainBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Default to Chats
        if (savedInstanceState == null) {
            loadFragment(new ChatsFragment(), getString(R.string.nav_chats));
        }

        binding.bottomNavigation.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_chats) {
                loadFragment(new ChatsFragment(), getString(R.string.nav_chats));
                return true;
            } else if (itemId == R.id.nav_contacts) {
                loadFragment(new ContactsFragment(), getString(R.string.nav_contacts));
                return true;
            } else if (itemId == R.id.nav_myspace) {
                loadFragment(new MySpaceFragment(), getString(R.string.nav_myspace));
                return true;
            } else if (itemId == R.id.nav_profile) {
                loadFragment(new ProfileFragment(), getString(R.string.nav_profile));
                return true;
            }
            return false;
        });
    }

    private void loadFragment(Fragment fragment, String title) {
        if (binding.toolbar != null) {
            binding.toolbar.setTitle(title);
        }
        getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .commit();
    }
}

