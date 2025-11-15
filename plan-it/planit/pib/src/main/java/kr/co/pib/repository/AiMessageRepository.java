package kr.co.pib.repository;

import jakarta.transaction.Transactional;
import kr.co.pib.entity.AiConversation;
import kr.co.pib.entity.AiMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiMessageRepository extends JpaRepository<AiMessage, Long> {

    /**
     * 특정 대화방의 모든 메시지를 시간 오름차순으로 정렬하여 조회합니다.
     */
    List<AiMessage> findByConversationOrderByDatetimeAsc(AiConversation conversation);
    List<AiMessage> findTop10ByConversationOrderByDatetimeAsc(AiConversation conversation);

    @Transactional
    void deleteAllByConversation(AiConversation conversation);
}