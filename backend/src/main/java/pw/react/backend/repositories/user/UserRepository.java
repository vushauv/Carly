package pw.react.backend.repositories.user;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pw.react.backend.domain.user.UserTypeDictionary;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Page<User> findAll(Pageable pageable);

    Optional<User> findByUserId(Integer id);

    boolean existsByEmail(String email);
}
