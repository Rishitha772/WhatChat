package app.whatchat.auth;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthAccountRepository extends MongoRepository<AuthAccount, String> {

    Optional<AuthAccount> findByEmailIgnoreCase(String email);

    Optional<AuthAccount> findByVerificationTokenHash(String tokenHash);

    Optional<AuthAccount> findByResetTokenHash(String tokenHash);

    Optional<AuthAccount> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);

    Optional<AuthAccount> findByPhoneNumber(String phoneNumber);

    List<AuthAccount> findByPhoneNumberIn(List<String> phoneNumbers);

    boolean existsByPhoneNumber(String phoneNumber);

    List<AuthAccount> findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(String nameQuery, String usernameQuery);
}
