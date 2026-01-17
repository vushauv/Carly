package pw.react.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.user.UserTypeDictionary;

import java.util.Optional;

public interface UserTypeDictionaryRepository extends JpaRepository<UserTypeDictionary, Short> {
    Optional<UserTypeDictionary> findByName(String name);
}

