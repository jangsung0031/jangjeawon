package kr.co.pib.repository;

import jakarta.transaction.Transactional;
import kr.co.pib.entity.AiConversation;
import kr.co.pib.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {

    List<AiConversation> findByUserOrderByCreatedAtDesc(User user);

    @Transactional
    void deleteByUser(User user);
}