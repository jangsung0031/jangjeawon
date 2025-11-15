package kr.co.th.Controller;

import jakarta.servlet.http.HttpServletRequest;
import kr.co.th.Repository.UserRepository;
import kr.co.th.dto.QnARequestDto;
import kr.co.th.dto.QnAAnswerDto;
import kr.co.th.dto.QnAResponseDto;
import kr.co.th.util.JwtUtil;
import kr.co.th.vo.QnA;
import kr.co.th.Service.QnAService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/qna")
@RequiredArgsConstructor
public class QnAController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    private final QnAService qnAService;

    @PostMapping
    public QnA createQnA(@RequestBody QnARequestDto dto) {
        return qnAService.createQnA(dto);
    }

    @GetMapping("/answered")
    public List<QnA> getAnsweredList() {
        return qnAService.getAnsweredList();
    }

    @GetMapping("/pending")
    public List<QnA> getPendingList() {
        return qnAService.getPendingList();
    }

    @PutMapping("/answer")
    public QnA answerQnA(@RequestBody QnAAnswerDto dto) {
        return qnAService.answerQnA(dto);
    }

    @GetMapping("/{id}")
    public QnA getDetail(@PathVariable Long id) {
        return qnAService.getDetail(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQna(@PathVariable Long id) {
        qnAService.deleteQnA(id);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/my")
    public ResponseEntity<?> getMyQnAs(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String userId = jwtUtil.validateAndGetSubject(token);
        String username = userRepository.findByUserid(userId).orElseThrow().getUsername();

        List<QnA> qnaList = qnAService.getMyQnAList(username);

        List<QnAResponseDto> result = qnaList.stream()
                .map(QnAResponseDto::fromEntity)
                .toList();

        return ResponseEntity.ok(result);
    }
}
