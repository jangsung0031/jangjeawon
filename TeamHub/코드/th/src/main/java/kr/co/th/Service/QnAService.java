package kr.co.th.Service;

import kr.co.th.dto.QnARequestDto;
import kr.co.th.dto.QnAAnswerDto;
import kr.co.th.vo.QnA;
import kr.co.th.vo.QnA.QnAStatus;
import kr.co.th.Repository.QnARepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QnAService {

    private final QnARepository qnARepository;

    public QnA createQnA(QnARequestDto dto) {
        QnA qna = QnA.builder()
                .category(dto.getCategory())
                .title(dto.getTitle())
                .content(dto.getContent())
                .username(dto.getUsername())
                .createdAt(LocalDateTime.now())
                .status(QnAStatus.PENDING)
                .isPrivate(dto.getIsPrivate())
                .build();
        return qnARepository.save(qna);
    }

    public List<QnA> getAnsweredList() {
        return qnARepository.findByStatus(QnAStatus.ANSWERED);
    }

    public List<QnA> getPendingList() {
        return qnARepository.findByStatus(QnAStatus.PENDING);
    }

    public QnA answerQnA(QnAAnswerDto dto) {
        QnA qna = qnARepository.findById(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("QnA not found"));
        qna.setAnswer(dto.getAnswer());
        qna.setAnsweredAt(LocalDateTime.now());
        qna.setStatus(QnAStatus.ANSWERED);
        return qnARepository.save(qna);
    }

    public QnA getDetail(Long id) {
        return qnARepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("QnA not found"));
    }

    public void deleteQnA(Long id) {
        qnARepository.deleteById(id);
    }

    public List<QnA> getMyQnAList(String username) {
        return qnARepository.findByUsernameOrderByCreatedAtDesc(username);
    }

}
