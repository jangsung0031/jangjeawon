package kr.co.th.Repository;

import kr.co.th.vo.WaterReservation;
import kr.co.th.vo.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface WaterRepository extends JpaRepository<WaterReservation, Long> {
    List<WaterReservation> findByUser(User user);

    @Query("""
SELECT r FROM WaterReservation r
WHERE (:search IS NULL OR r.user.username LIKE %:search%)
AND (:status IS NULL OR r.status = :status)
AND (:date IS NULL OR r.reservationDate = :date)
""")
    Page<WaterReservation> findByFilters(
            @Param("search") String search,
            @Param("status") String status,
            @Param("date") LocalDate date,
            Pageable pageable
    );
}
