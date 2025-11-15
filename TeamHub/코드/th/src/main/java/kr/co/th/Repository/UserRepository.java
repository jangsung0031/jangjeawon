package kr.co.th.Repository;

import kr.co.th.vo.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserid(String userid);
    Optional<User> findByUsernameAndTel(String username, String tel);
}
