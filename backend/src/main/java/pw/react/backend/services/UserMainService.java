package pw.react.backend.services;

import java.util.List;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;

import pw.react.backend.domain.User;
import pw.react.backend.repositories.UserRepository;
import pw.react.backend.exceptions.ResourceNotFoundException;

@Slf4j
@RequiredArgsConstructor
public class UserMainService implements UserService {

    private final UserRepository repository;

    @Override
    public User saveUser(User user) {
        return repository.save(user);
    }
    @Override
    public User updateUser(Long userId, User updatedUser) throws ResourceNotFoundException {
        if (repository.existsById(userId)) {
            updatedUser.setId(userId);
            User result = repository.save(updatedUser);
            log.info("User with id {} updated.", userId);
            return result;
        }
        throw new ResourceNotFoundException(String.format("User with id [%d] not found.", userId));
    }

    @Override
    public boolean deleteUser(Long userId) {
        boolean result = false;
        if (repository.existsById(userId)) {
            repository.deleteById(userId);
            log.info("User with id {} deleted.", userId);
            result = true;
        }
        return result;
    }

    @Override
    public Optional<User> getById(Long userId) {
        return repository.findById(userId);
    }

    @Override
    public List<User> getAll() {
        return repository.findAll();
    }

    @Override
    public List<User> getUsersPage(int pageNumber, int pageSize) {
        int defaultPageSize = 10;
        return repository.findAll(PageRequest.of(pageNumber, pageSize == 0 ? defaultPageSize : pageSize)).getContent();
    }
}
