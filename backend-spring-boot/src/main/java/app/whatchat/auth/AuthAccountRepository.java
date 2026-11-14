package app.whatchat.auth;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthAccountRepository extends JpaRepository<AuthAccount, String> {
    Optional<AuthAccount> findByEmailIgnoreCase(String email);
    Optional<AuthAccount> findByVerificationTokenHash(String tokenHash);
    Optional<AuthAccount> findByResetTokenHash(String tokenHash);
    boolean existsByUsernameIgnoreCase(String username);
}
