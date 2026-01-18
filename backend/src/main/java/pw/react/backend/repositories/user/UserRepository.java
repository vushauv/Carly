package pw.react.backend.repositories.user;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.user.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndIsEnabledTrue(String email);

    List<User> findAllByIsEnabledTrue();

    Optional<User> findByUserIdAndIsEnabledTrue(Integer id);

    boolean existsByEmailAndIsEnabledTrue(String email);
}
