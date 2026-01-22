package pw.react.backend.repositories.user;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndIsEnabledTrue(String email);

    Page<User> findAllByIsEnabledTrue(Pageable pageable);

    Optional<User> findByUserIdAndIsEnabledTrue(Integer id);

    boolean existsByEmailAndIsEnabledTrue(String email);
}
