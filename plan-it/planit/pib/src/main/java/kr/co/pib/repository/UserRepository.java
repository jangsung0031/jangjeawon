package kr.co.pib.repository;

import kr.co.pib.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsById(String id);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);
    boolean existsByPhone(String phone);
    boolean existsByName(String name);

    Optional<User> findByIdAndPhone(String id, String phone);
    Optional<User> findByNameAndPhone(String name, String phone);
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    Optional<User> findByUid(Long uid);

}
