package pw.react.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
