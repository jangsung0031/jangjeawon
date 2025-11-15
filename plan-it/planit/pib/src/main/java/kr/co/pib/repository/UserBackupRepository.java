package kr.co.pib.repository;

import kr.co.pib.entity.UserBackup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBackupRepository extends JpaRepository<UserBackup, Long> {
    // 탈퇴일 내림차순
    Page<UserBackup> findAllByOrderByDeletedAtDesc(Pageable pageable);
}
