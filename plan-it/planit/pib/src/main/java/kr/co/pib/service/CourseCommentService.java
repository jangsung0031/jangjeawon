package kr.co.pib.service;

import kr.co.pib.dto.CommentDto;
import kr.co.pib.dto.NewCommentReq;
import kr.co.pib.dto.UpdateCommentReq;
import kr.co.pib.entity.CourseComment;
import kr.co.pib.entity.User;
import kr.co.pib.repository.CourseCommentRepository;
import kr.co.pib.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseCommentService {

    private static final String HIDDEN_MESSAGE = "신고로 인해 숨겨진 댓글입니다.";

    private final CourseCommentRepository commentRepo;
    private final UserRepository userRepo;

    @Transactional
    public void create(Long courseId, Long userId, NewCommentReq req) {
        if (req == null || req.getContent() == null || req.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("내용이 없습니다.");
        }
        User u = userRepo.findById(userId).orElseThrow(() -> new IllegalStateException("사용자 없음"));

        CourseComment c = CourseComment.builder()
                .courseId(courseId)
                .userId(userId)
                .authorNickname(u.getNickname())
                .content(req.getContent().trim())
                .build();

        commentRepo.save(c);
    }

    @Transactional(readOnly = true)
    public Page<CommentDto> list(Long courseId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page,0), Math.max(size,1), Sort.by(Sort.Direction.DESC, "id"));

        return commentRepo.findByCourseIdOrderByIdDesc(courseId, pageable)
                .map(c -> {
                    // 숨김이면 본문을 안내 문구로 대체해서 내려줌
                    String content = c.isHidden() ? HIDDEN_MESSAGE : c.getContent();
                    return new CommentDto(
                            c.getId(),
                            c.getAuthorNickname(),
                            content,
                            c.getCreatedAt(),
                            c.isHidden()        // ★ 5번째 인자 추가
                    );
                    // 또는: return CommentDto.from(c);  // from에서 content를 바꾸고 싶다면 from를 수정
                });
    }

    @Transactional
    public void update(Long courseId, Long commentId, Long userId, UpdateCommentReq req) {
        if (req == null || req.getContent() == null || req.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("내용이 없습니다.");
        }
        CourseComment c = commentRepo.findById(commentId)
                .orElseThrow(() -> new IllegalStateException("댓글을 찾을 수 없습니다."));
        if (!c.getCourseId().equals(courseId)) {
            throw new IllegalArgumentException("코스 ID가 일치하지 않습니다.");
        }
        if (!c.getUserId().equals(userId)) {
            throw new AccessDeniedException("수정 권한이 없습니다.");
        }
        if (c.isHidden()) {
            throw new AccessDeniedException("숨김 처리된 댓글은 수정할 수 없습니다.");
        }
        c.setContent(req.getContent().trim());
    }

    @Transactional
    public void delete(Long courseId, Long commentId, Long userId) {
        CourseComment c = commentRepo.findById(commentId)
                .orElseThrow(() -> new IllegalStateException("댓글을 찾을 수 없습니다."));
        if (!c.getCourseId().equals(courseId)) {
            throw new IllegalArgumentException("코스 ID가 일치하지 않습니다.");
        }
        if (!c.getUserId().equals(userId)) {
            throw new AccessDeniedException("삭제 권한이 없습니다.");
        }
        commentRepo.delete(c);
    }
}
