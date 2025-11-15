package kr.co.pib.service;

import kr.co.pib.dto.UserDetailDTO;
import kr.co.pib.dto.UserSummaryDTO;
import kr.co.pib.entity.User;
import kr.co.pib.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    /** ✅ 활성 회원 목록 (User 테이블 = 활성만, deletedAt 없음) */
    public Page<UserSummaryDTO> findUsers(int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "regDate").and(Sort.by(Sort.Direction.DESC, "uid"))
        );

        // 👉 User에는 deletedAt 컬럼이 없으므로 전체 조회
        Page<User> result = userRepository.findAll(pageable);

        return result.map(u -> new UserSummaryDTO(
                u.getUid(),
                u.getName(),
                u.getId(),
                u.getRegDate(),
                null // 🔴 활성 회원 목록에서는 탈퇴일 없음
        ));
    }

    /** ✅ 회원 상세 */
    public UserDetailDTO findUserDetail(Long uid) {
        User u = userRepository.findByUid(uid)
                .orElseThrow(() -> new RuntimeException("해당 회원을 찾을 수 없습니다."));

        return new UserDetailDTO(
                u.getUid(),
                u.getName(),
                u.getId(),
                u.getEmail(),
                u.getNickname(),
                u.getPhone(),
                u.getBirthdate(),
                u.getRegDate(),
                null // 🔴 User 상세에도 deletedAt 없음
        );
    }
}
