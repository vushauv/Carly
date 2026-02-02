package pw.react.backend.repositories.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pw.react.backend.domain.user.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Page<User> findAll(Pageable pageable);

    Optional<User> findByUserId(Integer id);

    boolean existsByEmail(String email);

    @Query("""
            select u from User u
            where u.isEnabled = true
              and (:userId is null or u.userId = :userId)
              and (:email is null or lower(u.email) like lower(concat('%', :email, '%')))
              and (:name is null or lower(concat(u.firstName, ' ', coalesce(u.secondName, ''), ' ', u.lastName))
                              like lower(concat('%', :name, '%')))
            order by u.userId asc
            """)
    List<User> searchUsers(
            @Param("userId") Integer userId,
            @Param("name") String name,
            @Param("email") String email,
            Pageable pageable
    );
}
