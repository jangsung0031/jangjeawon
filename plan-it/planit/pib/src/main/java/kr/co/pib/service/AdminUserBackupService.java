package kr.co.pib.service;

import kr.co.pib.dto.UserDetailDTO;
import kr.co.pib.dto.UserSummaryDTO;
import kr.co.pib.entity.UserBackup;
import kr.co.pib.repository.UserBackupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserBackupService {

    private final UserBackupRepository userBackupRepository;

    /** ✅ 탈퇴 회원 목록 (user_backup 기준) */
    public Page<UserSummaryDTO> findWithdrawnUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "deletedAt"));
        Page<UserBackup> result = userBackupRepository.findAllByOrderByDeletedAtDesc(pageable);

        return result.map(u -> new UserSummaryDTO(
                u.getUid(),
                u.getName(),
                u.getId(),
                u.getOriginalRegDate(), // 가입일(백업 테이블의 original_reg_date)
                u.getDeletedAt()        // 탈퇴일
        ));
    }

    /** ✅ 탈퇴 회원 상세 (user_backup 기준) */
    public UserDetailDTO findWithdrawnUserDetail(Long uid) {
        UserBackup u = userBackupRepository.findById(uid)
                .orElseThrow(() -> new RuntimeException("해당 탈퇴 회원을 찾을 수 없습니다."));

        return new UserDetailDTO(
                u.getUid(),
                u.getName(),
                u.getId(),
                u.getEmail(),
                u.getNickname(),
                u.getPhone(),
                u.getBirthdate(),
                u.getOriginalRegDate(),
                u.getDeletedAt()
        );
    }
}
