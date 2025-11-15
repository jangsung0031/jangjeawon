package kr.co.th.Repository;

import kr.co.th.vo.QnA;
import kr.co.th.vo.QnA.QnAStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QnARepository extends JpaRepository<QnA, Long> {

    List<QnA> findByStatus(QnAStatus status);

    List<QnA> findByUsernameOrderByCreatedAtDesc(String username);
}
