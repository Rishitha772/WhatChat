
package app.whatchat.auth;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface AuthAccountRepository extends MongoRepository<AuthAccount, String> {

    Optional<AuthAccount> findByEmailIgnoreCase(String email);

    Optional<AuthAccount> findByVerificationTokenHash(String tokenHash);

    Optional<AuthAccount> findByResetTokenHash(String tokenHash);

    boolean existsByUsernameIgnoreCase(String username);
}
