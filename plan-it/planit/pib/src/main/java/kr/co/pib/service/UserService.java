package kr.co.pib.service;

import jakarta.transaction.Transactional;
import kr.co.pib.dto.LoginResponseDTO;
import kr.co.pib.dto.UserLoginRequest;
import kr.co.pib.dto.UserSignupRequest;
import kr.co.pib.entity.AiConversation;
import kr.co.pib.entity.User;
import kr.co.pib.entity.UserBackup;
import kr.co.pib.repository.*;
import kr.co.pib.repository.tour.TourUserActionsRepository;
import kr.co.pib.util.BeanUtil;
import kr.co.pib.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final TourCourseRepository tourCourseRepository;
    private final CourseCommentRepository courseCommentRepository;
    private final CourseRatingRepository courseRatingRepository;
    private final CommentReportRepository commentReportRepository;
    private final TourUserActionsRepository TourUserActionsRepository;

    /** 외부에서 이메일 인증 여부 확인용 */
    public boolean isEmailVerified(String email) {
        return emailService.isVerified(email);
    }

    /** 회원가입 */
    public void signup(UserSignupRequest request) {
        if (userRepository.existsById(request.getId())) {
            throw new RuntimeException("이미 사용 중인 ID입니다.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다."); // 'email' 키워드로 프론트 분기 가능
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("이미 사용 중인 전화번호입니다."); // 'phone' 키워드로 프론트 분기 가능
        }

        User user = User.builder()
                .uid(null) // PK가 auto-increment(Long)라면 null로 두면 됨
                .id(request.getId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .nickname(request.getNickname())
                .birthdate(request.getBirthdate())
                .role("USER")
                .build();

        userRepository.save(user);
    }

    /** 로그인: id 또는 email로 식별 가능 */
    public LoginResponseDTO login(UserLoginRequest request) {
        User user = userRepository.findById(request.getId())
                .orElseGet(() -> userRepository.findByEmail(request.getId())
                        .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다.")));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        return issueLoginResponse(user);
    }

    /** 토큰 발급 응답 */
    public LoginResponseDTO issueLoginResponse(User user) {
        String role = user.getRole();
        String nickname = user.getNickname();
        String token = jwtUtil.generateToken(user.getId(), role, nickname); // nickname 포함
        return new LoginResponseDTO(token, role, nickname);
    }

    /** 비밀번호 재설정 */
    public void resetPassword(String id, String phone, String newPassword) {
        User user = userRepository.findByIdAndPhone(id, phone)
                .orElseThrow(() -> new RuntimeException("정보 불일치"));

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("기존 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // 중복 체크 편의 메서드
    public boolean isNicknameDuplicate(String nickname) { return userRepository.existsByNickname(nickname); }
    public boolean isEmailDuplicate(String email) { return userRepository.existsByEmail(email); }
    public boolean isPhoneDuplicate(String phone) { return userRepository.existsByPhone(phone); }

    @Transactional
    public void deleteUser(String loginId) {
        User user = userRepository.findById(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Long uid = user.getUid();

        // 1️⃣ 회원 백업 (이미 존재하던 로직)
        UserBackup backupUser = UserBackup.from(user);
        UserBackupRepository userBackupRepository = BeanUtil.getBean(UserBackupRepository.class);
        userBackupRepository.save(backupUser);

        // 2️⃣ AI 대화 / 메시지 삭제
        AiConversationRepository aiConversationRepo = BeanUtil.getBean(AiConversationRepository.class);
        AiMessageRepository aiMessageRepo = BeanUtil.getBean(AiMessageRepository.class);

        List<AiConversation> conversations = aiConversationRepo.findByUserOrderByCreatedAtDesc(user);
        for (AiConversation conversation : conversations) {
            aiMessageRepo.deleteAllByConversation(conversation);
        }
        if (!conversations.isEmpty()) aiConversationRepo.deleteAll(conversations);

        // 3️⃣ 코스 / 댓글 / 별점 / 신고 삭제 추가
        TourCourseRepository tourCourseRepository = BeanUtil.getBean(TourCourseRepository.class);
        CourseCommentRepository courseCommentRepository = BeanUtil.getBean(CourseCommentRepository.class);
        CourseRatingRepository courseRatingRepository = BeanUtil.getBean(CourseRatingRepository.class);
        CommentReportRepository commentReportRepository = BeanUtil.getBean(CommentReportRepository.class);
        TourCoursePlaceRepository tourCoursePlaceRepository = BeanUtil.getBean(TourCoursePlaceRepository.class);  // ✅ 추가
        TourUserActionsRepository tourUserActionsRepository = BeanUtil.getBean(TourUserActionsRepository.class);  // ✅ 추가

        // 내가 남긴 별점(리뷰)
        courseRatingRepository.deleteByUserUid(uid);

        // 내가 남긴 댓글 → 신고 → 댓글 삭제
        var myCommentIds = courseCommentRepository.findIdsByUserUid(uid);
        if (!myCommentIds.isEmpty()) {
            commentReportRepository.deleteByCommentIdIn(myCommentIds);
            courseCommentRepository.deleteByUserUid(uid);
        }

        // ✅ 내가 누른 여행지 좋아요 / 즐겨찾기 삭제
        tourUserActionsRepository.deleteByUserUid(uid);

        // 내가 만든 코스 → 코스에 달린 댓글/별점/신고 → 장소 → 코스 삭제
        var myCourseIds = tourCourseRepository.findIdsByAuthorUid(uid);
        if (!myCourseIds.isEmpty()) {
            var commentIdsOnMyCourses = courseCommentRepository.findIdsByCourseIdIn(myCourseIds);
            if (!commentIdsOnMyCourses.isEmpty()) {
                commentReportRepository.deleteByCommentIdIn(commentIdsOnMyCourses);
                courseCommentRepository.deleteByCourseIdIn(myCourseIds);
            }
            courseRatingRepository.deleteByCourseIdIn(myCourseIds);

            // ✅ 장소 먼저 삭제 (FK 보호)
            tourCoursePlaceRepository.deleteByCourseIds(myCourseIds);

            // 마지막 코스 삭제
            tourCourseRepository.deleteByAuthorUid(uid);
        }

        // 내가 신고한 기록 정리
        commentReportRepository.deleteByReporterId(uid);

        // 4️⃣ 마지막으로 사용자 삭제
        userRepository.delete(user);
    }


}
